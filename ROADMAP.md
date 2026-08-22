# Elden Ring Tracker — Roadmap

## Done (v1)
- All zones, base game + Shadow of the Erdtree
- Dungeons per zone (mini-dungeons + legacy dungeons)
- Every boss encounter per zone (evergaol, field, and night bosses included)
- Auto-save to browser localStorage, export/import JSON backup, reset button
- Search filter, per-zone and overall progress bars

## Done (v2)
- Category system: filter chips in the header (Dungeons / Bosses / Key Items)
- "Hide completed" toggle
- Completed categories auto-collapse to a ✓ header (click to expand)
- **Key Items** category: Map Fragments, Golden Seeds, Sacred Tears, and all
  talismans (base + DLC), per zone; sourced from Fextralife/GameRant guides.
  Entries marked "(verify)" have uncertain locations.
- New "Roundtable Hold & Trades" zone for merchant/trade talismans

## Done (v3)
- Restructured zones into **place blocks**: every dungeon is its own card with a
  "cleared" checkbox in its header and its bosses/key items listed inside it.
  Field bosses, evergaols, and overworld pickups live in an "Open World" block per zone.
- Fully-completed places auto-collapse to a ✓ header line
- Redundant place names trimmed from location labels inside blocks
- Save-IDs unchanged — progress from v1/v2 carries over

## Done (v4)
- **Graces category**: all 414 sites of grace (base + DLC) from the Fextralife
  wiki, assigned to their place blocks (dungeon graces inside dungeon blocks,
  overworld graces in Open World). New "Graces" filter chip.
- Leyndell graces tracked pre-burn; Ashen Capital zone lists only
  "Leyndell, Capital of Ash" and "Fractured Marika" to avoid double-counting.
- Grace data lives in the GRACES map (keyed "Zone::Place") in index.html.

## Done (v5)
- Zone order follows the Rock Paper Shotgun progression route, with finer zone
  granularity: Siofra River and Ainsel River are early zones; Nokron & Siofra
  Aqueduct, Nokstella & Lake of Rot, and Moonlight Altar are their own later
  zones. One deliberate deviation: Volcano Manor right after Mt. Gelmir.
- Save-data migration (`migrateChecked` in index.html) remaps checkmarks from
  the old bundled zone names — also applied when importing old backup files.

