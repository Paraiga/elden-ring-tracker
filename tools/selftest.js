#!/usr/bin/env node
/**
 * selftest.js — the check that has to pass after any change to the reference
 * data or the name matching.
 *
 *   node tools/selftest.js
 *
 * The property: build the CSV the Build tab hands to a model, parse it back the
 * way a model would, and feed every name to lookupItem(). All of them must
 * resolve to themselves. That is what makes prompt and validator agree — a
 * model that obeys the prompt produces a build that validates clean.
 *
 * It also checks the shape of the data itself, because a table can round-trip
 * perfectly while being wrong: sets that are too large usually mean a wiki
 * parse mis-attributed pieces, and a missing category or slot means an
 * infobox was not read.
 */
"use strict";

const fs = require("fs");
const path = require("path");

const HTML = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(HTML, "utf8");

// Pull the page's own script into Node with just enough DOM to let it define
// its functions. Nothing is rendered; we only want the data and the matcher.
const RECT = { height: 0, width: 0, top: 0, left: 0, right: 0, bottom: 0, x: 0, y: 0 };
const noop = () => {};
const fakeEl = () => new Proxy(function () {}, {
  get: (t, k) => {
    if (k === "getBoundingClientRect") return () => RECT;
    if (k === "children" || k === "childNodes") return [];
    if (k === Symbol.toPrimitive) return () => 0;
    if (k === "textContent" || k === "value" || k === "innerHTML") return "";
    return fakeEl();
  },
  set: () => true,
  apply: () => fakeEl()
});
const document = new Proxy({}, { get: (t, k) => (k === "querySelectorAll" ? () => [] : fakeEl()) });
const store = {};
const localStorage = {
  getItem: k => (k in store ? store[k] : null),
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: k => { delete store[k]; }
};

const start = html.indexOf("<script>"), end = html.lastIndexOf("</script>");
const api = new Function("document", "localStorage", "window", "ResizeObserver", "navigator",
  html.slice(start + 8, end) +
  "\nreturn { itemsCsv, parseCSV, lookupItem, REF_CSV, DAMAGE_CSV, EQUIP_DEFS," +
  " attackRating, damage, affinityProfile };"
)(document, localStorage,
  { addEventListener: noop, matchMedia: () => ({ matches: false, addEventListener: noop }) },
  function () { return { observe: noop, disconnect: noop }; },
  { clipboard: null });

let failures = 0;
const fail = m => { console.log("  FAIL " + m); failures++; };

// ---- 1. every row in the download resolves to itself ----
const rows = api.parseCSV(api.itemsCsv());
const unresolved = [];
rows.forEach(r => {
  const hit = api.lookupItem(r.type, r.name);
  if (hit.status !== "ok" || hit.ref.name !== r.name) {
    unresolved.push(r.type + ": " + r.name + " -> " + hit.status);
  }
});
console.log("round-trip: " + rows.length + " rows, " + unresolved.length + " unresolved");
unresolved.slice(0, 20).forEach(u => fail(u));
if (unresolved.length > 20) fail("(+" + (unresolved.length - 20) + " more)");

// ---- 2. per-table shape ----
const REQUIRED = {
  weapons: ["category", "maxUpgrade", "infusible", "location"],
  armor: ["slot", "location"],
  talismans: ["location"],
  physick: ["location"],
  spells: ["category", "location"],
  ashes: ["location"],
  spirits: []
};
console.log("\ntables:");
Object.keys(api.REF_CSV).forEach(key => {
  const t = api.parseCSV(api.REF_CSV[key]);
  const gaps = (REQUIRED[key] || []).map(col => {
    const n = t.filter(r => !r[col]).length;
    return n ? col + "=" + n : null;
  }).filter(Boolean);
  console.log("  " + key.padEnd(10), String(t.length).padStart(5),
    gaps.length ? " missing: " + gaps.join(", ") : "");
  // a blank column is worth reporting but only a hard-missing name is a failure
  if (t.some(r => !r.name)) fail(key + " has a row with no name");
});

// ---- 3. armor sets should look like sets ----
const armor = api.parseCSV(api.REF_CSV.armor);
const bySet = {};
armor.forEach(r => { if (r.set) (bySet[r.set] = bySet[r.set] || []).push(r.name); });
const oversized = Object.keys(bySet).filter(s => bySet[s].length > 6);
console.log("\narmor: " + armor.length + " pieces, " + Object.keys(bySet).length + " sets, " +
  armor.filter(r => !r.set).length + " standalone");
oversized.forEach(s => fail("set '" + s + "' has " + bySet[s].length +
  " pieces — a wiki heading probably failed to parse"));

// ---- 4. affinity handling ----
console.log("\naffinities:");
[["Blood Uchigatana", "ok"], ["Heavy Greatsword", "ok"], ["Occult Reduvia", "affinity"],
 ["Fire Knight's Greatsword", "ok"], ["Sword of Doom", "unknown"]].forEach(([name, want]) => {
  const got = api.lookupItem("weapons", name).status;
  console.log("  " + name.padEnd(26), got);
  if (got !== want) fail(name + ": expected " + want + ", got " + got);
});

