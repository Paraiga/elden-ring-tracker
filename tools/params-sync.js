#!/usr/bin/env node
/**
 * params-sync.js — fill the weapon columns that come from the game's own
 * EquipParamWeapon, rather than from the wiki.
 *
 *   node tools/params-sync.js           use the cached dump
 *   node tools/params-sync.js --refetch download the dump again
 *   node tools/params-sync.js --dry     report, write nothing
 *
 * Source: a regulation.bin dump at patch 1.14 (post-DLC) published by the
 * elden-ring-aow-calculator project. Scaling grades and requirement numbers are
 * invisible when wrong — nothing downstream can tell a B that should be an A —
 * so they are taken from the params and never from recall. The dump also ships
 * the game's own coefficient-to-letter thresholds, so even the grade
 * boundaries are data.
 *
 * The reconciliation below is the reason to trust it: the dump must yield
 * exactly the weapon list index.html already has, with nothing left over on
 * either side. If a future dump disagrees, reconcile before importing rather
 * than assuming the newer file is right.
 */
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML = path.join(ROOT, "index.html");
const CACHE = path.join(__dirname, ".regulation-1.14.json");
const URL = "https://raw.githubusercontent.com/Impossiblefella/elden-ring-aow-calculator"
  + "/master/packages/server/src/data/regulation-vanilla-v1.14.json";

const REFETCH = process.argv.includes("--refetch");
const DRY = process.argv.includes("--dry");

/** EquipParamWeapon.weaponType. Names as the game's own enum has them. */
const WEAPON_TYPE = {
  1: "Dagger", 3: "Straight Sword", 5: "Greatsword", 7: "Colossal Sword",
  9: "Curved Sword", 11: "Curved Greatsword", 13: "Katana", 14: "Twinblade",
  15: "Thrusting Sword", 16: "Heavy Thrusting Sword", 17: "Axe", 19: "Greataxe",
  21: "Hammer", 23: "Great Hammer", 24: "Flail", 25: "Spear", 28: "Great Spear",
  29: "Halberd", 31: "Reaper", 35: "Fist", 37: "Claw", 39: "Whip",
  41: "Colossal Weapon", 50: "Light Bow", 51: "Bow", 53: "Greatbow",
  55: "Crossbow", 56: "Ballista", 57: "Glintstone Staff", 59: "Dual Catalyst",
  61: "Sacred Seal", 65: "Small Shield", 67: "Medium Shield", 69: "Greatshield",
  87: "Torch", 88: "Hand-to-Hand", 89: "Perfume Bottle", 90: "Thrusting Shield",
  91: "Throwing Blade", 92: "Backhand Blade", 93: "Light Greatsword",
  94: "Great Katana", 95: "Beast Claw"
};
const STATUS = { 5: "Poison", 6: "Scarlet Rot", 7: "Bleed", 8: "Frost", 9: "Sleep", 10: "Madness", 11: "Death Blight" };
const ATTRS = ["str", "dex", "int", "fai", "arc"];

const AFFINITY_STANDARD = 0;   // infusible: accepts an Ash of War and an affinity
const AFFINITY_UNIQUE = -1;    // unique: fixed skill, somber stones

function download(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": "elden-ring-tracker/1.0" } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return download(r.headers.location).then(res, rej);
      }
      if (r.statusCode !== 200) return rej(new Error("HTTP " + r.statusCode));
      let s = "";
      r.on("data", d => s += d);
      r.on("end", () => res(s));
    }).on("error", rej);
  });
}

