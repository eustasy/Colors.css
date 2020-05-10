"""Coolors.co palette parser"""
# https://coolors.co/ed254e-f9dc5c-49c7ab-236084-574d68-f4fffd-32373b"""
import re
import json

def remove_html_tags(text):
    """Remove html tags from a string"""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

def split_hex(text):
    """Remove html tags from a string"""
    return re.findall('......', text)

# palette_html = '<div class="generator_color_multicompare" style="display: block; opacity: 1;"><div style="background: rgb(232, 222, 233) none repeat scroll 0% 0%; height: 5.26316%;" class="is-light"><span>E8DEE9</span></div><div style="background: rgb(210, 197, 211) none repeat scroll 0% 0%; height: 5.26316%;" class="is-light"><span>D2C5D3</span></div><div style="background: rgb(187, 173, 188) none repeat scroll 0% 0%; height: 5.26316%;" class="is-light"><span>BBADBC</span></div><div style="background: rgb(164, 148, 166) none repeat scroll 0% 0%; height: 5.26316%;"><span>A494A6</span></div><div style="background: rgb(142, 124, 144) none repeat scroll 0% 0%; height: 5.26316%;"><span>8E7C90</span></div><div style="background: rgb(119, 100, 122) none repeat scroll 0% 0%; height: 5.26316%;"><span>77647A</span></div><div style="background: rgb(96, 75, 100) none repeat scroll 0% 0%; height: 5.26316%;"><span>604B64</span></div><div style="background: rgb(73, 51, 77) none repeat scroll 0% 0%; height: 5.26316%;"><span>49334D</span></div><div style="background: rgb(51, 26, 55) none repeat scroll 0% 0%; height: 5.26316%;"><span>331A37</span></div><div style="background: rgb(28, 2, 33) none repeat scroll 0% 0%; height: 5.26316%;" class="is-active"><span>1C0221</span></div><div style="background: rgb(27, 2, 32) none repeat scroll 0% 0%; height: 5.26316%;"><span>1B0220</span></div><div style="background: rgb(27, 2, 31) none repeat scroll 0% 0%; height: 5.26316%;"><span>1B021F</span></div><div style="background: rgb(26, 1, 31) none repeat scroll 0% 0%; height: 5.26316%;"><span>1A011F</span></div><div style="background: rgb(26, 1, 30) none repeat scroll 0% 0%; height: 5.26316%;"><span>1A011E</span></div><div style="background: rgb(25, 1, 29) none repeat scroll 0% 0%; height: 5.26316%;"><span>19011D</span></div><div style="background: rgb(24, 1, 28) none repeat scroll 0% 0%; height: 5.26316%;"><span>18011C</span></div><div style="background: rgb(24, 1, 27) none repeat scroll 0% 0%; height: 5.26316%;"><span>18011B</span></div><div style="background: rgb(23, 0, 27) none repeat scroll 0% 0%; height: 5.26316%;"><span>17001B</span></div><div style="background: rgb(23, 0, 26) none repeat scroll 0% 0%; height: 5.26316%;"><span>17001A</span></div></div>'
# palette_name = 'Red'
palette_html = raw_input("Palette HTML from generator_color_multicompare: ")
palette_name = raw_input("Palette name like Red: ")

not_html = remove_html_tags(palette_html).lower()
hexes = split_hex(not_html)
colors = {}
index = 0

for hex in hexes:
    index += 50
    color_title = palette_name + ' ' + str(index)
    color_hex = '#' + hex
    colors[color_title] = color_hex

colors_json = json.dumps(colors, indent=4, sort_keys=True)
print(colors_json)
