# Elden Ring Tracker

A single-file, offline completion tracker for Elden Ring and Shadow of the Erdtree.
Everything you check off is saved in your browser — no account, no server, no network.

**314 dungeons and bosses across 37 zones, plus 295 quest steps across 34 questlines**
— and a Build tab for your own character plan.

## Running it

Open `index.html` in any browser. That's it — there's no build step and no
dependencies.

`serve.js` is only there for local development if you'd rather use a dev server
than the `file://` protocol.

> Note: progress is stored per-origin. A page opened from `file://` and the same
> page served from `localhost` keep **separate** save data.

## What it tracks

| Category | Notes |
| --- | --- |
| Dungeons | 104 — each is a block with a "cleared" checkbox in its header |
| Bosses | 210 — field, evergaol and night bosses included |
| Quests | 295 steps across 34 questlines, in a separate Quests view |

Zones are ordered by a recommended progression route rather than alphabetically.
Each zone is split into **place blocks** — every dungeon is its own card holding
its bosses, and anything out in the world sits in that zone's "Open World" block.

### What it deliberately does not track

Graces, talismans, key items, bolstering materials, spirit ashes, sorceries and
incantations were all tracked up to v7 and **removed in v8**: roughly 1,200 extra
checkboxes turned out to be more bookkeeping than the tracker was worth.

If you ever want one back, the data is in the v7 commit, and old ticks were never
deleted from `localStorage` — see the note in `HANDOVER.md`.

## The Build tab

A third view, next to Zones and Quests, holding your own character plan: a name
and description, what to level toward at level 30 / 60 / 90 / 120, and a
checklist of gear to collect with locations.

Nothing ships with the tracker — you import a build as JSON. The Build tab gives
you the prompt to hand an LLM; paste the answer back into the tab (or load it
from a `.json` file) and it renders.

**Copy the prompt**, then **Download item data (CSV)** and attach that file to
the same chat. The CSV is every real item in the game — 1,271 rows across
weapons, armor, talismans, spells, ashes of war, spirit ashes and crystal tears
— and the prompt tells the model to choose only from it, so it picks from real
items instead of recalling them. For weapons the file also carries what each one
needs to be wielded, which the model is told to respect.

It is an attachment rather than part of the prompt because the inline version
ran to 74KB, which does not fit in a chat box.

- Several builds can live side by side; chips at the top switch between them.
- Re-importing a build with the same name replaces it and **keeps your ticks**
  on any gear it still lists, so a corrected plan costs you nothing.
- Builds and their checklists ride along in **⋯ → Export backup**.

### Stat checking

Generated builds are frequently wrong about arithmetic, so the tab checks them.
Every Elden Ring character's eight stats add up to exactly **level + 79** — a
level-1 Wretch holds 80 points and each level buys one more — so any phase that
misses that total is not reachable in game.

The stat table shows a **Level these stats need** row beside the level each
phase claims, flags the phases that disagree, and lists what is wrong in plain
language underneath. It also catches stats spent below the starting class's
values, stats that go down between phases, a first phase that is not the named
class's real spread, levels that do not increase, and values above 99.

A failing build still imports and still renders — the tool reports, it does not
refuse. The prompt in the tab states the arithmetic rule and includes all ten
class stat blocks, which is the cheapest way to get correct builds in the first
place.

### Fixing a broken stat plan

An overspent phase has two correct fixes, so both are offered as buttons under
the findings:

- **Rebalance stats to these levels** keeps your level 30 / 60 / 90 / 120
  milestones and rescales each phase's stats to fit — in proportion to how much
  the build invests in each stat, so a Dexterity/Intelligence build stays one.
- **Restate levels to match stats** keeps the spread exactly as written and
  moves the milestones to where those stats are actually reachable.

Either way the tool tells you exactly what it changed, and **Revert to imported**
brings back the original file. Nothing is ever repaired automatically, and a
phase with no legal fix (a level-5 Confessor, say) is left alone and stays
flagged rather than guessed at. Equipment ticks are never touched.

The importer is deliberately forgiving about key names, nesting and stray
markdown fences, since no two LLM answers are shaped quite alike.

### Equipment checking

The tab also checks that the gear a build names actually exists, against 1,271
real item names embedded in the page:

| Checked | Partial | Not checked |
| --- | --- | --- |
| Weapons (479, including shields, staves, seals and bows) | Armor (188 pieces, 46 sets) | "Other" |
| Spells (213), Talismans (154) | | |
| Ashes of War (116), Spirit Ashes (84), Crystal Tears (37) | | |

The armor table covers the sets builds actually name, not all of them. A name
missing from a partial table is reported as **"not in the list"** — never as an
error, since absence there proves nothing.

An invented item is flagged on its row. A misspelling of a real one is flagged
with the correct name and a button to apply it — renaming keeps your checklist
tick. Where the reference knows the location and your build's looks like a
different region, the wiki's is shown alongside; matching regions stay quiet.

**Categories with no reference list say "not checked" rather than passing
silently**, so an unflagged item always means it was actually verified.

The reference is stored as CSV, one table per category with a header row naming
its columns. Adding a column needs no parser change: every column rides along on
the entry and goes into the prompt as-is.

The weapons table carries real data from the game's own params at patch 1.14 —
category, max upgrade, the five stat requirements, the five scaling grades at
max upgrade, and passive status buildup. So a verified weapon shows what it is:

> **Rivers of Blood** — Katana · somber +10 · needs 12 Str, 18 Dex, 20 Arc ·
> scales E Str, B Dex, D Arc · Bleed 50

**And the tab checks that your build can actually wield its own weapons.** If
the final phase never reaches 23 Intelligence, a plan built around Moonveil is
flagged — on the row, in the problem count, and in the correction prompt with
the exact shortfall. It is a mistake LLM-written builds make often.

Name matching is forgiving about the spellings that differ in practice: accents
(`Miséricorde` / `Misericorde`), the optional `Ash of War: ` prefix, a trailing
` Ashes` on spirit ashes, `St.` versus `St`, and `+1` / `+2` suffixes.

### When a build has problems

One button in the build header — **Copy a prompt to fix N problems** — writes a
self-contained correction prompt: the build itself as JSON, every stat fault and
bad item name in plain language, and the real names for just the categories that
failed. Paste it back to the model, re-import the answer, and your equipment
ticks are kept. The button disappears once the build is clean.

**Copy build as JSON** hands you the build in its import format, for sharing or
for moving one build between devices without exporting the whole tracker.

## Saving and backups

Progress auto-saves to `localStorage` on every click. Use **⋯ → Export backup**
to download a JSON file, and **Import backup** to restore it.

Worth doing occasionally: clearing your browser data will wipe the tracker, and
an export is the only thing that survives it.

## Editing the data

All data lives in the `<script>` block in `index.html`:

- `DATA` — zones, their place blocks and bosses
- `QUESTS` — questlines and their ordered steps

**Renaming an entry changes its save ID and would silently un-check it.** When an
entry moves or gets relabelled, add a line to `ID_MIGRATIONS` (or `ZONE_MIGRATIONS`
for whole zones) mapping the old ID to the new one — `migrateChecked()` remaps
saved progress on load, and on import of older backups.

## Data sources

Compiled from the Fextralife wiki, Game8 and other community guides, and
corrected in-game where those disagreed with reality.
