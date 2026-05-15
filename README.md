# Colors.css

[![Build Dist](https://github.com/eustasy/Colors.css/actions/workflows/build.yml/badge.svg)](https://github.com/eustasy/Colors.css/actions/workflows/build.yml)
[![Maintainability](https://qlty.sh/gh/eustasy/projects/Colors.css/maintainability.svg)](https://qlty.sh/gh/eustasy/projects/Colors.css)
[![jsDelivr](https://data.jsdelivr.com/v1/package/gh/eustasy/Colors.css/badge?style=rounded)](https://www.jsdelivr.com/package/gh/eustasy/colors.css)

A selection of colors stylesheets, with backgrounds and fills too.  
_Auto updated on [JSDelivr](https://www.jsdelivr.com/package/gh/eustasy/colors.css)_

## All palettes

`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eustasy/Colors.css@2/colors.min.css" crossorigin="anonymous">`

## Individual palettes

Replace `{palette}` with one of: `baseline`, `elementary`, `eustasy`, `flatui`, `flexoki`, `goddardhale`, `howtoelementary`, `material`, `ubuntu`

`<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/eustasy/Colors.css@2/{palette}.min.css" crossorigin="anonymous">`

## Using colors

Each color is available as a CSS custom property and as utility classes:

```css
/* CSS variable */
var(--flatui-belize-hole)
```

```html
<!-- Utility classes -->
<div class="background-flatui-belize-hole">...</div>
<p class="color-flatui-belize-hole">...</p>
<svg><path class="fill-flatui-belize-hole" /></svg>
<div class="border-color-flatui-belize-hole">...</div>
<svg><path class="stroke-flatui-belize-hole" /></svg>
<input class="outline-color-flatui-belize-hole">
<p class="text-decoration-color-flatui-belize-hole">...</p>
<input class="caret-color-flatui-belize-hole">
<input type="checkbox" class="accent-color-flatui-belize-hole">
```
