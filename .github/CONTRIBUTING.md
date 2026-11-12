## Contributing

### Repository structure

#### Data (`data/`)

- One JSON file per palette, `data/{slug}.json`, mapping color names to hex values.
- `data/_meta.json` lists every palette that is built: its display name, description and source. A palette is only built if it is listed there.

#### Build scripts (`utils/`)

- `utils/generator.py` builds `{slug}.css`, `{slug}.min.css`, `colors.css` and `colors.min.css` in the repository root.
- `utils/data.py` builds `assets/js/data.min.js`, which the index page renders from.
- `utils/coolors_co.py` is a helper for turning a coolors.co shade ramp into palette JSON.
- The `build.yml` workflow runs both build scripts and commits the output whenever `data/` or `utils/` change on `main`, so do not edit the generated CSS or `data.min.js` by hand.

#### Site (`index.html`, `assets/`)

- `index.html` and `assets/styles.css` are the documentation page.
- `assets/js/` holds the page's vanilla JavaScript; there are no runtime dependencies.

#### Style

- Linting and formatting come from [.normal](https://github.com/eustasy/.normal); run `qlty check` and `qlty fmt` locally.

### Releases

1. Update `version` in `utils/generator.py` and push; the build workflow regenerates the CSS headers.
2. Tag a release on GitHub using semantic versioning (`2.1.2`, no leading `v`).
3. jsDelivr picks up the new tag automatically; the `@2` links need no change within the major.
