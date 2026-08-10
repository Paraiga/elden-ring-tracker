# Handover

Context for picking this project back up. Written 2026-08-10.

Repo: <https://github.com/Paraiga/elden-ring-tracker> (public)

---

## 1. What this is

A single-file offline completion tracker for Elden Ring + Shadow of the Erdtree.
Open `index.html` in a browser — no build step, no dependencies, no network.
Progress saves to `localStorage` on every click.

`serve.js` exists only for local dev; it is not needed to use the tracker.

## 2. Current state

**1,388 world items across 37 zones (125 place blocks) + 295 quest steps across
34 questlines.** The header shows these as two independent progress bars — they
are deliberately *not* summed, since quest progress is a different kind of thing.

| Category | Count |
| --- | ---: |
| Graces | 414 |
| Bosses | 200 |
| Key Items (maps, cookbooks, prayerbooks, scrolls, bell bearings) | 163 |
| Talismans | 157 |
| Incantations | 129 |
| Dungeons (the "cleared" checkbox on each dungeon block) | 104 |
| Spirit Ashes | 84 |
| Sorceries | 84 |
| Bolstering Materials (Golden Seeds, Sacred Tears) | 53 |
| **Total** | **1,388** |

## 3. How the data is organised

Zones are ordered by a **recommended progression route** (based on the Rock Paper
Shotgun route), not alphabetically. Each zone contains **place blocks**: every
dungeon is a card holding its own bosses, items and graces, and everything else
in that region sits in that zone's "Open World" block.

All data lives in the `<script>` block in `index.html`:

- `DATA` — zones, their place blocks, bosses, and `keyItems`
- `GRACES`, `SPIRIT_ASHES`, `SORCERIES`, `INCANTATIONS`, `BOOKS`,
  `BELL_BEARINGS` — all keyed `"Zone name::Place name"`
- `QUESTS` — questlines with ordered, zone-tagged steps
- `classifyKeyItem()` — splits the `keyItems` arrays into Talismans /
  Bolstering Materials / Key Items **by name pattern**, so new items file
  themselves correctly. Rules are already in place for upgrade materials and
  pots that aren't in the data yet.

### The one rule that matters

**Save IDs are `Zone::Category::Name::Location`.** Renaming or moving an entry
changes its ID, which silently un-checks it.

Whenever an entry is renamed, relabelled, or moved between zones/categories, add
a line to `ID_MIGRATIONS` (or `ZONE_MIGRATIONS` for a whole zone) mapping old ID
to new. `migrateChecked()` remaps saved progress on load and when importing older
backups. It searches zone-renames and category-splits *in combination*, so an old
backup needing both still resolves.

Every migration so far has been verified by seeding the stale ID, reloading, and
confirming it lands on the new entry. Keep doing that — it is cheap and it is the
only way to know progress survived.

## 4. Known data-quality issues

**22 entries are tagged `(verify)`** — their wiki source was too vague to place
confidently, so the zone is a best guess. Two such guesses have already been
corrected in game and *both* turned out to be in the underground cities:

- Greatshield Soldier Ashes — guessed Weeping Peninsula, actually **Nokron**
- Archer Ashes — guessed Limgrave, actually **Nokstella**

