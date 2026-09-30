# NutriLog — working notes

## Deploys

Push finished, verified work straight to `main` without asking first. `main` is
what Vercel deploys, so a push to it goes live. Verify before pushing: `npm test`
and `npm run build` must both pass, and behaviour changes should be checked in a
real browser, not just asserted.

(Standing instruction from the repo owner. Remove this section to go back to
being asked before each deploy.)

## Storage

`src/storage.js` keeps the **primary** key as plain JSON on purpose and
compresses only the `_bak` copy. A build older than 2.0.0 reads the primary
first and `JSON.parse`s it directly, so compressing the primary makes a rollback
look like total data loss. `nl4_snapshot` stays plaintext for the same reason —
it is the copy an older build falls back on when the primaries are empty.
`tests/storageRollback.test.js` pins this contract.

## Archived versions

`src/versions/1.10.0/` and `src/versions/1.9.2/` are frozen snapshots with their
own `helpers.jsx`, reachable from Settings → History. Do not refactor them.
`createVersionStorage` in `src/appVersions.js` copies `nl4_*` values into an
archive prefix and must hand those builds **uncompressed** values.

## The API route

- System prompts live in `api/_lib/prompts.js` and must never reach the browser.
  The client posts a prompt NAME (`assistant` / `ingredients` / `nutrients`) plus
  the conversation; the server owns the text. Putting a prompt back in `src/`
  would re-open the endpoint as a steerable Claude proxy on the owner's key.
- `api/_lib/` is underscore-prefixed on purpose: Vercel turns every other file
  under `api/` into a public route. Shared code must stay in `_lib`.
- The frozen builds under `src/versions/*` still post their own `system` string,
  so `api/chat.js` keeps a legacy path that accepts one. Do not remove it, and do
  not "fix" those builds to use the new shape — they are frozen.
- The assistant prompt is split in two blocks: the big stable half carries
  `cache_control`, and search mode + style hint go AFTER it. Anything varying
  that moves into the first block silently costs a full-price prefix on every
  request. `tests/apiChat.test.js` asserts the stable block never varies.
- The origin check compares the request's `Origin`/`Referer` host to its own
  host, so Vercel preview deployments work without configuration. `ALLOWED_ORIGINS`
  (comma-separated hosts) is the escape hatch for anything cross-origin.
- Sonnet 5.5 runs adaptive thinking whenever `thinking` is omitted, and thinking
  tokens count against `max_tokens`. That is why `max_tokens` is 4000 rather than
  the old 1500 — lowering it truncates the JSON mid-object.

## Full-screen sizing (got this wrong twice — read before touching it)

- Take the SIZE from `window.visualViewport`, never `window.innerHeight` and never
  a `position:fixed; inset:0` box. On iPhone with `viewport-fit=cover` the layout
  viewport stays taller than what is on screen, so both overshoot and the bottom
  is drawn off-display. The app root (`vh` in `App.jsx`) and `GlowBorder` must
  stay on the same source. Listen to visualViewport's `resize` only.
- Take the POSITION from nothing: pin to `top:0; left:0`, as the app root does.
  `visualViewport.offsetTop` is NOT a correction to apply to a `position:fixed`
  element — it changes as the page scrolls, so adding it drags the element down
  the screen on every scroll. Do not listen to visualViewport `scroll` either;
  there is nothing legitimate to do with it here.
- `main.jsx` styles `html, body, #root` in ONE rule with a hardcoded near-black so
  the page is not white before boot. `#root` is a full-height element sitting
  under the fixed app root, so repainting only html and body leaves it showing
  through as a dark band. The theme effect in `App.jsx` must set all three, plus
  the `theme-color` meta that iOS tints standalone chrome from.

## Conventions

- No CSS files; components use inline styles and read theme tokens from
  `src/theme.js` (`T`). `applyTheme` mutates `T` in place, so the object
  identity is shared — import it, don't copy it.
- `themeVersion` in `App.jsx` exists only to trigger a re-render after
  `applyTheme`. Never make it a `key`: that remounts the whole tree and throws
  away open menus, drafts and scroll position on every theme change. Nothing is
  memoised, so a plain re-render already repaints every inline style.
- Pair `backgroundClip:"text"` with `backgroundImage`, not the `background`
  shorthand. React warns and can drop the clip when it updates a shorthand in
  place, which would turn gradient text into a solid block.
- Ambient backdrops live in `src/ui/ThemeScenery.jsx`, keyed by theme id
  (`SCENES`). A theme with no entry simply has no scenery. Celebration confetti
  still switches to bats on `theme?.id === "halloween"` in `App.jsx`.
- Scenery animates transform and opacity only, so the compositor handles it
  without relayout. Particle lists MUST be built in `useMemo`: App re-renders on
  every keystroke, and regenerating the random values restarts every animation
  mid-flight. Falling effects use negative `animation-delay` so the screen is
  already populated on the first frame.
- Pure logic lives in plain `.js` modules so `node --test` can import it
  directly; React components live in `src/ui/*.jsx`.