## Done (v6)
- **Quests view**: Zones/Quests toggle in the toolbar. 34 NPC questlines
  (24 base + 10 DLC) as cards with ordered, checkable steps — each step tagged
  with the zone it happens in. Steps sourced from Fextralife walkthroughs
  (Fire Knight Queelign's steps are from memory — his wiki page was thin).
- **Zone quest markers**: each zone lists every questline that touches it with
  a per-zone step count (✦ = starts here — **changed in v9**, see below);
  clicking jumps to the quest card.
- Quest steps count toward overall progress (295 steps; total now 1244 items).

## Done (v7)
- **Findable equipment, part 1**: Spirit Ashes (84), Sorceries (84) and
  Incantations (129) as three new categories. Totals match published counts
  exactly. Merchant-sold spells filed at the merchant's location; remembrance
  trades under Roundtable Hold.
- **"Key Items" split three ways** into Talismans / Bolstering Materials / Key
  Items, using the game's own terminology. Done via `classifyKeyItem()`, a
  name-pattern classifier, so future items file themselves.
- **Cookbooks, prayerbooks, scrolls** (115) and **bell bearings** (26 — boss
  drops and world finds only; the ~30 NPC-death bearings are excluded).
- All scroll- and prayerbook-gated spells moved to **Miriel**, each labelled with
  the book that unlocks it.
- Header total **split into separate Zones and Quests bars** (1,388 / 295).
- **UX pass**: fixed mobile horizontal scroll; header 215px → 179px open /
  113px collapsed (⋯ menu + collapsible filter row); eliminated row wrapping
  (337 → 0); sticky zone headers.
- Repo published to <https://github.com/Paraiga/elden-ring-tracker>.

## Done (v8) — scope cut
The item tracking added in v2–v7 was **removed**. Checking off ~1,200 pickups was
more administration than the tracker was worth in practice.

Removed: Graces (414), Talismans (157), Key Items (163), Bolstering Materials
(53), Spirit Ashes (84), Sorceries (84), Incantations (129) — along with the
`GRACES` / `SPIRIT_ASHES` / `SORCERIES` / `INCANTATIONS` / `BOOKS` /
`BELL_BEARINGS` maps, every `keyItems` array in `DATA`, and `classifyKeyItem()`.

Kept: **Dungeons (104) and Bosses (200)** in the zones view, and the **Quests
view unchanged** (295 steps, 34 questlines), including the per-zone quest markers.

Consequences worth knowing:
- `CATEGORIES` is now just `["Dungeons", "Bosses"]`; the filter chips follow it.
- Two places lost all their content and were dropped: `Abyssal Woods :: Open
  World`, and `Roundtable Hold & Trades :: Roundtable Hold`. The **Roundtable
  Hold zone itself is kept with an empty `places: []`**, because 10 questlines
  link to it — it renders as a quest-marker-only card, and `refreshCounts()`
  blanks the count rather than showing "0 / 0".
- `ID_MIGRATIONS` was pruned to the two boss renames; the entries for spells and
  key items were dead once those categories went.
- **No saved progress was destroyed.** `migrateChecked()` leaves unrecognised IDs
  in `localStorage` untouched, so the ~150 grace/item/spell ticks in an existing
  save are dormant, not deleted — restoring a category restores its progress.
  Verified against the 2026-08-10 backup: 18 dungeons, 33 bosses and 40 quest
  steps all survived, and all 241 original ticks were still in storage after.

## Done (v9)
- **Zone quest chips now mark what is actionable.** ✦ used to mean "this
  questline starts here", which was static — a chip lit up on day one and never
  changed. It now marks the zone containing the questline's **next unticked
  step**, so gold means "you can act on this here, now", and the ✦ walks from
  zone to zone as you tick steps off.
- Considered and rejected: lighting up every zone with unfinished steps. That is
  the exact inverse of the existing green "done" state, so it would have added no
  information — at 40/295 quest completion nearly every chip would have been gold.
  With the "next step" rule, 33 of 127 chips are lit.
- The "starts here" marker was dropped from the chips deliberately. That
  information is still on the quest card itself, which reads "starts in <zone>".
- `build()` no longer sets any state class on a chip; `refreshCounts()` owns
  `.next` and `.done`, so the markers update live as steps are ticked. `.next`
  and `.done` are mutually exclusive by construction.

## Done (v10)
- **Build tab**: a third view holding a personal character plan — name,
  description and playstyle, a five-phase stat table (starting class → lv 30 /
  60 / 90 / 120), and an equipment checklist grouped by category and by when to
  chase each piece, with locations.
- Builds are **imported, never shipped**. The tab carries the prompt to hand an
  LLM, with a copy button; the answer is pasted back or loaded from a `.json`.
  The parser is deliberately tolerant of key naming, nesting, flat-vs-grouped
  equipment and stray markdown fences.
- Several builds at once, switched by chips. Re-importing a build of the same
  name replaces it and keeps ticks on gear it still lists.
- Independent of the tracker by design: separate storage keys, a separate
  `buildId::category::item` ID namespace, separate render. Nothing in `DATA`,
  `QUESTS`, `CATEGORIES` or `migrateChecked()` changed.
- Backups are now `version: 2` and carry builds; v1 backups still import, and a
  backup without builds no longer wipes builds on the device.
- **This is not a reversal of the v8 cut.** That cut removed ~1,200 curated
  checkboxes the app shipped with and that grew per category. The app ships with
  zero build data; a build is short, personal, and cannot grow on its own.

## Done (v11)
- **Stat validation on builds.** Every Elden Ring character's eight stats sum to
  exactly `level + 79`, so a generated build that spends more points than it has
  levels is detectable with arithmetic alone — no weapon data, no network.
- The stat table gains a **Level these stats need** row, marks phases that
  disagree with the level they claim, and lists findings in plain language.
- Also checks: first phase against the named class's real spread, stats below
  the class floor, stats going down, the 99 cap, non-increasing levels. A phase
  missing stats is reported as unverifiable rather than passed.
- `STARTING_CLASSES` (ten rows, Fextralife) is the only real game data in the
  tool. The identity above cross-checks all ten, and settled a conflict with
  Maxroll over the Prophet's and Prisoner's starting levels.
- The prompt now states the arithmetic rule, gives the four target totals and
  embeds the ten class blocks — cheaper than validating after the fact.
- Builds that fail still import and render. The tool reports, never refuses.

## Done (v11.1)
- **Repair buttons** on a failing stat plan. An overspent phase has two correct
  fixes, so both are offered: *rebalance the stats to the stated levels*
  (proportional to each stat's investment above its floor, so the build stays
  recognisable) or *restate the levels to match the stats*.
- Phases are repaired in order, each floored by the previous repaired phase, so
  a fix can never introduce a stat that goes down. Largest-remainder
  apportionment keeps the rescaled totals landing exactly on target.
- Every repair reports what it changed and is reversible — `phasesBackup` holds
  the as-imported stats and Revert always returns to the file, not to the
  previous repair. Nothing is ever repaired automatically.
- Phases with no legal fix are left alone and stay flagged, with a line saying
  so, rather than being guessed at.

## Done (v12) — item reference checking
- **1,083 real item names embedded**, and the Build tab now checks gear against
  them: weapons 479 (incl. shields, staves, seals, bows), spells 213, talismans
  154, ashes of war 116, spirit ashes 84, crystal tears 37.
- Talismans, spells and spirit ashes were **recovered from the v7 commit**, where
  they had already been sourced and corrected over several sessions. Weapons came
  from the game's own datamined menu strings, cross-checked against 42 wiki
  category pages in both directions. Ashes of war and crystal tears were
  extracted from raw wiki HTML.
- **Armor and "Other" are reported as "not checked"**, never silently passed.
  Silence has to mean "verified", or the feature cannot be trusted.
- Invented items are flagged; misspellings get the correct name and a one-click
  fix that carries the checklist tick across the rename.
- Location cross-checking works at **region granularity and is tuned to
  under-report** — it catches "your build says Caelid but it is in Liurnia" and
  stays quiet on within-region imprecision.
- **Sourcing lesson recorded in HANDOVER:** fetching wiki lists through a
  summarising model truncated and hallucinated. Extract raw HTML or use
  datamined params, then reconcile the count against a published total.
- index.html is now 209KB / 4,041 lines. Still one file, still offline.

## Done (v13) — grounded prompts
- **Grounded generation prompt**: the instructions plus all 1,083 real item
  names, with the model told to choose only from them. 23KB / ~5,900 tokens.
  Catching a bad name is v12; not producing one is better. The short prompt is
  still there for when a big paste is awkward.
- Lists sit **after** the instructions with the key rule repeated below them,
  and are **one name per line, never comma-separated** — several incantations
  have commas in their names (`Burn, O Flame!`), so a comma list is ambiguous.
  The newline form is also the smaller one.
- **Correction loop**: when a build has problems, one button writes a
  self-contained prompt — the build as JSON, every finding in plain language,
  the stat rule, and the real names for *only* the categories that failed
  (typically 13KB, not 23KB). Paste back, re-import, ticks are kept.
- `buildToJson()` round-trips identically through `normalizeBuild()`, which is
  what makes the correction prompt safe to echo back. Also powers "Copy build
  as JSON" for moving a single build between devices.
- Verified property: parsing the grounded prompt the way a model would and
  checking every name yields 1,083 `ok`. Prompt and validator agree exactly.
- **This did not cost the offline property.** No network, no API key, no new
  data — it is prompt construction over reference data already in the page.

## Done (v14) — CSV reference, and armor
- **The reference data is now CSV**, one table per category with a header row
  naming its columns, stored as template literals in the same file. Adding a
  column needs no parser change: `parseCSV` turns every column into a property,
  `indexRef` carries the whole row onto the entry, and the prompt emits the
  table verbatim. Weapon scaling can be filled in later without touching code.
- **Armor added: 188 pieces across 46 sets**, with `slot` and `set` columns.
  Armor was the last category the checker could not verify at all.
- **`PARTIAL_REF` marks a list as incomplete.** The armor table covers the sets
  builds actually name, not all of them, so a miss returns `unchecked` — "not
  in the list" — rather than `unknown`. A partial list may suggest a spelling
  correction (tolerance tightened to 2 edits) but may never call an item fake.
  A false accusation against a real item is worse than no check at all.
- Summaries count **three outcomes, not two**: verified, not recognised, and
  outside the list. Lumping the third into the second was the bug this change
  had to fix once armor arrived.
- **Prompts now carry CSV instead of name lists**, so the model sees columns —
  a slot and a set for armor, a location for everything else. CSV quoting also
  solves the comma-in-name problem (`Burn, O Flame!`) that forced the
  one-name-per-line form in v13.
- Verified property, re-run and still exact: parsing the grounded prompt the way
  a model would and checking every name yields **1,271 `ok`, zero failures**.
- Grounded prompt is now 55KB. Correction prompts stay small (~8.5KB) because
  they carry only the tables that actually failed.

### Where this was heading
Four of the five steps sketched on 2026-08-22, cheapest first: **(1) stat
maths** ✔, **(2) item existence and location checking** ✔, **(3) grounded
generation** ✔, (4) in-tool generation via an API key — **deliberately not
doing**, (5) attack-rating optimisation.

Step 4 was ruled out on 2026-08-22: it ends the tool's offline, no-account
property, and the copy-paste loop is good enough to make it unnecessary.

**The open question is data, not format.** The CSV shape is ready for weapon
requirements and scaling; what is missing is a trustworthy source. Recall is
good enough for item *names* and was used for them, but it is not good enough
for scaling grades, requirement numbers or weapon categories — wrong numbers in
a generation prompt are worse than absent ones, because nothing downstream can
tell which rows are wrong. Sourcing options, roughly in order of fidelity: the
game's own param tables via extraction tooling, a community param dump, then
wiki scraping. Whatever the source, it must be baked in as static CSV, never
fetched at runtime, or the offline property goes with it.

## Future features
Deliberately empty. Weapons/armor, upgrade materials and pot tracking were the
old roadmap; the v8 cut is the decision not to do them. The Build tab is not a
route back in: it holds *your* shortlist, not the game's catalogue.

Also deliberately not doing: splitting oversized "Open World" blocks by sub-area.

## Notes
- **See `HANDOVER.md`** for current state, data conventions, the save-ID
  migration rule, and GitHub Pages setup.
- Data lives in `DATA` and `QUESTS` in `index.html`.
- Checkmarks are keyed `Zone::Category::Name::Location`, so renaming an entry
  un-checks it — add an `ID_MIGRATIONS` line whenever an entry moves or is
  relabelled, and verify by seeding the old ID.
