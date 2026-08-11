# Elden Ring Tracker

A single-file, offline completion tracker for Elden Ring and Shadow of the Erdtree.
Everything you check off is saved in your browser — no account, no server, no network.

**304 dungeons and bosses across 37 zones, plus 295 quest steps across 34 questlines.**

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
| Bosses | 200 — field, evergaol and night bosses included |
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
