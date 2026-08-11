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

## Future features
Deliberately empty. Weapons/armor, upgrade materials and pot tracking were the
old roadmap; the v8 cut is the decision not to do them.

Also deliberately not doing: splitting oversized "Open World" blocks by sub-area.

## Notes
- **See `HANDOVER.md`** for current state, data conventions, the save-ID
  migration rule, and GitHub Pages setup.
- Data lives in `DATA` and `QUESTS` in `index.html`.
- Checkmarks are keyed `Zone::Category::Name::Location`, so renaming an entry
  un-checks it — add an `ID_MIGRATIONS` line whenever an entry moves or is
  relabelled, and verify by seeding the old ID.
