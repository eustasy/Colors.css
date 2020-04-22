import json
import re
import os

#   Step 0. Initialize veriables
path = os.path.dirname(os.path.abspath(__file__))
types = ['background', 'color', 'fill']
version = '2.0.0-beta'
css_all = ''

#   Step 1. Load index.json
f = open(path + '/../data/index.json')
index = json.load(f)
f.close()

#   Step 2. Create individual palette files
for title, slug in index.items():
    css = ''

    # Not needed as index contains this already.
    # slug = re.sub('\s+', '-', title).lower()

    #   Step 2. a) Load palette data
    f = open(path + '/../data/' + slug + '.json')
    colors = json.load(f)
    f.close()

    #   Step 2. b) Load palette data
    for type in types:
        for color, hex in colors.items():
            # Should look like .color-elementary-orange
            css += '.' + type + '-' + slug + '-' + re.sub('\s+', '-', color).lower()
            # Should look like { color: #f37329; }
            css += ' { ' + type + ': ' + hex.lower() + '; }\n'

    #   Step 2. c) Put data into palette.css files
    css_all += css
    css_title = '/*! Colors.css ' + version + ' | ' + title + ' Palette | MIT License | https://github.com/eustasy/colors.css */\n'
    css_min = css_title + re.sub('\s\n+', '', css).lower()
    css = css_title + css

    with open(path + '/../' + slug + '.css', 'w+') as outfile:
        outfile.write(css)

    with open(path + '/../' + slug + '.min.css', 'w+') as outfile:
        outfile.write(css_min)

#   Step 3. Combine and minify into main files
css_all_title = '/*! Colors.css ' + version + ' | All Palettes | MIT License | https://github.com/eustasy/colors.css */\n'
css_min = css_all_title + re.sub('\s\n+', '', css_all).lower()
css_all = css_all_title + css_all

with open(path + '/../colors.css', 'w+') as outfile:
    outfile.write(css)

with open(path + '/../colors.min.css', 'w+') as outfile:
    outfile.write(css_min)
