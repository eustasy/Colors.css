"""Coolors.co palette parser"""

# https://coolors.co/ed254e-f9dc5c-49c7ab-236084-574d68-f4fffd-32373b"""
import json
import re


def remove_html_tags(text):
    """Remove html tags from a string"""
    clean = re.compile("<.*?>")
    return re.sub(clean, "", text)


def split_hex(text):
    """Split a run of hex digits into 6-character colors"""
    return re.findall("......", text)


palette_html = input("Palette HTML from generator_color_multicompare: ")
palette_name = input("Palette name like Red: ")

not_html = remove_html_tags(palette_html).lower()
hexes = split_hex(not_html)
colors = {}
index = 0

for hex in hexes:
    index += 50
    color_title = palette_name + " " + str(index)
    color_hex = "#" + hex
    colors[color_title] = color_hex

colors_json = json.dumps(colors, indent=2, sort_keys=True)
print(colors_json)
