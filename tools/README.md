# tools

Build-time scripts for regenerating the reference data inside `index.html`.

**These are not runtime dependencies.** `index.html` stays one self-contained
file that works from `file://` with no build step. These exist so the ~1,700
rows of data inside it can be regenerated after a game patch, instead of being
hand-edited.

Requires Node. No packages to install.

```bash
node tools/params-sync.js    # weapon stats from the game's own params
node tools/wiki-sync.js      # everything else, from eldenring.wiki.gg
node tools/damage-sync.js    # the tables needed to compute attack rating
node tools/selftest.js       # must pass before committing
```

Run `params-sync` before `wiki-sync`: the wiki pass preserves whatever columns
it finds, so the param columns need to exist first.

## params-sync.js

Fills weapon `category`, `maxUpgrade`, `infusible`, the five `req*`, the five
`scale*` and `passive` from a `regulation.bin` dump at patch 1.14.

Scaling grades and requirement numbers are **never** taken from recall: a wrong
`B` where the game says `A` is invisible and propagates into every generated
build. The dump also ships the game's own coefficient-to-letter thresholds, so
even the grade boundaries are data.

**It refuses to write if the weapon list disagrees with `index.html`.** The dump
must yield exactly the same 479 armaments, with nothing left over on either
side. If a future patch changes that, reconcile deliberately rather than
assuming the newer file is right.

Flags: `--refetch` re-downloads the dump, `--dry` reports without writing.

## wiki-sync.js

Fills everything else from the wiki's infoboxes and `==Acquisition==` sections:
locations everywhere, weapon weight and skill, armor stats, talisman and tear
effects, spell requirements, spirit ash costs.

The armor table is rebuilt wholesale from the wiki's `Head`/`Chest`/`Arms`/`Legs`
categories plus the `Armor Sets` page; the other tables keep the names they have
and only gain columns.

Flags: `--refetch` re-fetches every page, `--dry` reports without writing.
Pages are cached in `.wiki-cache.json` so the parser can be iterated without
hitting the wiki.

### Things that will bite you again

Every one of these silently produced *wrong* data rather than an error:

- **Section headings contain `=`** — they embed `[[File:...|link=Acquisition]]`.
  Find sections line by line; a `[^=]*` character class fails on almost every
  page and makes the data look absent.
- **Infobox parameters split on top-level `|` only.** Nested templates and
  `[[links]]` carry their own pipes.
- **Editors write labels four ways**: `'''Loot:'''`, `'''Loot''':`, and either
  wrapped in `<u>`.
- **`Mt.` and `St.` look like sentence ends** in the prose fallback.
- **The Armor Sets page has traps**: DLC headings carry `{{SOTE}}` after the
  link, and an `Armor Pieces` section below the sets uses identical headings for
  things that are not sets. A heading that fails to parse must reset the current
  set to null, or its pieces get filed under the previous one.
- **Do not route pages through a summarising model.** It was tried once; it
  truncated and invented entries. Parse the raw wikitext.

## damage-sync.js

Extracts the four tables attack rating needs — growth curves, which attributes
scale which damage type, per-upgrade multipliers, and base attack — from the
same regulation dump `params-sync.js` downloads. Run it after that.

**It verifies itself against a second source.** It recomputes every weapon's +0
base attack and +0 scaling letters from the numbers it is about to write and
checks them against the wiki infobox values `wiki-sync.js` cached. Those are
the two halves of the formula's input, independently sourced. Expect about
97% exact agreement on base attack and 99% on scaling letters; the residual is
patch drift plus bows and shields, which the wiki writes up differently. It
refuses to write above 10% disagreement, which would mean the extraction is
broken rather than drifting.

Getting this wrong is worse than not having it: a wrong AR is a confident
number and nothing downstream can tell.

It also emits the twelve affinities, 2,736 rows. Those are keyed by **base
weapon id plus affinity id**, never by name — the game files write
`Celebrant's Heavy Sickle` with the affinity in the middle. That relation holds
for every row, and the script refuses to write if any row fails it.

## selftest.js

Loads the page's own script into Node and checks that the CSV the Build tab
hands to a model parses back to names the validator accepts — all of them.
That agreement is the whole point of the grounding: a model that obeys the
prompt produces a build that validates clean.

Also checks table shape, that no armor "set" is implausibly large (the symptom
of a wiki heading failing to parse), and that affinity names resolve.

Exit code is non-zero on failure, so it works in a hook or CI.
