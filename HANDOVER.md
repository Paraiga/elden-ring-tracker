# Handover

Context for picking this project back up. Written 2026-08-10, revised 2026-08-11.

Repo: <https://github.com/Paraiga/elden-ring-tracker> (public)

---

## 1. What this is

A single-file offline completion tracker for Elden Ring + Shadow of the Erdtree.
Open `index.html` in a browser — no build step, no dependencies, no network.
Progress saves to `localStorage` on every click.

`serve.js` exists only for local dev; it is not needed to use the tracker.

## 2. Current state

**314 world items across 37 zones (123 place blocks) + 295 quest steps across
34 questlines.** The header shows these as two independent progress bars — they
are deliberately *not* summed, since quest progress is a different kind of thing.

| Category | Count |
| --- | ---: |
| Bosses | 210 |
| Dungeons (the "cleared" checkbox on each dungeon block) | 104 |
| **Total** | **314** |

### Liurnia recheck, 2026-08-14

Prompted by two bosses found in play that the tracker did not list. Rechecking
the whole Liurnia Open World block against Fextralife's per-boss pages turned up
five additions and two relabels — all in `Liurnia of the Lakes` → `Open World`:

- **Erdtree Avatar, Converted Tower (southwest)** — new. Liurnia has *two*
  avatars; only the northeast one was listed.
- **Night's Cavalry, Bellum Highway (night)** — new. Liurnia has *two*; only the
  southern one was listed.
- **Godskin Noble, Divine Tower of Liurnia bridge** — new, and not reported by
  the player. Only reachable after inverting the Carian Study Hall, which is
  probably why it was missed originally.
- **Preceptor Miriam** (Carian Study Hall) and **Festering Fingerprint Vyke**
  (Church of Inhibition) — new. Named hostile NPCs rather than true field
  bosses, added by request. They live in `Open World` rather than getting their
  own place blocks, so the dungeon count is unchanged at 104.
- The two pre-existing entries were relabelled to disambiguate them from their
  new twins (`Minor Erdtree (east Liurnia)` → `…Uld Palace Ruins (northeast)`,
  `Liurnia Highway (night)` → `Gate Town Bridge (night)`), with matching
  `ID_MIGRATIONS` entries. Both verified by the seed-and-reload method in §3.

