#!/usr/bin/env node
/**
 * wiki-sync.js — regenerate the reference tables in index.html from
 * eldenring.wiki.gg.
 *
 *   node tools/wiki-sync.js            reuse the cached pages, re-parse, rewrite
 *   node tools/wiki-sync.js --refetch  fetch every page again first
 *   node tools/wiki-sync.js --dry      parse and report, write nothing
 *
 * This is a build-time tool, not a runtime dependency. index.html stays a
 * single self-contained file with no build step; this only exists so the data
 * inside it can be regenerated after a patch instead of being hand-edited.
 *
 * Two rules learned the hard way, both worth keeping:
 *
 *  1. Fetch and parse are separate phases with a cache between them. The parser
 *     needs a dozen iterations to get right and the wiki should not be hit for
 *     each one.
 *  2. Parse raw wikitext deterministically. Do NOT route pages through a
 *     summarising model — that was tried once and it truncated and invented
 *     entries (see HANDOVER).
 */
"use strict";

const https = require("https");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const HTML = path.join(ROOT, "index.html");
const CACHE = path.join(__dirname, ".wiki-cache.json");
const API = "https://eldenring.wiki.gg/api.php";
const UA = "elden-ring-tracker/1.0 (personal completion tracker)";

const REFETCH = process.argv.includes("--refetch");
const DRY = process.argv.includes("--dry");

// ---------------------------------------------------------------- http ----

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { "User-Agent": UA } }, r => {
      let s = "";
      r.on("data", d => s += d);
      r.on("end", () => { try { res(JSON.parse(s)); } catch (e) { rej(new Error(s.slice(0, 200))); } });
    }).on("error", rej);
  });
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

const query = params =>
  get(API + "?format=json&" + Object.keys(params)
    .map(k => k + "=" + encodeURIComponent(params[k])).join("&"));

// ------------------------------------------------------------ wikitext ----

const isTopHeading = l => /^==(?!=).*==\s*$/.test(l);

/** A top-level == section == whose heading matches `want`. Headings embed File
 *  links containing "=", so this cannot be done with a character class. */
function section(text, want) {
  const ls = text.split("\n");
  const start = ls.findIndex(l => isTopHeading(l) && want.test(l));
  if (start < 0) return null;
  let end = start + 1;
  while (end < ls.length && !isTopHeading(ls[end])) end++;
  return ls.slice(start + 1, end).join("\n").trim();
}

/** The first {{Infobox...}}, brace-balanced so a nested template inside a
 *  parameter value does not end it early. */
