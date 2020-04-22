import json
import re
import os

path = os.path.dirname(os.path.abspath(__file__))
types = ['background', 'color', 'fill']
css_all_title = '/*! Colors.css 1.9.3 | All Palettes | MIT License | https://github.com/eustasy/colors.css */\n'
css_all = ''

f = open(path + '/../data/index.json')
index = json.load(f)
f.close()

for title, slug in index:
    css_title = '/*! Colors.css 1.9.3 | ' + title + ' Palette | MIT License | https://github.com/eustasy/colors.css */\n'
    css = ''

    # Not needed as index contains this already.
    # slug = re.sub('\s+', '-', title).lower()

    f = open(path + '/../data/' + slug + '.json')
    colors = json.load(f)
    f.close()

    for type in types:
        for color, hex in colors:
            # Should look like .color-elementary-orange
            css += '.' + type + '-' + slug + '-' + re.sub('\s+', '-', color).lower()
            # Should look like { color: #f37329; }
            css += ' { ' + type + ': ' + hex.lower() + '; }\n'


    css_all += css
    css_min = css_title + re.sub('\n+', '', css).lower()
    css = css_title + css

    with open(path + '/../' + slug + '.css', 'w+') as outfile:
        outfile.write(css)

    with open(path + '/../' + slug + '.min.css', 'w+') as outfile:
        outfile.write(css_min)