Worth knowing for future rechecks: a *count* per region ("Liurnia has two
Erdtree Avatars") is the thing list pages get right and the thing this data was
missing. Checking counts per boss type is a faster way to find gaps than
re-reading region pages.

### Caelid recheck, 2026-08-15

Same exercise as Liurnia, on the Caelid map (both the `Caelid` and `Greyoll's
Dragonbarrow` zones). Two additions and one correction:

- **Anastasia, Tarnished-Eater**, `Caelid` → `Open World`, `Smoldering Church
  (invader)` — new. The one NPC invader on the Caelid map; same treatment as
  Vyke in Liurnia (lives in `Open World`, no place block of its own).
- **Flying Dragon Greyll**, `Greyoll's Dragonbarrow` → `Open World`, `Farum
  Greatbridge` — new. Genuinely missed. Farum Greatbridge is unmarked on the
  map, which is probably why.
- **Erdtree Avatar → Putrid Avatar** at the Dragonbarrow Minor Erdtree — a
  mislabel, not a gap. Both Minor Erdtrees on the Caelid map hold the rot
  variant. `ID_MIGRATIONS` entry added and verified by the seed-and-reload
  method in §3.

Counts checked per boss type and all correct as they stood: two Night's Cavalry
(Caelid Highway, Dragonbarrow), one Death Rite Bird (southern Aeonia Swamp), one
Bell Bearing Hunter (Isolated Merchant's Shack). No Deathbird on this map.

**Deliberately not added: Lion Guardians.** There are four on the Caelid map —
two at Redmane Castle, one at Fort Gael, one roaming near the Impassable
Greatbridge — plus one at Stormveil. They are elite enemies, not bosses: no fog
gate, no health bar, they respawn. Tracking them means opening an "elite
enemies" category game-wide (Erdtree Burial Watchdogs, Crucible Knights,
Ulcerated Tree Spirits, Tree Sentinels, and so on run to well over a hundred),
which is the same kind of growth the v8 cut existed to stop. Ask before adding
any of them.

### Altus Plateau recheck, 2026-08-19

Prompted by the player walking into Unsightly Catacombs and not finding it on
the Altus card. It was there, but filed under `Mt. Gelmir`. Fextralife puts it —
and two other Wyndham-area items — on the Altus Plateau, so three entries moved
zone:

- **Wyndham Catacombs** (Erdtree Burial Watchdog) and **Unsightly Catacombs**
  (Perfumer Tricia & Misbegotten Warrior), `Mt. Gelmir` → `Altus Plateau`.
- **Tibia Mariner**, `Mt. Gelmir` → `Altus Plateau` → `Open World`, Wyndham
  Ruins. The ruins are on the plateau; only the catacombs climb toward Gelmir.

Four genuine gaps and one phantom:

- **Omenkiller & Miranda the Blighted Bloom**, Perfumer's Grotto — new. The
  grotto was listed as a dungeon with an empty boss list.
- **Demi-Human Queen Gilika**, `Open World`, Lux Ruins basement — new. Third
  Demi-Human Queen after Margot (Volcano Cave) and Maggie (Hermit Village).
- **Black Knife Assassin**, Sainted Hero's Grave entrance — new. She waits
  outside the grave rather than at the end of it, so it now holds two bosses.
- **Eleonora, Violet Bloody Finger**, `Open World`, Second Church of Marika —
  new. Same NPC-invader treatment as Vyke and Anastasia.
- **Erdtree Avatar at the Minor Erdtree — removed.** There is no Erdtree Avatar
  anywhere on the Altus map. Wormface is the Minor Erdtree boss and was already
  listed, as "near Minor Erdtree"; relabelled to "Minor Erdtree" and the
  duplicate Avatar entry deleted.

All six affected IDs have `ID_MIGRATIONS` entries, verified by the
seed-and-reload method in §3. 311 → 314 items (207 → 210 bosses). The dungeon
count stays at 104, since the two catacombs moved rather than appeared.

Counts checked per boss type and correct as they stood: one Night's Cavalry
(Altus Highway Junction), one Wormface, one Fallingstar Beast, no Deathbird and
no Death Rite Bird on this map. Lansseax has two encounters (Abandoned Coffin
and Rampartside Path) but is one boss, so stays one entry.

### The Build tab, 2026-08-22

A third view beside Zones and Quests, holding a personal character plan: name,
description, playstyle, a five-phase stat table (starting class → lv 30 / 60 /
90 / 120) and an equipment checklist with locations.

**This is not a reversal of the v8 cut**, and the distinction matters if the
scope question comes up again. The v8 cut removed ~1,200 curated, game-wide
checkboxes that the app shipped with and that grew every time a category was
added. A build ships with *nothing*: the app contains zero build data, the user
imports a short personal list, and it cannot grow on its own.

Structurally it is independent of everything else, which is what the request
asked for:

- Its own storage keys — `elden-ring-builds-v1` (the builds), `-checked` (the
  gear ticks) and `-active`. It touches neither `STORE_KEY` nor `DATA`/`QUESTS`.
- Its own ID namespace, `buildId::category::item name`, which cannot collide
  with a tracker `Zone::Category::Name::Location` ID. `migrateChecked()` never
  sees these, and no `ID_MIGRATIONS` entry is ever needed for a build.
- Its own render (`renderBuildView`) and count refresh (`refreshBuildCounts`).
  Deleting the whole block would leave the tracker working.

Two things worth knowing before editing it:

- **`normalizeBuild()` is deliberately forgiving.** Everything goes through
  `pickKey()`, which ignores case, spaces, underscores and hyphens, so
  `startingClass`, `starting_class` and `Starting Class` all land. It accepts
  equipment as an object of named arrays *or* one flat array where each item
  carries its own `category`, accepts stats nested under `stats` or inline on
  the phase, and strips a ```` ```json ```` fence off the front. This is not
  over-engineering: LLM output is not stable between runs, and a rejected
  paste with a vague error is the one thing that would make the tab annoying.
  Unknown equipment categories fall into `other` rather than being dropped.
- **`BUILD_PROMPT` and the parser have to move together.** The prompt is in
  `index.html` rather than the README precisely so it cannot drift out of step
  with the code that reads its output.

Re-importing a build whose name slugifies to an existing `id` replaces it in
place and keeps the ticks, so correcting a plan is cheap. Renaming an item
inside a build does lose that one tick — the same rule as the tracker, but with
no migration table, since a build is small enough to just re-tick.

Endurance is rendered but not required. The original request listed seven stats
and left it out; every real build spends points on it, so it is in the prompt
and in `STAT_DEFS`, and `renderStatTable()` drops any stat row that has no data
in any phase. A seven-stat JSON therefore shows exactly seven rows.

`Export backup` is now `version: 2` and carries `builds`, `buildChecked` and
`activeBuild` alongside `checked`. The importer treats all three as optional, so
v1 backups still load, and importing a backup that has no builds does not wipe
builds already on the device.

### Stat validation, 2026-08-22

The first step toward the tool generating builds rather than just holding them.
Prompted by a real generated build that spent 38 stat points across 30 levels.

**The whole thing rests on one identity:** in Elden Ring, the eight stats added
together always equal `level + 79`. A Wretch starts at level 1 holding 80
points and every level buys exactly one more, so the relationship is exact, it
holds for all ten classes, and it needs no weapon data, no formulas and no
network. `STAT_TOTAL_OFFSET` is that 79.

That is why this step was worth doing before anything else: it is the largest
correctness win available for essentially zero data. The rest of the road —
item existence checks, grounded generation, attack-rating maths — all needs real
datasets. This needed ten rows.

`STARTING_CLASSES` holds those ten rows, from the Fextralife Classes page. Two
sourcing notes worth keeping:

- **The identity doubles as a source check.** All ten blocks satisfy it, which
  is far stronger evidence than any single page — misremembering ten 8-tuples
  in a way that all still sum correctly is not a thing that happens.
- **It settled a source conflict**, in the spirit of §4's warning about single
  secondary sources. Maxroll lists Prophet at level 8 and Prisoner at 10;
  Fextralife lists 7 and 9. Their stat blocks total 86 and 88, which are only
  reachable at 7 and 9, so Fextralife is right and Maxroll's levels are wrong.
- The Fextralife page also lists "Heavy Knight" and "Idus Knight". Elden Ring
  has ten classes; those are not among them and are not included. (Both do
  satisfy the identity, so they are probably real characters from elsewhere —
  worth remembering if that page is ever re-scraped for something else.)

`validateBuild()` returns a flat list of `{kind, phase, text}` and checks: the
level identity per phase, the first phase against the named class's real
spread, stats below the class floor, stats dropping between phases, the 99 cap,
and levels that do not increase. Two deliberate behaviours:

- **It reports, it never refuses.** A failing build still imports and renders.
  The tool is not the authority on what you meant to build.
- **Findings are grouped per stat, not per phase**, or one mistake in Endurance
  would print five near-identical lines. A stat that visibly drops is reported
  as the drop and *not* also as a floor violation — same fault, stated twice.

An incomplete phase is a `warn`, not an `error`: a build listing seven stats
(the original Build tab request omitted Endurance) cannot be checked at all, and
saying so is more useful than passing it silently.

`BUILD_PROMPT` now states the identity, spells out the four target totals (109 /
139 / 169 / 199) and embeds all ten class blocks. Prompt and validator have to
stay in step — that is why both live in `index.html`.

### Repairing a stat plan, 2026-08-22

Two buttons appear under the findings when a build has errors, because an
overspent phase has **two** correct fixes and only the player knows which:

- **Rebalance stats to these levels** (`rebalanceStats`) keeps the 30/60/90/120
  milestones and rescales the stats to fit. Primary, because the milestones are
  the framework the whole tab was asked for.
- **Restate levels to match stats** (`restateLevels`) keeps the spread exactly
  and moves the milestones to where those stats are actually reachable. Offered
  only when some phase's stated level differs from its implied one.

How the rebalance keeps a build recognisable, which is the whole difficulty:
each phase's **investment above its floor** is rescaled proportionally, so the
ratio between the stats the build actually cares about survives. Trimming the
smallest stats first would eat the splash investments; trimming the largest
would kneecap the main scaling stat. Neither preserves intent.

Three details that are load-bearing:

- **Phases are fixed in order, each floored by the previous fixed phase.**
  Fixing them independently could leave a later phase below an earlier one,
  turning one error into another. This is also what silently repairs a stat
  that drops between phases.
- **`apportion()` uses largest-remainder.** Proportional rescaling produces
  fractions, and naive rounding drifts off the target by a point or two — which
  is the exact error being fixed. Floor everything, hand the leftovers to the
  largest fractions, and the total lands exactly.
- **`ABSOLUTE_FLOOR` is derived, not typed.** When a build names a class we do
  not know, the floor is the per-stat minimum across all ten classes, computed
  from `STARTING_CLASSES` so it cannot drift out of step with it.

Safety properties worth preserving if this is ever touched:

- **Nothing is repaired automatically.** Validation runs on render; repair only
  runs on a click. The tool never silently rewrites imported data.
- **Every repair is reversible.** `phasesBackup` holds the as-imported stats and
  is only written on the *first* repair, so Revert always returns to the file
  rather than to the previous repair. It persists with the build.
- **A repair that changes nothing is not an edit** — the backup is dropped again
  so the build is not marked edited and Revert is not offered pointlessly.
- **Impossible builds are left alone rather than guessed at.** A phase whose
  level is below the class's own (a level-5 Confessor) has no legal spread, so
  the rebalance skips it and the finding stays on screen, with a line saying so.
  Clicking a repair and seeing errors still listed reads as a broken button
  otherwise.
- Equipment ticks are untouched by any of this — the repair only rewrites
  `phases`.

### Item reference checking, 2026-08-22

Step 2 of the road sketched in the roadmap. The Build tab now checks the gear a
build names against **1,083 real item names**, flags what does not exist, and
offers the wiki's location when the build's own looks like a different place.

**Coverage, and why it is stated out loud.** Six of eight equipment categories
have reference data:

| Category | Entries | Source |
| --- | ---: | --- |
| Weapons (incl. shields, staves, seals, bows) | 479 | datamined `EquipParamWeapon`, cross-checked against 42 wiki category pages |
| Spells (sorceries + incantations) | 213 | v7 commit |
| Talismans | 154 | v7 commit |
| Ashes of War | 116 | wiki, raw-HTML extraction |
| Spirit Ashes | 84 | v7 commit |
| Crystal Tears | 37 | wiki, raw-HTML extraction |

**Armor and "Other" have no list and are reported as "not checked"** rather
than silently passing. This matters: silence has to mean "checked and fine",
never "we had nothing to check with", or the whole feature is untrustworthy.

**Sourcing lesson, and it is a big one.** The agent sourcing these lists found
that fetching a wiki page *through a summarising model* both truncated the list
and invented plausible entries — it produced two ashes of war that do not
exist and dropped about forty that do. The lists here were instead extracted
mechanically from raw HTML, and the weapons list comes from the game's own
menu strings rather than any wiki transcription. **Do not source item data
through a model summary.** Fetch the raw page and parse it, or use datamined
params, then cross-check the count against a published total.

Counts were reconciled, not assumed. 479 weapons looks far above the cited
"309 base game", but the regulation data splits base 378 / DLC 102; drop
`Unarmed` and the 69 base-game shields (which the 309 figure excludes) and it
is 308 — one off the citation. Likewise 116 ashes of war against a cited ~160:
the larger number counts *skills*, including weapon-unique ones that are not
Ash of War items.

**Name matching** is in `normName` and `keyVariants`. Every real-world spelling
difference found during sourcing is handled by an alias rather than by loosening
the match:

- Accents folded — the game writes `Miséricorde`, `Great Épée`, `Varré's
  Bouquet`; the wikis and most people do not.
- The `Ash of War: ` prefix is optional in both directions.
- A trailing ` Ashes` is optional, because nobody writes `Mimic Tear Ashes`.
- Periods optional: `St. Trina's Torch` vs `St Trina's Torch`.
- A trailing `+N` falls back to the base name, but `Erdtree's Favor +2` is a
  real distinct entry and still matches itself first.

**Parentheses are deliberately NOT stripped from the index key.** `Stamp
(Sweep)` and `Stamp (Upward Cut)` are two different ashes of war, and
`Greatsword of Radahn (Lord)` and `(Light)` are two different weapons. Folding
them together would silently lose one of each pair. A parenthetical-stripped
form is registered as an *alias* instead, first-writer-wins, so
`Beast Claw (Weapon)` still finds `Beast Claw`.

Every one of the 1,083 entries is verified to resolve to itself — that test is
worth re-running after any change to the matching rules, since a regression
there shows up as the tool calling real items fake.

**Location cross-checking** deliberately works at region granularity.
`locationsAgree()` asks only whether two location strings share a significant
word, and anything ambiguous counts as agreement. It catches "your build says
Caelid but it is in Liurnia" and stays quiet on within-region imprecision.
Crying wolf on a correct location would make the whole check untrustworthy, so
the check is tuned to under-report.

The v7 location strings needed one fix to be usable here: they were written to
render *inside a zone card*, so many are relative ("chest on the Debate Parlor
second floor") and never name their region. `regen-v7-blocks.js` prefixes the
zone where the string does not already mention it. Without that, region-level
agreement could not be computed at all.

**Repair.** A near miss is a misspelling of a real item, so it has one
unambiguous fix and gets a "Correct N misspelled names" button. An unknown item
does not — that needs a new build, not a rename. Renaming migrates the
checklist tick to the new ID, the same rule the tracker lives by.

Cost: index.html is now 209KB / 4,041 lines. Lookups are ~0.0006ms on a hit;
a miss costs ~2ms because it sweeps the category for a suggestion.

### Grounded prompts, 2026-08-22

Step 3. Catching a bad item name is step 2; not producing one is better. The
reference data was already in the page, so grounding cost no new data and no
network — it is prompt construction over `reference()`.

**Two prompts, both offered wherever one was offered before.**

- `groundedPrompt()` — the instructions plus every real weapon, talisman,
  spell, ash of war, spirit ash and crystal tear name. 23KB, roughly 5,900
  tokens, 1,083 names. This is the one to use.
- `BUILD_PROMPT` — instructions only, 3KB. Kept for when a short paste matters.

Two structural choices in the grounded prompt, both deliberate:

- **The lists come after the instructions, and the key rule is repeated below
  them.** Several hundred names ahead of the rules would bury them.
- **One name per line, never comma-separated.** Several incantations have
  commas in their names — `Burn, O Flame!`, `Flame, Grant Me Strength`,
  `Flame, Cleanse Me` — so a comma-joined list is ambiguous about where an item
  ends, and a model can reasonably emit `Burn` as an item. A newline is also
  one byte against two, so the correct form is the smaller one.

**The property worth preserving, and the test that proves it:** parse the
grounded prompt back the way a model would and feed every name to
`lookupItem()`. All 1,083 must return `ok`. That means prompt and validator
agree exactly, so a model that obeys the prompt produces a build that
validates clean. Re-run it after any change to either side — it is the whole
point of the feature.

### The correction loop

`correctionPrompt(b)` is the other half, and in practice the more useful one.
When a build has problems it produces a self-contained prompt: the build
itself as JSON, every finding in plain language, the stat rule when stats are
wrong, and **the real names for only the categories that actually failed** —
two lists, not six, so a typical correction is 13KB rather than 23KB.

One button in the build header covers stat faults and bad item names together,
because they are one round trip to the model, not two. It disappears when the
build is clean.

`buildToJson()` reconstructs the import schema from a normalised build, and
`normalizeBuild(JSON.parse(buildToJson(b)))` is verified to round-trip
identically. That matters more than it looks: the correction prompt embeds
that JSON as the shape to echo back, so if the round trip drifted, every
correction would quietly reshape the build. It also powers the "Copy build as
JSON" button, which is how you move one build between devices without
exporting the whole tracker.

Re-importing a correction keeps equipment ticks on items that survived, since
the build id is unchanged and ticks are keyed by item name.

### The v8 scope cut — read this before adding anything

v2–v7 also tracked Graces (414), Talismans (157), Key Items (163), Bolstering
Materials (53), Spirit Ashes (84), Sorceries (84) and Incantations (129). All of
it was **removed on 2026-08-11**: ~1,200 extra checkboxes was more administration
than the tracker was worth in play.

This was a deliberate decision, not an oversight. The old roadmap items that grew
out of it — weapons and armor, upgrade materials, cracked/ritual pots, legacy
dungeon loot — are cancelled with it. Do not reintroduce item tracking without
asking first.

What went with it: the `GRACES`, `SPIRIT_ASHES`, `SORCERIES`, `INCANTATIONS`,
`BOOKS` and `BELL_BEARINGS` maps, every `keyItems` array in `DATA`,
`classifyKeyItem()` and its two regexes, and the spell/item half of
`ID_MIGRATIONS`. The v7 commit still has all of it if a category is ever wanted
back.

**Nothing was deleted from anyone's save.** `migrateChecked()` leaves IDs it does
not recognise alone rather than pruning them, so grace/item/spell ticks in an
existing save are dormant, not gone — restoring a category would restore its
progress with it. Verified against the 2026-08-10 backup: 18 dungeons, 33 bosses
and 40 quest steps came through unchanged, and all 241 original ticks were still
in `localStorage` afterwards.

## 3. How the data is organised

Zones are ordered by a **recommended progression route** (based on the Rock Paper
Shotgun route), not alphabetically. Each zone contains **place blocks**: every
dungeon is a card holding its own bosses, and everything else in that region sits
in that zone's "Open World" block.

All data lives in the `<script>` block in `index.html`:

- `DATA` — zones, their place blocks, and bosses
- `QUESTS` — questlines with ordered, zone-tagged steps
- `CATEGORIES` — now just `["Dungeons", "Bosses"]`; the filter chips derive from it

### Zone quest chips

Each zone lists the questlines that touch it, with a per-zone `done/total`. The
gold **✦ marks the zone holding that questline's next unticked step** — gold means
"actionable here now", and the marker moves as you tick steps off. Green means
every step that questline has in this zone is done. The two are mutually
exclusive by construction, and `refreshCounts()` owns both classes — `build()`
deliberately sets no state on a chip, or the states would go stale on click.

Before v9 the ✦ meant "starts here", which never changed once rendered. Do not
"restore" it: the start zone is still shown on the quest card ("starts in
<zone>"), and lighting up every zone with unfinished steps was considered and
rejected as the exact inverse of the green done state.

One structural oddity to be aware of: **`Roundtable Hold & Trades` is a zone with
`places: []`**. It has no dungeons or bosses, but 10 questlines tag steps to it,
so it is kept as a quest-marker-only card. `refreshCounts()` blanks a zone's
count when its total is 0, so it does not display a permanent "0 / 0".

### The one rule that matters

**Save IDs are `Zone::Category::Name::Location`.** Renaming or moving an entry
changes its ID, which silently un-checks it.

Whenever an entry is renamed, relabelled, or moved between zones/categories, add
a line to `ID_MIGRATIONS` (or `ZONE_MIGRATIONS` for a whole zone) mapping old ID
to new. `migrateChecked()` remaps saved progress on load and when importing older
backups.

Every migration so far has been verified by seeding the stale ID, reloading, and
confirming it lands on the new entry. Keep doing that — it is cheap and it is the
only way to know progress survived.

## 4. Sourcing lessons still worth remembering

- Fextralife **per-dungeon pages** are excellent (exact in-dungeon locations).
  Fextralife **list pages** are unreliable for locations.
- Broad region pages (e.g. "Limgrave") list what exists but *not where*.
- When a single secondary source contradicts existing data, do not overwrite on
  that alone. This happened with the Church of Vows Bell Bearing Hunter: one
  guide said "morning only", the data was changed to `(daytime)`, and it was
  wrong — all four hunters are nocturnal. Reverted, and the revert is one of the
  two surviving `ID_MIGRATIONS` entries.

(The 22 `(verify)`-tagged entries documented here previously were all talismans,
spirit ashes and cookbooks. They left with the v8 cut and are no longer an issue.)

## 5. UX state

Done in v7 and still in place: mobile horizontal scroll fixed; header reduced to
179px open / 113px collapsed on desktop (occasional actions behind a `⋯` menu, a
collapsible filter chip row that remembers state); row wrapping eliminated —
names hold one line, locations truncate with an ellipsis and show full text on
hover, scoped to `#tracker` only so quest steps keep wrapping; sticky zone
headers via CSS `position: sticky` (this required removing `overflow: hidden`
from `.zone`, which silently disables sticky on descendants, and a
`ResizeObserver` keeps the `--header-h` variable matched to the live header).

Suggested but not done:

- Splitting oversized "Open World" blocks by sub-area — **explicitly declined**,
  no need to revisit.
- Brighter progress-bar tracks (they are near-invisible at 0%).
- Larger tap targets on mobile (checkboxes are 14px).
- "What's left" breakdowns on zone headers (e.g. "12 bosses, 3 dungeons left").

Note that with only two categories left, the filter chip row and the
per-category colour-accent idea carry much less weight than they did at nine.

## 6. Running it on your phone (GitHub Pages)

The repo is public, so GitHub Pages is available on the free plan.

1. Repo → **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** `main`, folder `/ (root)` → **Save**
4. Wait ~1 minute, then open **<https://paraiga.github.io/elden-ring-tracker/>**

`index.html` is already at the repo root, so no restructuring is needed. Every
`git push` redeploys automatically.

### The catch, and it is important

**`localStorage` is per-origin and per-browser.** Progress does *not* sync. The
Pages URL, the desktop `file://` page, and `localhost` are three separate
origins with three separate save files — and your phone browser is separate from
your desktop browser regardless.

So Pages makes the tracker *reachable* on your phone; it does not make it
*shared*. To move progress between devices, use **⋯ → Export backup** on one and
**Import backup** on the other.

If you want one live save across devices, that needs a backend (or something like
a Gist-backed sync), which is a much larger change and would end the "no
account, no server" property the tracker currently has.

### CSV reference data and armor, 2026-08-22

The reference moved from JS arrays to **CSV tables** (`REF_CSV`), one per
category, each with a header row. The point is extensibility: `parseCSV` makes
every column a property of the row, `indexRef` copies the whole row onto the
entry, and `refCsvBlocks()` emits the table verbatim into prompts. Adding
weapon scaling or armor weight is a data edit, not a code change.

Quoting matters here. 116 fields contain commas — mostly locations, but also
incantation names like `Flame, Grant Me Strength`. CSV quoting handles both,
which is why prompts could go back to tables after v13 had to use
one-name-per-line to dodge exactly this problem.

**Armor: 188 pieces, 46 sets**, with `slot` and `set`. Sourced from recall and
deliberately limited to sets whose piece names are certain — irregular ones
(`Malenia's Gauntlet` is singular, `Crucible Gauntlets` is shared across two
sets) are easy to get subtly wrong, and a wrong entry in the reference is worse
than a missing one: it makes the tool correct a *right* name to a wrong one.

**`PARTIAL_REF` is the mechanism that makes a partial list safe.** For a
category listed there:

- a hit is still `ok`
- a near miss still suggests, but at a tightened tolerance (2 edits, not 25% of
  the name's length)
- a total miss returns `unchecked`, never `unknown`

So armor can be verified but never accused. The correction prompt respects this
too: for a partial category it says "looks like a misspelling of X" instead of
"is not a real X", because the second is a claim the data cannot support.

This forced a counting change. Both summaries used `status !== "ok"` as the
definition of "bad", which was correct only while a category was wholly checked
or wholly unchecked. With per-item `unchecked` it reported real armor as "not
recognised". They now tally verified / not recognised / not in the list
separately. **If another partial category is ever added, that split is the
thing to check first.**

The self-test from v13 still holds and was re-run: parse the grounded prompt the
way a model would, feed every name to `lookupItem()`, expect all `ok` — now
**1,271 of 1,271, zero failures**.

**On adding scaling data.** The CSV is ready for it; a source is not. Item
names recalled from a model were good enough because they are checkable against
counts and against each other, and errors show up as obviously-wrong names.
Scaling grades, requirement numbers and weapon categories are none of those
things — a wrong `B` for an `A` is invisible and propagates straight into
generated builds. Take those from the game's params or a community dump, bake
them in as static CSV columns, and keep the runtime offline.

### Weapon params, 2026-08-22

The weapons table now carries `category`, `maxUpgrade`, five `req*` columns,
five `scale*` columns and `passive`, taken from the game's own
`EquipParamWeapon` at **patch 1.14** (post-DLC). Source: the regulation dump in
[Impossiblefella/elden-ring-aow-calculator](https://github.com/Impossiblefella/elden-ring-aow-calculator),
`packages/server/src/data/regulation-vanilla-v1.14.json`.

**Why this source and not recall.** Scaling grades and requirement numbers are
invisible when wrong — nothing downstream can tell a `B` that should be an `A`.
The dump also ships `scalingTiers`, so the coefficient-to-letter thresholds
(S 1.75, A 1.4, B 0.9, C 0.6, D 0.25, E 0.01) come from the data rather than
from a remembered rule of thumb.

**The reconciliation that made it trustworthy.** The dump has 228 infusible
(affinity 0) plus 252 unique (affinity -1) armaments; minus `Unarmed` that is
**479, exactly the count already in the tracker, and all 479 matched by name
with nothing left over on either side.** Two independently sourced lists
agreeing exactly is much stronger evidence than either alone. If a future patch
dump disagrees on the count, reconcile before importing — do not assume the
newer file is right.

Derivations worth knowing:

- **Scaling is at max upgrade**: base `attributeScaling` × the top row of
  `reinforceTypes[reinforceTypeId]`. `maxUpgrade` is that array's length − 1,
  which is also what distinguishes smithing (+25) from somber (+10).
- **Only affinity 0 and −1 are kept.** The other twelve affinities are the same
  weapon re-rolled; a build names "Uchigatana", never "Keen Uchigatana", and
  keeping them would have made the table 3,216 rows.
- **`passive` is the base status buildup** (100 weapons have one), read through
  `statusSpEffectParamIds` into `statusSpEffectParams`. It is the weapon's own
  value at standard affinity, not a per-upgrade figure.

**What this unlocked: `requirementIssues()`.** With requirements in the table,
the tool can check something it never could before — whether the build's *own*
final phase can actually wield the weapons it plans around. This is a common
LLM failure (a bleed build that never levels Arcane far enough for Rivers of
Blood), it is checkable with certainty, and it now appears three places: a flag
on the row, the build's problem count, and the correction prompt, which states
the shortfall and attaches the weapon table so the model can re-pick.

The check uses the last phase that names all eight stats, so a build with an
incomplete final phase is skipped rather than guessed at.

**What is still missing:** weapon weight (not in this dump), and armor stats of
any kind. Armor remains names/slot/set only. If weight matters later, it needs a
different source — `EquipParamProtector` for armor, and weapon weight lives in
`EquipParamWeapon` but was not carried into this particular dump.

**Cost:** the grounded prompt went from 55KB to 74KB. Correction prompts that
involve a weapon problem now carry the full weapon table (~28KB) because
re-picking a weapon needs the requirements to pick against.

### The reference as a download, 2026-08-22

**Where the data lives:** inside `index.html`, in `REF_CSV` — seven CSV tables
stored as template literals, one per equipment category, each with its own
header row. There are no separate data files, and deliberately so: `fetch()` of
a local file is blocked by CORS from `file://`, so splitting the data out would
break double-clicking `index.html`, which is a property worth more than tidy
file layout.

**What changed:** the grounded prompt used to paste all seven tables inline,
74KB of it. That does not fit in a chat box, so the feature was good in theory
and unusable in practice. The data now leaves the page as a **file to attach**
instead: `itemsCsv()` builds one combined table and `downloadItemsCsv()` hands
it over as `elden-ring-items.csv`.

Design points worth keeping:

- **One table, not seven.** One attachment beats seven, and a browser prompts
  before allowing multiple downloads from one click anyway. The `type` column
  carries what the separate tables used to.
- **`type` is the equipment key** (`weapons`, `physick`, `spirits`, …) rather
  than a readable label, so a row maps directly onto the key the build JSON has
  to use. Do not "improve" this into prose.
- **Columns union automatically.** `itemsCsvColumns()` starts from the shared
  lead columns and appends whatever else the tables declare, in declaration
  order. Adding a column to a table puts it in the download with no other edit.
- **The file is sparse** — an armor row leaves the thirteen weapon columns
  empty — which costs about 30% in size (92KB against 63KB of actual CSV). That
  is the price of one table, and it is irrelevant for an attachment.

**Correction prompts no longer paste tables either**, which took them from 28KB
to 1.7KB. In the chat that produced the build the CSV is already attached
above, so re-sending it was pure waste; the prompt now names the file and the
`type` values to look at, and says to attach it again if the chat is new.

**If you ever reinstate an inline form**, the thing that made the old one work
was that prompt and validator agreed exactly — parse the prompt the way a model
would, feed every name to `lookupItem()`, expect all `ok`. That test still runs
against the download instead: 1,271 rows, zero failures.

### Weapon locations, 2026-08-22

All **479 weapons now carry a location**, parsed from the `==Acquisition==`
sections of [eldenring.wiki.gg](https://eldenring.wiki.gg) via the MediaWiki
API. Locations are not in `regulation.bin` in any usable form — the params hold
item lots, not world placement — so the wiki was the only realistic source.

**This is the approach HANDOVER prescribed after the v12 failure**, and it
worked: fetch raw wikitext and parse it deterministically, rather than routing
pages through a summarising model. Note that `WebFetch` *is* such a model, so it
is the wrong tool for this job however convenient it looks. The MediaWiki API
also batches 50 titles per request, so 479 pages cost about a dozen calls
instead of 479.

**Fetch and parse are separate scripts on purpose.** The raw Acquisition
sections were cached to disk first, then parsed offline, so the parser could be
iterated a dozen times without touching the wiki again. Do the same if this ever
needs redoing.

Output format matches the existing location style, `Region — Place — how`:

    Uchigatana        Limgrave — Deathtouched Catacombs — loot
    Moonveil          Caelid — Gael Tunnel — guaranteed drop
    Rivers of Blood   Mountaintops of the Giants — guaranteed drop

**Format variation is the whole difficulty.** Editors write the label at least
four ways — `'''Loot:'''`, `'''Loot''':`, and either wrapped in `<u>` — and the
first parser silently missed three of them, sending 150 weapons down the prose
fallback. Two more traps worth remembering:

- **Section headings contain `=`** (they embed `[[File:...|link=Acquisition]]`),
  so sections must be found line by line. A `[^=]*` character class fails on
  nearly every page, which is what made the first run look like the data was
  missing.
- **`Mt.` and `St.` look like sentence ends.** The prose fallback split on
  `". "` and truncated "First Mt. Gelmir Campsite" to "First Mt".

Where a page has no labelled line, the first sentence of prose is used, capped
at 140 characters (114 entries). Those read fine — "Found on a corpse in
Stormveil Castle, near the Stormveil Cliffside grace" — but they are the ones to
re-check first if anything looks off. Weapons dropped by common enemies across
many regions render as "Limgrave and elsewhere — drop", which is honest about
being farmable rather than sited.

Two known soft spots: `Beast Claw` needs an explicit title override because its
own name redirects to a disambiguation page (`TITLE_OVERRIDES` in the fetch
script), and a handful of entries name a boss where a place would read better
(`Serpent-Hunter — Praetor Rykard — loot`).

**What this unlocked:** location cross-checking now works for weapons. It
already existed — `locationsAgree()` compares at region granularity — but had
nothing to compare weapons against. A build claiming Rivers of Blood is in
Caelid now gets the wiki's Mountaintops shown against it, while a correct
location stays quiet.

The combined CSV download is now 115KB.

### Filling in the rest of the data, 2026-08-22

Every table now carries what the wiki has for it, from the same MediaWiki
pipeline the weapon locations used. The infoboxes turned out to be the richest
seam: they are uniform, machine-written, and cover every category.

| table | added |
| --- | --- |
| weapons | weight, skill, location (479/479 location, 478 weight+skill) |
| armor | location, weight, poise and nine defence values (187/187) |
| talismans | effect, weight (153/154) |
| physick | effect (37/37) |
| spells | category, effect, fp, slots, reqInt, reqFai, reqArc (213/213) |
| ashes | location, affinity (116/116), fp (39/116) |
| spirits | effect, cost (82/84), location (78/84) |

**The parser splits infobox parameters on top-level `|` only.** Nested
templates and `[[links]]` contain pipes of their own; splitting naively
shreds half the values. Same class of bug as the heading `=` problem from the
location pass.

**Requirement checking now covers spells.** A spell's int/fai/arc requirement is
the same idea as a weapon's and lives in the same three `req*` columns, so
`requirementIssues()` generalises by iterating `REQ_CATS` — `{weapons: "wield",
spells: "cast"}` — and picking the attribute subset per category. A sorcerer
build that stops at 45 Intelligence is now told it can neither wield Lusat's
Staff (52) nor cast Comet Azur (60).

`weaponMeta()` became `itemMeta(catKey, ref)` for the same reason: every table
has something worth showing on the row now, not just weapons.

**The wiki caught two errors in our own armor data**, which is the real argument
for cross-checking against an external source rather than trusting recall:

- `Haligtree Helm/Armor/Gauntlets/Greaves` are actually **`Haligtree Knight`**
  pieces. Renamed.
- **`White Reed Helm` does not exist.** The White Reed set has three pieces; its
  head is the separately named Okina Mask, which was already in the table.
  Removed, so armor is 187 rows and the total is 1,270.

Against that, all 187 recalled armor **slots** matched the wiki exactly, so the
slot data was sound even where two names were not.

**Six items need explicit title overrides** (`TITLE_OVERRIDES` in the write
script) because their own name does not reach their page: `Beast Claw` is both a
weapon and an incantation and resolves to a disambiguation, `Minor Erdtree` and
`Land of Shadow` collide with region pages, `Battlemage Hugues` resolves to the
enemy, and the wiki files `Perfumer Tricia Ashes` without its suffix.

**Genuinely blank, not broken:** `Fine Crucible Feather Talisman` has empty
effect and weight fields on the wiki itself; `Latenna the Albinauric` and
`Battlemage Hugues` have NPC pages rather than spirit-ash infoboxes; and 77 of
116 Ashes of War list no FP cost because they have none.

The CSV download is now 190KB across 35 columns. That is large for a paste and
irrelevant for an attachment, which is why it is a download.

## 7. Repo notes

- Git identity is set **repo-locally** (`Paraiga` /
  `137770356+Paraiga@users.noreply.github.com`); the global git config is
  untouched, so other repos are unaffected and will ask again.
- The repo is public. Commit history was rewritten once, on 2026-08-10, to
  replace a personal email with the GitHub `noreply` address — history is clean
  and no further action is needed. New commits pick up the noreply address
  automatically from the repo-local config.
- Worth doing on GitHub: **Settings → Emails → "Keep my email address private"**
  and **"Block command line pushes that expose my email"**. The second turns this
  class of mistake into a rejected push rather than a public leak.
- `.gitignore` excludes `elden-ring-tracker-backup-*.json`, so exported progress
  files dropped in this folder stay out of the repo automatically.
