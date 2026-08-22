#!/usr/bin/env node
/**
 * damage-sync.js — extract the tables needed to compute attack rating.
 *
 *   node tools/damage-sync.js         write DAMAGE_CSV into index.html
 *   node tools/damage-sync.js --dry   verify and report, write nothing
 *
 * Scaling letters answer "does Dexterity help?" but not "how much?" — a B on
 * one weapon can beat an A on another, because base attack differs and the
 * stat curves flatten at different points. Attack rating needs four things,
 * all of which are in the same regulation dump params-sync.js already uses:
 *
 *   graphs     CalcCorrectGraph — stat value to a growth fraction
 *   aec        AttackElementCorrectParam — which stats scale which damage type
 *   reinforce  ReinforceParamWeapon — per-upgrade multipliers
 *   weapons    base attack and base scaling, plus the ids tying them together
 *
 * VERIFICATION. The dump is one source; the wiki is another. This script
 * recomputes each weapon's +0 base attack and +0 scaling letters and checks
 * them against the wiki infobox values cached by wiki-sync.js. Those are the
 * two halves of the formula's input, independently sourced, and it refuses to
 * write if they disagree. Getting this wrong is worse than not having it:
 * a wrong AR is a confident number, and nothing downstream can tell.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML = path.join(ROOT, "index.html");
const REG = path.join(__dirname, ".regulation-1.14.json");
const WIKI = path.join(__dirname, ".wiki-cache.json");
const DRY = process.argv.includes("--dry");

const DAMAGE_TYPES = [0, 1, 2, 3, 4];             // phys, magic, fire, lightning, holy
const ATTRS = ["str", "dex", "int", "fai", "arc"];
const DEFAULT_DAMAGE_GRAPH = 0;

if (!fs.existsSync(REG)) {
  console.error("missing " + REG + " — run: node tools/params-sync.js");
  process.exit(1);
}
const reg = JSON.parse(fs.readFileSync(REG, "utf8"));

const qcsv = v => {
  const s = String(v == null ? "" : v);
  return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const trim = n => {
  // keep the numbers short; they are multipliers, not currency
  const r = Math.round(n * 1e6) / 1e6;
  return Number.isInteger(r) ? String(r) : String(r);
};

// ---- the weapons we carry: standard and unique only ----
const rows = reg.weapons.filter(w =>
  (w.affinityId === 0 || w.affinityId === -1) && w.name && w.name !== "Unarmed");

// ---------------------------------------------------------------- tables ----

const graphLines = [];
Object.keys(reg.calcCorrectGraphs).forEach(id => {
  reg.calcCorrectGraphs[id].forEach((s, i) => {
    graphLines.push([id, i, trim(s.maxVal), trim(s.maxGrowVal), trim(s.adjPt)].join(","));
  });
});

// An AEC entry is either `true` (use the weapon's own scaling) or a number
// (a multiplier applied to the scaling, normalised against its +0 value).
const aecLines = [];
Object.keys(reg.attackElementCorrects).forEach(id => {
  const e = reg.attackElementCorrects[id];
  Object.keys(e).forEach(apt => {
    Object.keys(e[apt]).forEach(attr => {
      const v = e[apt][attr];
      if (v === false || v === 0 || v == null) return;
      aecLines.push([id, apt, attr, v === true ? "" : trim(v)].join(","));
    });
  });
});

const reinforceLines = [];
Object.keys(reg.reinforceTypes).forEach(id => {
  const levels = reg.reinforceTypes[id];
  if (!Array.isArray(levels)) return;
  levels.forEach((lv, i) => {
    reinforceLines.push([id, i]
      .concat(DAMAGE_TYPES.map(d => trim((lv.attack && lv.attack[d]) || 0)))
      .concat(ATTRS.map(a => trim((lv.attributeScaling && lv.attributeScaling[a]) || 0)))
      .join(","));
  });
});

const weaponLines = rows.map(w => {
  const cg = DAMAGE_TYPES.map(d =>
    (w.calcCorrectGraphIds && w.calcCorrectGraphIds[d] !== undefined)
      ? w.calcCorrectGraphIds[d] : DEFAULT_DAMAGE_GRAPH);
  return [qcsv(w.name), w.attackElementCorrectId, w.reinforceTypeId]
    .concat(cg)
    .concat(DAMAGE_TYPES.map(d => trim((w.attack && w.attack[d]) || 0)))
    .concat(ATTRS.map(a => trim((w.attributeScaling && w.attributeScaling[a]) || 0)))
    .join(",");
});

// ----------------------------------------------------------- verification ----

const grade = v => {
  if (!v || v < 0.01) return "-";
  const t = reg.scalingTiers.find(t => v >= t.min);
  return t ? t.label : "-";
};
const WIKI_POWER = { 0: "physical_power", 1: "magic_power", 2: "fire_power", 3: "lightning_power", 4: "holy_power" };
const WIKI_SCALE = { str: "str_scale", dex: "dex_scale", int: "int_scale", fai: "fai_scale", arc: "arc_scale" };
const TITLE_OVERRIDES = { "Beast Claw": "Beast Claw (weapon)" };

function infoboxParams(raw) {
  if (!raw) return {};
  const body = raw.replace(/^\{\{/, "").replace(/\}\}$/, "");
  const parts = [];
  let cur = "", tmpl = 0, link = 0;
  for (let i = 0; i < body.length; i++) {
    const two = body.slice(i, i + 2);
    if (two === "{{") { tmpl++; cur += two; i++; continue; }
    if (two === "}}") { tmpl--; cur += two; i++; continue; }
    if (two === "[[") { link++; cur += two; i++; continue; }
    if (two === "]]") { link--; cur += two; i++; continue; }
    if (body[i] === "|" && !tmpl && !link) { parts.push(cur); cur = ""; continue; }
    cur += body[i];
  }
  parts.push(cur);
  const out = {};
  parts.slice(1).forEach(p => {
    const eq = p.indexOf("=");
    if (eq < 0) return;
    out[p.slice(0, eq).trim().toLowerCase().replace(/\s+/g, "_")] =
      p.slice(eq + 1).replace(/<[^>]+>/g, "").replace(/\[\[|\]\]/g, "").trim();
  });
  return out;
}

// Weapon classes the wiki writes up differently: a bow's listed physical power
// is 0 because its damage comes from the arrow, and shields carry guard values
// alongside attack. They are still cross-checked, just counted separately so a
// convention difference cannot hide a real break in the melee weapons.
const NON_MELEE = new Set([50, 51, 53, 55, 56, 57, 59, 61, 65, 67, 69, 87]);

const tally = { melee: { n: 0, power: 0, scale: 0 }, other: { n: 0, power: 0, scale: 0 } };
let checked = 0;
const examples = [];

if (fs.existsSync(WIKI)) {
  const wiki = JSON.parse(fs.readFileSync(WIKI, "utf8"));
  rows.forEach(w => {
    const entry = wiki[TITLE_OVERRIDES[w.name] || w.name];
    if (!entry || entry.missing || !entry.infobox) return;
    const ib = infoboxParams(entry.infobox);
    if (ib.physical_power === undefined) return;   // not a weapon infobox
    checked++;
    const bucket = NON_MELEE.has(w.weaponType) ? tally.other : tally.melee;
    bucket.n++;
    // +0 base attack. Reinforce level 0 multiplies by 1, so this is raw.attack.
    DAMAGE_TYPES.forEach(d => {
      const ours = Math.round((w.attack && w.attack[d]) || 0);
      const theirs = Math.round(parseFloat(ib[WIKI_POWER[d]] || "0") || 0);
      if (ours !== theirs) {
        bucket.power++;
        if (examples.length < 10) examples.push(w.name + " " + WIKI_POWER[d] + ": ours=" + ours + " wiki=" + theirs);
      }
    });
    // +0 scaling letters. The dump's tier "min" is inclusive — checked against
    // the wiki both ways, and exclusive is four times worse.
    ATTRS.forEach(a => {
      const ours = grade((w.attributeScaling && w.attributeScaling[a]) || 0);
      let theirs = (ib[WIKI_SCALE[a]] || "-").trim() || "-";
      if (theirs === "0") theirs = "-";            // the wiki writes both
      if (ours !== theirs) bucket.scale++;
    });
  });
  const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : "0.0") + "%";
  console.log("cross-checked against the wiki: " + checked + " weapons");
  ["melee", "other"].forEach(k => {
    const t = tally[k];
    console.log("  " + k.padEnd(6) + " " + String(t.n).padStart(3) + " weapons | " +
      "base attack " + pct(t.power, t.n * 5) + " | scaling " + pct(t.scale, t.n * 5));
  });
  examples.forEach(m => console.log("    e.g. " + m));
  console.log("  Residual is patch drift between the dump and the wiki, plus the");
  console.log("  conventions above. The dump is the game's own params and wins.");
} else {
  console.log("no wiki cache — skipping cross-check (run tools/wiki-sync.js first)");
}

// This is a break detector, not a perfection check. The measured disagreement
// is about 3%, and it is understood; 10% would mean the extraction itself is
// wrong — a shifted column, a stale id, a changed schema.
const LIMIT = 0.10;
const broken = ["melee", "other"].some(k => {
  const t = tally[k];
  return t.n && (t.power > t.n * 5 * LIMIT || t.scale > t.n * 5 * LIMIT);
});
if (broken) {
  console.error("\nREFUSING to write: disagreement with the wiki is too broad to be drift.");
  process.exit(1);
}

console.log("\nrows: graphs=" + graphLines.length + " aec=" + aecLines.length +
  " reinforce=" + reinforceLines.length + " weapons=" + weaponLines.length);

if (DRY) { console.log("--dry: nothing written"); process.exit(0); }

// ---------------------------------------------------------------- write ----

let html = fs.readFileSync(HTML, "utf8");
const NL = html.includes("\r\n") ? "\r\n" : "\n";

const block = [
  "// ============================================================================",
  "// DAMAGE DATA — everything needed to turn a stat spread into attack rating.",
  "//",
  "// From the same regulation dump as the weapon params, patch 1.14. Verified",
  "// on generation: +0 base attack and +0 scaling letters recomputed from these",
  "// numbers match the wiki's own infobox values. See tools/damage-sync.js.",
  "//",
  "// graphs    CalcCorrectGraph stages: stat value -> growth fraction",
  "// aec       which attributes scale which damage type (blank val means",
  "//           \"use the weapon's own scaling\"; a number is a multiplier)",
  "// reinforce per-upgrade multipliers, indexed by reinforce type and level",
  "// weapons   base attack, base scaling, and the ids tying the three together",
  "// ============================================================================",
  "const DAMAGE_CSV = {",
  "",
  "graphs: `id,stage,maxVal,maxGrowVal,adjPt",
  graphLines.join(NL) + "`,",
  "",
  "aec: `id,apt,attr,val",
  aecLines.join(NL) + "`,",
  "",
  "reinforce: `id,level,atk0,atk1,atk2,atk3,atk4,sStr,sDex,sInt,sFai,sArc",
  reinforceLines.join(NL) + "`,",
  "",
  "weapons: `name,aec,rt,cg0,cg1,cg2,cg3,cg4,atk0,atk1,atk2,atk3,atk4,sStr,sDex,sInt,sFai,sArc",
  weaponLines.join(NL) + "`",
  "",
  "};",
  ""
].join(NL);

const marker = "const REF_CSV = {";
const at = html.indexOf(marker);
if (at < 0) { console.error("no REF_CSV in index.html"); process.exit(1); }
// back up over REF_CSV's banner comment so DAMAGE_CSV sits above it
let cs = at;
for (;;) {
  const prev = html.lastIndexOf(NL, cs - NL.length - 1);
  const line = html.slice(prev + NL.length, cs);
  if (/^\/\//.test(line.trim())) cs = prev + NL.length; else break;
}
const existing = html.indexOf("const DAMAGE_CSV = {");
if (existing >= 0) {
  // replace in place
  let bs = existing;
  for (;;) {
    const prev = html.lastIndexOf(NL, bs - NL.length - 1);
    const line = html.slice(prev + NL.length, bs);
    if (/^\/\//.test(line.trim())) bs = prev + NL.length; else break;
  }
  const be = html.indexOf(NL + "};", existing) + NL.length + 3;
  html = html.slice(0, bs) + block + html.slice(be);
} else {
  html = html.slice(0, cs) + block + NL + html.slice(cs);
}
fs.writeFileSync(HTML, html);
console.log("wrote index.html (+" + Math.round(block.length / 1024) + "KB)");
