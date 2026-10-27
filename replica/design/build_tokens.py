#!/usr/bin/env python3
"""Gera tokens.css, tokens.ts e tailwind.preset.js a partir de tokens.json.

    python3 replica/design/build_tokens.py

tokens.json é a fonte. Os três arquivos gerados não devem ser editados à mão.
"""

import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
HEADER = "Gerado por build_tokens.py a partir de tokens.json. Não editar à mão."


def css_vars(colors, indent="  "):
    return "\n".join("%s--color-%s: %s;" % (indent, k, v) for k, v in colors.items())


def build_css(t):
    light, dark = t["color"]["light"], t["color"]["dark"]
    lines = ["/* %s */" % HEADER, "", ":root {", css_vars(light)]
    lines.append("  --font-sans: %s;" % t["font"]["sans"])
    lines.append("  --font-mono: %s;" % t["font"]["mono"])
    for name, v in t["type"].items():
        lines.append("  --text-%s: %dpx;" % (name, v["size"]))
        lines.append("  --leading-%s: %dpx;" % (name, v["line"]))
        lines.append("  --weight-%s: %d;" % (name, v["weight"]))
    for i, v in enumerate(t["space"]):
        lines.append("  --space-%d: %dpx;" % (i, v))
    for name, v in t["radius"].items():
        lines.append("  --radius-%s: %dpx;" % (name, v))
    for name, v in t["shadow"].items():
        lines.append("  --shadow-%s: %s;" % (name, v))
    lines.append("  --motion-fast: %s;" % t["motion"]["fast"])
    lines.append("  --motion-base: %s;" % t["motion"]["base"])
    lines.append("  --motion-ease: %s;" % t["motion"]["ease"])
    for name, v in t["layout"].items():
        lines.append("  --layout-%s: %dpx;" % (name, v))
    lines.append("  color-scheme: light;")
    lines.append("}")
    lines += [
        "",
        "@media (prefers-color-scheme: dark) {",
        "  :root:not([data-theme=\"light\"]) {",
        css_vars(dark, "    "),
        "    color-scheme: dark;",
        "  }",
        "}",
        "",
        ":root[data-theme=\"dark\"] {",
        css_vars(dark),
        "  color-scheme: dark;",
        "}",
        "",
    ]
    return "\n".join(lines)


def build_ts(t):
    out = {k: v for k, v in t.items() if not k.startswith("_") and k != "pairs"}
    return "// %s\n\nexport const tokens = %s as const;\n\nexport type ThemeName = keyof typeof tokens.color;\n" % (
        HEADER, json.dumps(out, indent=2, ensure_ascii=False))


def build_tailwind(t):
    colors = {k: "var(--color-%s)" % k for k in t["color"]["light"]}
    sizes = {k: ["%dpx" % v["size"], {"lineHeight": "%dpx" % v["line"], "fontWeight": str(v["weight"])}]
             for k, v in t["type"].items()}
    theme = {
        "colors": dict(colors, transparent="transparent", current="currentColor"),
        "fontFamily": {"sans": ["var(--font-sans)"], "mono": ["var(--font-mono)"]},
        "fontSize": sizes,
        "borderRadius": dict({k: "%dpx" % v for k, v in t["radius"].items()}, none="0"),
        "boxShadow": dict(t["shadow"], none="none"),
        "screens": {"sm": "%dpx" % t["layout"]["bp-sm"], "lg": "%dpx" % t["layout"]["bp-lg"]},
        "extend": {
            "spacing": {"touch": "%dpx" % t["layout"]["touch-min"]},
            "minHeight": {"touch": "%dpx" % t["layout"]["touch-min"]},
            "minWidth": {"touch": "%dpx" % t["layout"]["touch-min"]},
            "maxWidth": {"panel": "%dpx" % t["layout"]["panel-max"]},
            "transitionDuration": {"fast": t["motion"]["fast"], "base": t["motion"]["base"]},
            "transitionTimingFunction": {"base": t["motion"]["ease"]},
        },
    }
    return "// %s\n// Preset do Tailwind (painel) e do NativeWind (app). Cores via CSS vars de tokens.css.\n\nmodule.exports = { theme: %s };\n" % (
        HEADER, json.dumps(theme, indent=2, ensure_ascii=False))


def main():
    with open(os.path.join(HERE, "tokens.json"), encoding="utf-8") as fh:
        t = json.load(fh)
    for name, text in (("tokens.css", build_css(t)), ("tokens.ts", build_ts(t)),
                       ("tailwind.preset.js", build_tailwind(t))):
        with open(os.path.join(HERE, name), "w", encoding="utf-8") as fh:
            fh.write(text)
        print("escrito", name)


if __name__ == "__main__":
    main()
