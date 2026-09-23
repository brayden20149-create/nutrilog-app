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
- Halloween-only flourishes (pumpkins, bats) are gated on `theme?.id === "halloween"`.
- Pure logic lives in plain `.js` modules so `node --test` can import it
  directly; React components live in `src/ui/*.jsx`.