function infoboxRaw(text) {
  const i = text.search(/\{\{\s*Infobox/i);
  if (i < 0) return null;
  let depth = 0;
  for (let k = i; k < text.length - 1; k++) {
    if (text[k] === "{" && text[k + 1] === "{") { depth++; k++; }
    else if (text[k] === "}" && text[k + 1] === "}") { depth--; k++; if (!depth) return text.slice(i, k + 1); }
  }
  return null;
}

const linkText = s => s
  .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
  .replace(/\[\[([^\]]+)\]\]/g, "$1");

function clean(s) {
  return linkText(String(s == null ? "" : s))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "")
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/'''?/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Infobox parameters. Splits on top-level "|" only — nested templates and
 *  [[links]] carry pipes of their own and shred the values otherwise. */
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
    out[p.slice(0, eq).trim().toLowerCase().replace(/\s+/g, "_")] = clean(p.slice(eq + 1));
  });
  return out;
}

const num = v => { const m = String(v == null ? "" : v).match(/-?\d+(\.\d+)?/); return m ? m[0] : ""; };

// -------------------------------------------------- acquisition → location ----

const LABEL_RANK = {
  "loot": 1, "guaranteed drop": 1, "boss drop": 1, "trade": 1, "quest reward": 1,
  "drop": 2, "enemy drop": 2, "reward": 2, "purchase": 2, "bell bearing": 3,
  "equipped": 5, "starting equipment": 5
};
const rankOf = l => {
  const k = l.toLowerCase().trim();
  return LABEL_RANK[k] !== undefined ? LABEL_RANK[k] : 3;
};

// "Mt. Gelmir" must not read as the end of a sentence.
const DOT = "";
function firstSentence(s, cap) {
  const held = s.replace(/\b(Mt|St|Dr|Ft|No|vs)\./g, (m, w) => w + DOT);
  const parts = held.split(/\.\s+(?=[A-Z])/);
  let out = parts[0];
  if (out.length < 25 && parts[1]) out += ". " + parts[1];
  out = out.split(DOT).join(".").replace(/\s*\.\s*$/, "");
  if (out.length > cap) out = out.slice(0, cap - 1).replace(/\s+\S*$/, "") + "…";
  return out;
}

function linksIn(s) {
  const out = [];
  s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (m, a, b) => { out.push((b || a).trim()); return m; });
  return out;
}

/** One short location in the tracker's style: "Region — Place — how". */
function parseLocation(entry) {
  const sec = entry && entry.acquisition;
  if (sec) {
    // Editors write the label four ways: '''Loot:''', '''Loot''': and either
    // wrapped in <u>. Normalise the wrappers, allow the colon on either side.
    const ls = sec.split("\n").map(l => l.replace(/<\/?[ub]>/gi, "").trim());
    const cands = [];
    ls.forEach((line, i) => {
      const m = line.match(/^'''(.+?)'''\s*:?\s*(.*)$/);
      if (!m) return;
      const label = m[1].replace(/\s*:\s*$/, "").trim();
      let rest = m[2];
      const sup = rest.match(/<sup>\s*\(([^)]*)\)\s*<\/sup>/i);
      const region = sup ? clean(sup[1]) : "";
      if (sup) rest = rest.replace(sup[0], "");
      const links = linksIn(rest);
      let place = "";
      if (links.length >= 3) place = links[0] + " and elsewhere";
      else if (links.length) place = links.join(" / ");
      else { const p = clean(rest); if (p && p.length <= 60) place = p; }
      if (!place && !region) {
        const nl = linksIn(ls[i + 1] || "");
        if (nl.length) place = nl[0];
      }
      if (place || region) cands.push({ rank: rankOf(label), label, place, region });
    });
    if (cands.length) {
      cands.sort((a, b) => a.rank - b.rank);
      const c = cands[0];
      const dupe = c.place && c.region &&
        (c.place === c.region || c.place.startsWith(c.region) || c.region.startsWith(c.place));
      const bits = [];
      if (c.region) bits.push(c.region);
      if (c.place && (!dupe || !c.region)) bits.push(c.place);
      if (bits.length) { bits.push(c.label.toLowerCase()); return bits.join(" — "); }
    }
    const prose = ls.map(l => l.replace(/^\*+\s*/, "")).map(clean)
      .filter(l => l && l.length > 15 && !/^\[[a-z]{2}:/.test(l));
    if (prose.length) return firstSentence(prose[0], 140);
  }
  if (entry && entry.location) return firstSentence(clean(entry.location), 140);
  return null;
}

// ------------------------------------------------------------------ CSV ----

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

function readTable(html, key) {
  const m = html.match(new RegExp(key + ": `([\\s\\S]*?)`,"));
  if (!m) throw new Error("no table: " + key);
  const lines = m[1].split(/\r?\n/).filter(Boolean);
  const head = splitCsv(lines[0]);
  return lines.slice(1).map(l => {
    const cells = splitCsv(l);
    const row = {};
    head.forEach((c, i) => row[c] = cells[i] || "");
    return row;
  });
}

// -------------------------------------------------------------- schema ----

const COLUMNS = {
  weapons: ["name", "category", "location", "maxUpgrade", "infusible", "reqStr", "reqDex", "reqInt",
            "reqFai", "reqArc", "scaleStr", "scaleDex", "scaleInt", "scaleFai", "scaleArc",
            "passive", "weight", "skill"],
  armor: ["name", "slot", "set", "location", "weight", "poise", "physical", "magic", "fire",
          "lightning", "holy", "immunity", "robustness", "focus", "vitality"],
  talismans: ["name", "location", "effect", "weight"],
  physick: ["name", "location", "effect"],
  spells: ["name", "category", "location", "effect", "fp", "slots", "reqInt", "reqFai", "reqArc"],
  ashes: ["name", "location", "affinity", "fp"],
  spirits: ["name", "location", "effect", "cost"]
};

const COMMENTS = {
  weapons: ["Weapons ({n}). Requirements, scaling, passive and infusible come from the",
            "game's own EquipParamWeapon at patch 1.14; scaling letters are at max upgrade,",
            "standard affinity. maxUpgrade 25 means smithing stones, 10 somber. infusible",
            "says whether it accepts an Ash of War and an affinity. Weight, skill and",
            "location are parsed from eldenring.wiki.gg."],
  armor: ["Armor ({n}) — every piece in the game, from the wiki's Head/Chest/Arms/Legs",
          "categories, with set membership from its Armor Sets page. Altered variants are",
          "omitted: they are the same piece re-tailored, not a separate item."],
  talismans: ["Talismans ({n}), with effect and weight."],
  physick: ["Crystal tears for the Flask of Wondrous Physick ({n}), with effect."],
  spells: ["Sorceries and incantations ({n}). category says which. fp is the cost, slots",
           "the memory slots, and reqInt/reqFai/reqArc what it takes to cast."],
  ashes: ["Ash of War names ({n}), with default affinity and FP cost where the wiki has one."],
  spirits: ["Spirit ashes ({n}), with summon cost."]
};

/** Pages an item's own name does not reach: disambiguations, name collisions
 *  with regions or enemies, and one spirit ash filed without its suffix. */
const TITLE_OVERRIDES = {
  "weapons|Beast Claw": "Beast Claw (weapon)",
  "spells|Beast Claw": "Beast Claw (spell)",
  "spells|Minor Erdtree": "Minor Erdtree (spell)",
  "spells|Land of Shadow": "Land of Shadow (spell)",
  "spirits|Battlemage Hugues": "Battlemage Hugues (Spirit Ash)",
  "spirits|Perfumer Tricia Ashes": "Perfumer Tricia"
};

// Ashes of War are titled with the prefix; the bare name is the Skill page.
const titleFor = (key, name) =>
  TITLE_OVERRIDES[key + "|" + name] || (key === "ashes" ? "Ash of War: " + name : name);

// ------------------------------------------------------------- armor list ----

const SLOT_OF_CATEGORY = { Head: "head", Chest: "body", Arms: "arms", Legs: "legs" };

async function armorFromWiki() {
  const slots = {};
  for (const cat of Object.keys(SLOT_OF_CATEGORY)) {
    let cont = "";
    for (;;) {
      const p = { action: "query", list: "categorymembers", cmtitle: "Category:" + cat,
                  cmlimit: "500", cmnamespace: "0" };
      if (cont) p.cmcontinue = cont;
      const j = await query(p);
      (j.query.categorymembers || []).forEach(m => {
        if (/\(Altered\)/i.test(m.title)) return;   // same piece, re-tailored
        slots[m.title] = SLOT_OF_CATEGORY[cat];
      });
      if (j.continue && j.continue.cmcontinue) cont = j.continue.cmcontinue; else break;
      await sleep(200);
    }
  }
  // Set membership: "=== [[X Set]] ===" followed by a gallery of link=Piece.
  //
  // Three traps on this page, all of which silently mis-attribute pieces to
  // the previous set rather than failing:
  //   - a DLC heading carries {{SOTE}} after the link, so the heading regex
  //     must not demand "]]" be followed straight by "===";
  //   - an "Armor Pieces" section below the sets uses identical headings for
  //     things that are not sets, so only the "Armor Sets" section counts;
  //   - "Cut Content" lists a set that is not in the game.
  // Any heading that does not parse resets the current set to null, so a miss
  // drops pieces rather than filing them under the wrong name.
  const j = await query({ action: "parse", page: "Armor Sets", prop: "wikitext" });
  const text = (j.parse && j.parse.wikitext && j.parse.wikitext["*"]) || "";
  const sets = {};
  let inSets = false, current = null;
  text.split("\n").forEach(line => {
    const h2 = line.match(/^==(?!=)\s*(.+?)\s*==\s*$/);
    if (h2) { inSets = /^armor sets$/i.test(h2[1].trim()); current = null; return; }
    if (!inSets) return;
    if (/^===/.test(line)) {
      const h3 = line.match(/^===\s*\[\[([^\]|]+)(?:\|[^\]]+)?\]\].*?===\s*$/);
      current = h3 ? h3[1].replace(/\s+Set$/i, "").trim() : null;
      return;
    }
    if (!current) return;
    const l = line.match(/link=([^|\]]+)/);
    if (l) {
      const piece = l[1].trim();
      if (!/\(Altered\)/i.test(piece) && !sets[piece]) sets[piece] = current;
    }
  });
  return Object.keys(slots).sort().map(name => ({ name, slot: slots[name], set: sets[name] || "" }));
}

// ---------------------------------------------------------------- fetch ----

async function fetchPages(jobs, cache) {
  const byTitle = {};
  jobs.forEach(j => { (byTitle[j.title] = byTitle[j.title] || []).push(j); });
  const titles = Object.keys(byTitle).filter(t => REFETCH || !cache[t]);
  if (!titles.length) return;
  for (let i = 0; i < titles.length; i += 40) {
    const batch = titles.slice(i, i + 40);
    let j;
    try {
      j = await query({ action: "query", prop: "revisions", rvprop: "content",
                        rvslots: "main", redirects: "1", titles: batch.join("|") });
    } catch (e) { console.error("  batch failed:", e.message); await sleep(2000); continue; }
    const back = {};
    (j.query.normalized || []).forEach(n => back[n.to] = n.from);
    (j.query.redirects || []).forEach(n => back[n.to] = back[n.from] || n.from);
    Object.values(j.query.pages).forEach(p => {
      const asked = back[p.title] || p.title;
      cache[asked] = p.missing !== undefined ? { missing: true } : (() => {
        const text = p.revisions[0].slots.main["*"];
        return {
          title: p.title,
          infobox: infoboxRaw(text),
          acquisition: section(text, /Acquisition/i),
          location: section(text, /^==(?!=).*Location/i)
        };
      })();
    });
    process.stdout.write("  fetched " + Math.min(i + 40, titles.length) + "/" + titles.length + "\r");
    await sleep(300);
  }
  process.stdout.write("\n");
}

// --------------------------------------------------------------- extract ----

const SLOT_FROM_TYPE = { head: "head", chest: "body", arms: "arms", legs: "legs" };

function extract(key, entry) {
  if (!entry || entry.missing) return {};
  const ib = infoboxParams(entry.infobox);
  const out = {};
  const loc = parseLocation(entry);
  if (loc) out.location = loc;

  if (key === "weapons") {
    if (ib.weight) out.weight = num(ib.weight);
    if (ib.skills) out.skill = ib.skills;
  } else if (key === "armor") {
    const slot = SLOT_FROM_TYPE[(ib.type || "").toLowerCase()];
    if (slot) out.slot = slot;
    ["weight", "poise", "physical", "magic", "fire", "lightning", "holy",
     "immunity", "robustness", "focus", "vitality"].forEach(f => { if (ib[f]) out[f] = num(ib[f]); });
  } else if (key === "talismans") {
    if (ib.item_effect) out.effect = ib.item_effect;
    if (ib.weight) out.weight = num(ib.weight);
  } else if (key === "physick") {
    if (ib.item_effect) out.effect = ib.item_effect;
  } else if (key === "spells") {
    if (ib.type) out.category = ib.type;
    if (ib.item_effect) out.effect = ib.item_effect;
    if (ib.fp_cost) out.fp = ib.fp_cost;
    if (ib.slots_used) out.slots = num(ib.slots_used);
    if (ib.int_req) out.reqInt = num(ib.int_req);
    if (ib.fai_req) out.reqFai = num(ib.fai_req);
    if (ib.arc_req) out.reqArc = num(ib.arc_req);
  } else if (key === "ashes") {
    if (ib.affinity) out.affinity = ib.affinity;
    if (ib.fp_cost) out.fp = ib.fp_cost;
  } else if (key === "spirits") {
    if (ib.item_effect) out.effect = ib.item_effect;
    if (ib.fp_cost) out.cost = num(ib.fp_cost) + " FP";
    else if (ib.hp_cost) out.cost = num(ib.hp_cost) + " HP";
  }
  return out;
}

// ------------------------------------------------------------------ main ----

(async () => {
  let html = fs.readFileSync(HTML, "utf8");
  const NL = html.includes("\r\n") ? "\r\n" : "\n";
  const cache = !REFETCH && fs.existsSync(CACHE)
    ? JSON.parse(fs.readFileSync(CACHE, "utf8")) : {};

  // Armor is rebuilt from the wiki's own categories; every other table keeps
  // the names it already has, since those are the checked reference.
  console.log("listing armor from wiki categories...");
  const armorRows = await armorFromWiki();
  console.log("  " + armorRows.length + " pieces, " +
    new Set(armorRows.map(r => r.set).filter(Boolean)).size + " sets");

  const tables = {};
  Object.keys(COLUMNS).forEach(key => {
    tables[key] = key === "armor" ? armorRows : readTable(html, key);
  });

  const jobs = [];
  Object.keys(tables).forEach(key =>
    tables[key].forEach(r => jobs.push({ key, name: r.name, title: titleFor(key, r.name) })));
  console.log("pages needed:", jobs.length);
  await fetchPages(jobs, cache);
  fs.writeFileSync(CACHE, JSON.stringify(cache));

  const report = {};
  Object.keys(tables).forEach(key => {
    const filled = {};
    let missing = 0;
    tables[key].forEach(row => {
      const entry = cache[titleFor(key, row.name)];
      if (!entry || entry.missing) { missing++; return; }
      const got = extract(key, entry);
      Object.keys(got).forEach(f => {
        if (got[f] === "" || got[f] == null) return;
        row[f] = got[f];
        filled[f] = (filled[f] || 0) + 1;
      });
    });
    report[key] = { rows: tables[key].length, filled, missing };
  });

  Object.keys(report).forEach(k => {
    const r = report[k];
    console.log("\n" + k + " (" + r.rows + " rows" + (r.missing ? ", " + r.missing + " pages missing" : "") + ")");
    Object.keys(r.filled).sort().forEach(f => console.log("   " + f.padEnd(12), r.filled[f]));
  });

  if (DRY) { console.log("\n--dry: nothing written"); return; }

  Object.keys(COLUMNS).forEach(key => {
    const cols = COLUMNS[key];
    const rows = tables[key];
    const body = rows.map(r => cols.map(c => qcsv(r[c])).join(",")).join(NL);
    const comment = COMMENTS[key].map(l => "// " + l.replace("{n}", rows.length)).join(NL);
    const start = html.indexOf(key + ": `");
    let cs = start;
    for (;;) {
      const prev = html.lastIndexOf(NL, cs - NL.length - 1);
      const line = html.slice(prev + NL.length, cs);
      if (/^\/\//.test(line.trim())) cs = prev + NL.length; else break;
    }
    const end = html.indexOf("`,", start) + 2;
    html = html.slice(0, cs) + comment + NL + key + ": `" + cols.join(",") + NL + body + "`," + html.slice(end);
  });

  fs.writeFileSync(HTML, html);
  console.log("\nwrote index.html");
})().catch(e => { console.error(e); process.exit(1); });
