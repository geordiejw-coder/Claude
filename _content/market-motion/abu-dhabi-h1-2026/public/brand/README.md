Place the OFFICIAL sp_ce logo here as `sp_ce-logo.svg`.

The signature ending detects this file automatically and cross-fades from the
morphed letterforms onto it. Without it, the render shows a labelled
PLACEHOLDER instead of faking the logo with type. After adding it, tune
`LOGO.fit` in `src/brand.ts` so the hand-off lands without a jump, then re-render.
