import json
import re
import os
from collections import OrderedDict

#   Step 0. Initialize veriables
path = os.path.dirname(os.path.abspath(__file__))
types = ['background', 'color', 'fill']
version = '2.0.9'
css_all = ''

def save_css(path, slug, suffix, css):
    with open(path + '/../' + slug + suffix, 'w+') as outfile:
        outfile.write(css)
    

#   Step 1. Load index.json
f = open(path + '/../data/index.json')
index = json.load(f, object_pairs_hook=OrderedDict)
f.close()

#   Step 2. Create individual palette files
for title, slug in index.items():
    css = ''

    # Not needed as index contains this already.
    # slug = re.sub('\s+', '-', title).lower()

    #   Step 2. a) Load palette data
    f = open(path + '/../data/' + slug + '.json')
    colors = json.load(f, object_pairs_hook=OrderedDict)
    f.close()

    #   Step 2. b) Create CSS variables for each color
    css += ':root {\n'
    for color, hex in colors.items():
        color = re.sub('\s+', '-', color).lower()
        # Should look like --elementary-orange: #f37329;
        css += '\t--' + slug + '-' + color + ': ' + hex.lower() + ';\n'
    css += '}\n'

    #   Step 2. c) Create CSS types for each color
    for type in types:
        for color, hex in colors.items():
            color = re.sub('\s+', '-', color).lower()
            # Should look like .color-elementary-orange
            css += '.' + type + '-' + slug + '-' + color
            # Should look like { color: #f37329; }
            css += ' { ' + type + ': var(--' + slug + '-' + color + '); }\n'

    #   Step 2. d) Put data into palette.css files
    css_all += css
    css_title = '/*! Colors.css ' + version + ' | ' + title + ' Palette | MIT License | https://github.com/eustasy/colors.css */\n'
    css_min = css_title + re.sub(r'[\s\n]+', '', css).lower()
    css = css_title + css

    save_css(path, slug, '.css', css)
    save_css(path, slug, '.min.css', css_min)

#   Step 3. Combine and minify into main files
slug = 'colors'
css_all_title = '/*! Colors.css ' + version + ' | All Palettes | MIT License | https://github.com/eustasy/colors.css */\n'
css_min = css_all_title + re.sub(r'[\s\n]+', '', css_all).lower()
css = css_all_title + css_all

save_css(path, slug, '.css', css)
save_css(path, slug, '.min.css', css_min)