// ---- 5. attack rating ----
// Pinned values, not just "it returns a number". A damage formula that is
// slightly wrong still produces confident numbers, so these are the anchors:
// the curve's documented soft caps, a weapon's own base attack, and the
// two-handing and unmet-requirement rules, each of which is separately visible.
console.log("\nattack rating:");
const weapons = {};
api.parseCSV(api.REF_CSV.weapons).forEach(r => weapons[r.name] = r);
const spread = k => ({ vig: 60, mnd: 20, end: 30, str: k, dex: k, int: k, fai: k, arc: k });
const near = (got, want, tol, what) => {
  const ok = Math.abs(got - want) <= tol;
  console.log("  " + what.padEnd(42), got + (ok ? "" : "  (expected ~" + want + ")"));
  if (!ok) fail(what + ": got " + got + ", expected ~" + want);
};

// The default damage curve's soft caps are documented game behaviour.
const g = api.damage().graphs["0"];
near(+g[18].toFixed(3), 0.25, 0.001, "growth curve at 18");
near(+g[60].toFixed(3), 0.75, 0.001, "growth curve at 60");
near(+g[80].toFixed(3), 0.9, 0.001, "growth curve at 80");

// Base attack at +0 is the weapon's own listed value.
const uchi0 = api.attackRating(weapons["Uchigatana"], { str: 11, dex: 15 }, { upgrade: 0 });
near(uchi0.base, 115, 0, "Uchigatana +0 base attack");

near(Math.floor(api.attackRating(weapons["Uchigatana"], spread(40)).total), 491, 2,
  "Uchigatana +25 at 40/40");

// Giant-Crusher needs 60 Str. At 40 the requirement is unmet and every damage
// type it scales is cut to 60%; two-handing makes 40 count as 60 and lifts it.
const gc1 = api.attackRating(weapons["Giant-Crusher"], spread(40));
const gc2 = api.attackRating(weapons["Giant-Crusher"], spread(40), { twoHand: true });
near(Math.floor(gc1.total), 227, 2, "Giant-Crusher one-handed at 40 Str");
near(Math.floor(gc2.total), 747, 2, "Giant-Crusher two-handed at 40 Str");
if (!gc1.unmet.includes("str")) fail("Giant-Crusher at 40 Str should report str unmet");
if (gc2.unmet.length) fail("Giant-Crusher two-handed at 40 Str should meet its requirement");

// ---- 5b. affinities ----
// 228 infusible weapons times twelve infusions, and each one has to change the
// answer in the direction the game says it does.
console.log("\naffinities:");
const affRows = api.parseCSV(api.DAMAGE_CSV.affinities);
console.log("  " + "rows".padEnd(42), affRows.length);
if (affRows.length !== 2736) fail("expected 2736 affinity rows, got " + affRows.length);

const uchi = weapons["Uchigatana"];
const dexArc = { vig: 60, mnd: 20, end: 30, str: 18, dex: 50, int: 9, fai: 9, arc: 45 };
const arOf = a => Math.floor(api.attackRating(uchi, dexArc, a ? { affinity: a } : {}).total);
const std = arOf("");
console.log("  " + "Uchigatana standard / Keen / Heavy".padEnd(42),
  std + " / " + arOf("Keen") + " / " + arOf("Heavy"));
// Keen scales with Dexterity and this spread has 50 of it; Heavy drops Dex
// scaling entirely, so it must lose.
if (arOf("Keen") <= std) fail("Keen should beat standard on a 50 Dex spread");
if (arOf("Heavy") >= std) fail("Heavy should lose to standard on a 50 Dex spread");
// Occult scales with Arcane, which this spread has 45 of.
if (arOf("Occult") <= std) fail("Occult should beat standard on a 45 Arcane spread");

// Infusions rewrite the passive: Blood raises bleed, Cold replaces it with frost.
const prof = a => api.affinityProfile(uchi, a);
console.log("  " + "passive: standard / Blood / Cold".padEnd(42),
  "Bleed 45 / " + prof("Blood").passive + " / " + prof("Cold").passive);
if (!/^Bleed/.test(prof("Blood").passive)) fail("Blood Uchigatana should carry bleed");
if (!/^Frost/.test(prof("Cold").passive)) fail("Cold Uchigatana should carry frost");
if (!prof("Heavy").scales.some(s => s.label === "Str")) fail("Heavy should scale with Strength");
if (prof("Heavy").scales.some(s => s.label === "Dex")) fail("Heavy should drop Dexterity scaling");

const covered = api.parseCSV(api.REF_CSV.weapons).filter(r => api.attackRating(r, spread(40))).length;
console.log("  " + "weapons with an attack rating".padEnd(42), covered + "/" + Object.keys(weapons).length);
if (covered !== Object.keys(weapons).length) fail("only " + covered + " weapons produced an attack rating");

console.log("\n" + (failures ? failures + " FAILURE(S)" : "all checks passed"));
process.exit(failures ? 1 : 0);
