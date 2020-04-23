## Contributing

### Code Style & Repository Structure

#### Data (.json)
- Data is stored in the `data` folder.
- Data is stored in the `json` format.
- New data files for palettes must be added to `data/index.json` in the format: `"Palette Title": palette-slug,`

#### Python (.py)
- Utilities go in `utils`
- Follow Pythons own style guidelines.

#### CSS
- Non-repository CSS files go in the `css` folder.
- Color.css files go in the root folder.

#### JavaScript (.js)
- JavaScript files go in the `js` folder.
- jQuery is included on the documentation page, but may be removed in the future.
- Vanilla JavaScript is preferred.

#### Markdown (.md)
- Markdown styles are controlled by `.mdlrc` and `.mdlrc.style.rb`

### Releases and Updates
1. Update the version variable in `utils/generator.py`
2. Wait for automatic update of CSS with new version number.
3. Tag a release on GitHub in the normal way (semantic versioning please).
4. Update documentation of embed links to point to new release.