function splitCsv(line) {
  const out = [];
  let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
const qcsv = v => {
  const s = String(v == null ? "" : v);
  return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};

(async () => {
  if (REFETCH || !fs.existsSync(CACHE)) {
    console.log("downloading regulation dump...");
    fs.writeFileSync(CACHE, await download(URL));
  }
  const reg = JSON.parse(fs.readFileSync(CACHE, "utf8"));
  console.log("patch", reg.patchId, "| scaling tiers:",
    reg.scalingTiers.map(t => t.label + ">=" + t.min).join(" "));

  const grade = v => {
    if (!v || v < 0.01) return "-";
    const t = reg.scalingTiers.find(t => v >= t.min);
    return t ? t.label : "-";
  };

  // Standard plus unique only. The other twelve affinities are the same weapon
  // re-rolled; a build names "Uchigatana", never "Keen Uchigatana" as a
  // separate item, and keeping them would make this 3,216 rows.
  const params = {};
  reg.weapons
    .filter(w => (w.affinityId === AFFINITY_STANDARD || w.affinityId === AFFINITY_UNIQUE)
                 && w.name && w.name !== "Unarmed")
    .forEach(w => {
      const rt = reg.reinforceTypes[w.reinforceTypeId];
      const top = Array.isArray(rt) ? rt[rt.length - 1] : null;
      let passive = "";
      (w.statusSpEffectParamIds || []).filter(Boolean).forEach(id => {
        const p = reg.statusSpEffectParams[id];
        if (!p) return;
        Object.keys(p).forEach(k => { if (STATUS[k]) passive = STATUS[k] + " " + p[k]; });
      });
      params[w.name] = {
        category: WEAPON_TYPE[w.weaponType] || "",
        maxUpgrade: Array.isArray(rt) ? String(rt.length - 1) : "",
        infusible: w.affinityId === AFFINITY_STANDARD ? "yes" : "no",
        passive: passive,
        req: ATTRS.map(a => String((w.requirements && w.requirements[a]) || 0)),
        // scaling at max upgrade: base coefficient times the top reinforce row
        scale: ATTRS.map(a => grade(((w.attributeScaling && w.attributeScaling[a]) || 0) *
          ((top && top.attributeScaling && top.attributeScaling[a]) || 1)))
      };
    });

  let html = fs.readFileSync(HTML, "utf8");
  const NL = html.includes("\r\n") ? "\r\n" : "\n";
  const m = html.match(/weapons: `([\s\S]*?)`,/);
  if (!m) throw new Error("no weapons table in index.html");
  const lines = m[1].split(/\r?\n/).filter(Boolean);
  const head = splitCsv(lines[0]);
  const rows = lines.slice(1).map(l => {
    const cells = splitCsv(l);
    const r = {};
    head.forEach((c, i) => r[c] = cells[i] || "");
    return r;
  });

  // ---- reconcile before importing anything ----
  const ours = new Set(rows.map(r => r.name));
  const theirs = new Set(Object.keys(params));
  const onlyOurs = [...ours].filter(n => !theirs.has(n));
  const onlyTheirs = [...theirs].filter(n => !ours.has(n));
  console.log("weapons: ours", ours.size, "| params", theirs.size,
    "| only ours", onlyOurs.length, "| only params", onlyTheirs.length);
  if (onlyOurs.length) console.log("  only ours:", onlyOurs.join(", "));
  if (onlyTheirs.length) console.log("  only params:", onlyTheirs.join(", "));
  if (onlyOurs.length || onlyTheirs.length) {
    console.error("\nREFUSING to write: the two lists disagree. Reconcile first.");
    process.exit(1);
  }

  const COLS = ["category", "maxUpgrade", "infusible", "reqStr", "reqDex", "reqInt", "reqFai",
                "reqArc", "scaleStr", "scaleDex", "scaleInt", "scaleFai", "scaleArc", "passive"];
  let changed = 0;
  rows.forEach(r => {
    const p = params[r.name];
    const before = COLS.map(c => r[c]).join("|");
    r.category = p.category;
    r.maxUpgrade = p.maxUpgrade;
    r.infusible = p.infusible;
    r.passive = p.passive;
    ["Str", "Dex", "Int", "Fai", "Arc"].forEach((s, i) => {
      r["req" + s] = p.req[i];
      r["scale" + s] = p.scale[i];
    });
    if (COLS.map(c => r[c]).join("|") !== before) changed++;
  });
  console.log("rows whose param columns changed:", changed);
  console.log("infusible:", rows.filter(r => r.infusible === "yes").length,
    "| unique:", rows.filter(r => r.infusible === "no").length);

  if (DRY) { console.log("--dry: nothing written"); return; }

  // keep whatever column order index.html already declares, adding new ones
  const cols = head.slice();
  COLS.forEach(c => { if (cols.indexOf(c) < 0) cols.splice(cols.indexOf("maxUpgrade") + 1, 0, c); });
  const body = rows.map(r => cols.map(c => qcsv(r[c])).join(",")).join(NL);
  const start = html.indexOf("weapons: `");
  const end = html.indexOf("`,", start) + 2;
  html = html.slice(0, start) + "weapons: `" + cols.join(",") + NL + body + "`," + html.slice(end);
  fs.writeFileSync(HTML, html);
  console.log("wrote index.html");
})().catch(e => { console.error(e); process.exit(1); });