They share a fingerprint: the source gave only a generic phrase ("corpse in a
gravesite", "corpse on a balcony") with no region. Three remaining flags match
that pattern and are prime suspects for also being underground:

- Wandering Noble Ashes — "corpse propped against a coffin" → guessed Limgrave
- Avionette Soldier Ashes — "corpse near a tombstone" → guessed Altus Plateau
- Man-Serpent Ashes — "on top of a stone table" → guessed Volcano Manor

Full list of flagged entries:

| Entry | Currently placed in |
| --- | --- |
| Wandering Noble Ashes | Limgrave |
| Noble Sorcerer Ashes | Limgrave |
| Twinsage Sorcerer Ashes | Liurnia of the Lakes |
| Fanged Imp Ashes | Academy of Raya Lucaria |
| Depraved Perfumer Carmaan | Altus Plateau |
| Avionette Soldier Ashes | Altus Plateau |
| Wrath of Gold | Altus Plateau |
| Fire Monk Ashes | Mt. Gelmir |
| Man-Serpent Ashes | Volcano Manor |
| Fingercreeper Ashes | Scadu Altus |
| Sharpshot Talisman | Gravesite Plain |
| Flamedrake Talisman +3 | Castle Ensis |
| Fine Crucible Feather Talisman | Ancient Ruins of Rauh |
| Talisman of All Crucibles | Ancient Ruins of Rauh |
| Talisman of the Dread | Jagged Peak |
| Greater Potentate's Cookbook [2] | Gravesite Plain |
| Greater Potentate's Cookbook [12] | Gravesite Plain |
| Greater Potentate's Cookbook [7] | Scadu Altus |
| Greater Potentate's Cookbook [10] | Scadu Altus |
| Greater Potentate's Cookbook [9] | Ancient Ruins of Rauh |
| Battlefield Priest's Cookbook [1–4] → [3] | Scadu Altus |
| Finger-Weaver's Cookbook [1] | Scadu Altus |

### Sourcing lessons

- Fextralife **list pages** are unreliable for locations: the sorcery list gave
  wrong regions (Castle Ensis labelled Limgrave), the incantation list silently
  truncated at "F", and the Spirit Ashes page has no location data at all.
- Fextralife **per-dungeon pages** are excellent (exact in-dungeon locations).
- Game8 list pages were the best source for spirit ashes and spells.
- Broad region pages (e.g. "Limgrave") list which items exist but *not where*.
- **Deserter's Cookbook is deliberately excluded** — it appears on wikis but was
  cut before release, so it would be an unobtainable checkbox making 100%
  impossible.
- When a single secondary source contradicts existing data, do not overwrite on
  that alone. This happened with the Church of Vows Bell Bearing Hunter: one
  guide said "morning only", the data was changed to `(daytime)`, and it was
  wrong — all four hunters are nocturnal. Reverted.

## 5. What was done in the last session

1. **Findable equipment, part 1** — Spirit Ashes (84), Sorceries (84),
   Incantations (129) as three new filter categories. Counts match published
   totals exactly. Merchant-sold spells are filed at the merchant's physical
   location; remembrance trades under Roundtable Hold.
2. **Split "Key Items"** into Talismans / Bolstering Materials / Key Items using
   the game's own terminology, via `classifyKeyItem()`.
3. **Cookbooks, prayerbooks, scrolls** — 115 entries (104 cookbooks, 8
   prayerbooks, 3 scrolls). No gaps in any numbered family.
4. **Bell bearings** — 26 entries, boss drops and world finds only. The ~30
   NPC-death bearings are deliberately excluded.
5. **Spells moved to Miriel** — all scroll- and prayerbook-gated spells now sit
   with Miriel (who receives all books in this playthrough) rather than Sellen
   or Corhyn, each labelled with the book that unlocks it.
6. **Split the header total** into separate Zones and Quests bars.
7. **UX pass** (see §6).

## 6. UX work done, and what's left

Fixed:

- **Mobile horizontal scroll** — the page was 526px wide in a 375px viewport and
  panned sideways, with the Quests counter off-screen. Progress groups now wrap
  as units.
- **Header height** — 215px → 179px open / 113px collapsed on desktop; 396px →
  187px collapsed on mobile. Occasional actions moved into a `⋯` menu; the
  filter chip row is collapsible and remembers state (starts collapsed on narrow
  screens as a first-run default only).
- **Row wrapping** — 337 wrapped rows → 0. Names hold one line; locations
  truncate with an ellipsis, right-aligned, full text on hover. Scoped to
  `#tracker` only — quest steps are sentences and must keep wrapping.
- **Sticky zone headers** — the zone name, count and bar stay pinned while you
  scroll its contents. Implemented with CSS `position: sticky`; note this
  required removing `overflow: hidden` from `.zone` (it silently disables sticky
  on descendants), and a `ResizeObserver` keeps the `--header-h` CSS variable
  matched to the live header height.

Suggested but not done:

- Splitting oversized "Open World" blocks by sub-area — **explicitly declined**,
  no need to revisit.
- Brighter progress-bar tracks (they are near-invisible at 0%).
- Larger tap targets on mobile (checkboxes are 14px).
- Per-category colour accents, so categories can be found without reading.
- "What's left" breakdowns on zone headers (e.g. "12 bosses, 3 dungeons left").

## 7. Remaining roadmap

1. **Weapons and armor** — the big one, and the last major piece of "findable
   equipment". Per-dungeon wiki pages have excellent data for this (a test pull
   of Stormveil returned exact per-item locations); the overworld portion is the
   hard part, since region pages don't give per-item locations.
2. **Upgrade materials** — Smithing Stones, Somber Smithing Stones, Ghost/Grave
   Gloveworts, Scadutree Fragments, Revered Spirit Ash. `classifyKeyItem()`
   already routes all of these into Bolstering Materials automatically.
3. **Cracked pots / ritual pots / perfume bottles** — already routed to Key Items
   by the classifier.
4. **Legacy dungeon loot checklists** — partially covered now that equipment
   categories exist; may fold into item 1.

## 8. Running it on your phone (GitHub Pages)

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

## 9. Repo notes

- Git identity is set **repo-locally** (`Paraiga` / `clockworksolace@gmail.com`);
  the global git config is untouched.
- **The repo is now public, so that commit email is publicly visible.** If that
  is unwanted, GitHub can supply a `noreply` address (Settings → Emails → *Keep
  my email address private*), which you would then set with
  `git config user.email <id>+Paraiga@users.noreply.github.com`. Note that
  changing it only affects *future* commits; the existing one would need history
  rewriting.
- `.gitignore` excludes `elden-ring-tracker-backup-*.json`, so exported progress
  files dropped in this folder stay out of the repo automatically.
