# Builds assets/js/data.js — the dataset the index page renders from.
# Kept separate from generator.py (which builds the CSS files) so the two
# build steps can run and be reasoned about independently.

import json
import os
from collections import OrderedDict

#   Step 0. Resolve paths
path = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(path, '..', 'data')
out_file = os.path.join(path, '..', 'assets', 'js', 'data.js')


def load_json(name):
    with open(os.path.join(data_dir, name), encoding='utf-8') as infile:
        return json.load(infile, object_pairs_hook=OrderedDict)


#   Step 1. Load the palette index (name, description, source per slug)
meta_src = load_json('_meta.json')

#   Step 2. Reshape into the three blocks the page expects
index = OrderedDict()   # display name -> slug
palettes = OrderedDict()  # slug -> colors
meta = OrderedDict()    # slug -> description + source
for slug, info in meta_src.items():
    index[info['name']] = slug
    palettes[slug] = load_json(slug + '.json')
    meta[slug] = OrderedDict([
        ('description', info.get('description', '')),
        ('source', info.get('source')),
    ])

#   Step 3. Write window.COLORS_DATA to assets/js/data.js
data = OrderedDict([('index', index), ('palettes', palettes), ('meta', meta)])
payload = json.dumps(data, separators=(',', ':'), ensure_ascii=False)
with open(out_file, 'w+', encoding='utf-8') as outfile:
    outfile.write('window.COLORS_DATA = ' + payload + ';\n')

print('Built data.js from ' + str(len(palettes)) + ' palettes.')
