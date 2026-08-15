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

**311 world items across 37 zones (123 place blocks) + 295 quest steps across
34 questlines.** The header shows these as two independent progress bars — they
are deliberately *not* summed, since quest progress is a different kind of thing.

| Category | Count |
| --- | ---: |
| Bosses | 207 |
| Dungeons (the "cleared" checkbox on each dungeon block) | 104 |
| **Total** | **311** |

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
