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

## Future features (add incrementally)
1. **Legacy dungeon checklists** — notable loot inside the big legacy dungeons
2. **Findable equipment** — weapons, armor, spirit ash summons, sorceries and incantations
   (world pickups only — random enemy drops excluded)
3. **Upgrade materials** — Smithing Stones / Somber stones (bell bearings), Ghost Gloveworts,
   Scadutree Fragments, Revered Spirit Ash
4. **Cookbooks, prayerbooks, scrolls**
5. **Cracked pots / ritual pots / perfume bottles**

## Notes
- Data lives in the `DATA` array at the top of the `<script>` in `index.html` — easy to hand-edit.
- Checkmarks are keyed by item name, so renaming an entry un-checks it (export a backup first).
