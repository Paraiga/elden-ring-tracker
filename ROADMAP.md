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
  a per-zone step count (✦ = starts here); clicking jumps to the quest card.
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

## Future features (add incrementally)
1. **Weapons and armor** — the last major piece of findable equipment. Per-dungeon
   wiki pages have exact locations; the overworld portion is the hard part.
2. **Upgrade materials** — Smithing / Somber Smithing Stones, Ghost and Grave
   Gloveworts, Scadutree Fragments, Revered Spirit Ash. The classifier already
   routes all of these into Bolstering Materials.
3. **Cracked pots / ritual pots / perfume bottles** — already routed to Key Items.
4. **Legacy dungeon loot checklists** — largely subsumed by item 1.

Deliberately not doing: splitting oversized "Open World" blocks by sub-area.

## Notes
- **See `HANDOVER.md`** for current state, data conventions, the save-ID
  migration rule, the 22 `(verify)`-tagged entries, and GitHub Pages setup.
- Data lives in `DATA` plus the `"Zone::Place"`-keyed maps in `index.html`.
- Checkmarks are keyed `Zone::Category::Name::Location`, so renaming an entry
  un-checks it — add an `ID_MIGRATIONS` line whenever an entry moves or is
  relabelled, and verify by seeding the old ID.
