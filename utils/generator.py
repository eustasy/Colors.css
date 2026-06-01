import json
import os
import re
from collections import OrderedDict

#   Step 0. Initialize veriables
path = os.path.dirname(os.path.abspath(__file__))
types = ["background", "color", "fill", "border-color", "stroke", "outline-color", "text-decoration-color", "caret-color", "accent-color"]
version = "2.1.0"
vars_all = ""
rules_all = ""


def save_css(path, slug, suffix, css):
    with open(path + "/../" + slug + suffix, "w+") as outfile:
        outfile.write(css)


#   Step 1. Load _meta.json
with open(path + "/../data/_meta.json") as f:
    index = json.load(f, object_pairs_hook=OrderedDict)

#   Step 2. Create individual palette files
for slug, info in index.items():
    title = info["name"]

    #   Step 2. a) Load palette data
    with open(path + "/../data/" + slug + ".json") as f:
        colors = json.load(f, object_pairs_hook=OrderedDict)

    #   Step 2. b) Create CSS variables for each color
    variables = ""
    for color, hex in colors.items():
        color = re.sub(r"\s+", "-", color).lower()
        # Should look like --elementary-orange: #f37329;
        variables += "\t--" + slug + "-" + color + ": " + hex.lower() + ";\n"

    #   Step 2. c) Create CSS types for each color
    rules = ""
    for type in types:
        for color in colors:
            color = re.sub(r"\s+", "-", color).lower()
            # Should look like .color-elementary-orange
            rules += "." + type + "-" + slug + "-" + color
            # Should look like { color: #f37329; }
            rules += " { " + type + ": var(--" + slug + "-" + color + "); }\n"

    #   Step 2. d) Put data into palette.css files
    #   Standalone file gets its own :root; the combined file (Step 3) reuses
    #   vars_all/rules_all so every palette shares a single :root block.
    css = ":root {\n" + variables + "}\n" + rules
    vars_all += variables
    rules_all += rules
    css_title = "/*! Colors.css " + version + " | " + title + " Palette | MIT License | https://github.com/eustasy/colors.css */\n"
    css_min = css_title + re.sub(r"[\s\n]+", "", css).lower()
    css = css_title + css

    save_css(path, slug, ".css", css)
    save_css(path, slug, ".min.css", css_min)

#   Step 3. Combine and minify into main files
slug = "colors"
css_all = ":root {\n" + vars_all + "}\n" + rules_all
css_all_title = "/*! Colors.css " + version + " | All Palettes | MIT License | https://github.com/eustasy/colors.css */\n"
css_min = css_all_title + re.sub(r"[\s\n]+", "", css_all).lower()
css = css_all_title + css_all

save_css(path, slug, ".css", css)
save_css(path, slug, ".min.css", css_min)
