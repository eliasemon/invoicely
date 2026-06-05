import json
import re

html_config = """
                    "colors": {
                        "on-secondary-container": "#516578",
                        "surface-container-low": "#f2f4f6",
                        "inverse-primary": "#b7c8de",
                        "on-background": "#191c1e",
                        "surface-dim": "#d8dadc",
                        "surface-tint": "#4f6073",
                        "secondary-fixed": "#d1e5fb",
                        "error-container": "#ffdad6",
                        "primary": "#041627",
                        "background": "#f7f9fb",
                        "surface-container": "#eceef0",
                        "surface-container-lowest": "#ffffff",
                        "error": "#ba1a1a",
                        "secondary": "#4d6073",
                        "on-secondary-fixed-variant": "#36495b",
                        "primary-fixed": "#d2e4fb",
                        "on-surface": "#191c1e",
                        "surface-bright": "#f7f9fb",
                        "secondary-fixed-dim": "#b5c9df",
                        "tertiary": "#001a0f",
                        "surface-container-high": "#e6e8ea",
                        "surface": "#f7f9fb",
                        "tertiary-fixed": "#6ffbbe",
                        "secondary-container": "#cee2f9",
                        "inverse-surface": "#2d3133",
                        "on-tertiary-fixed": "#002113",
                        "on-primary-fixed": "#0b1d2d",
                        "on-primary-fixed-variant": "#38485a",
                        "tertiary-container": "#00311f",
                        "primary-container": "#1a2b3c",
                        "surface-container-highest": "#e0e3e5",
                        "on-primary-container": "#8192a7",
                        "on-secondary": "#ffffff",
                        "on-surface-variant": "#44474c",
                        "on-tertiary-fixed-variant": "#005236",
                        "inverse-on-surface": "#eff1f3",
                        "outline-variant": "#c4c6cd",
                        "primary-fixed-dim": "#b7c8de",
                        "tertiary-fixed-dim": "#4edea3",
                        "on-error": "#ffffff",
                        "on-error-container": "#93000a",
                        "outline": "#74777d",
                        "on-tertiary-container": "#00a572",
                        "on-secondary-fixed": "#081d2e",
                        "on-tertiary": "#ffffff",
                        "on-primary": "#ffffff",
                        "surface-variant": "#e0e3e5",
                        "success": "#10b981",
                        "success-container": "#d1fae5",
                        "on-success-container": "#065f46",
                        "warning": "#f59e0b",
                        "warning-container": "#fef3c7",
                        "on-warning-container": "#92400e"
                    },
                    "spacing": {
                        "lg": "32px",
                        "margin-mobile": "16px",
                        "xl": "48px",
                        "xs": "8px",
                        "margin-desktop": "40px",
                        "md": "24px",
                        "base": "4px",
                        "gutter": "24px",
                        "sm": "16px"
                    },
                    "fontSize": {
                        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "body-lg": ["16px", { "lineHeight": "24px", "letterSpacing": "0.01em", "fontWeight": "400" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "500" }],
                        "body-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "400" }],
                        "headline-md": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700" }],
                        "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
                    }
"""

colors = re.findall(r'"([^"]+)":\s*"([^"]+)"', html_config.split('"spacing"')[0])
spacing = re.findall(r'"([^"]+)":\s*"([^"]+)"', html_config.split('"spacing"')[1].split('"fontSize"')[0])
fontSizesStr = html_config.split('"fontSize": {')[1].split('}')[0]

theme_inline = []
for k, v in colors:
    theme_inline.append(f"  --color-{k}: {v};")

for k, v in spacing:
    theme_inline.append(f"  --spacing-{k}: {v};")

# Add Fonts
theme_inline.append("  --font-headline-lg-mobile: var(--font-inter), sans-serif;")
theme_inline.append("  --font-body-lg: var(--font-inter), sans-serif;")
theme_inline.append("  --font-headline-lg: var(--font-inter), sans-serif;")
theme_inline.append("  --font-label-sm: var(--font-inter), sans-serif;")
theme_inline.append("  --font-body-md: var(--font-inter), sans-serif;")
theme_inline.append("  --font-headline-md: var(--font-inter), sans-serif;")
theme_inline.append("  --font-label-caps: var(--font-inter), sans-serif;")
theme_inline.append("  --font-data-mono: var(--font-inter), monospace;")
theme_inline.append("  --font-display-lg: var(--font-inter), sans-serif;")

# Font Sizes
fontSizesObj = {
    "headline-lg-mobile": ["24px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
    "body-lg": ["16px", { "lineHeight": "24px", "letterSpacing": "0.01em", "fontWeight": "400" }],
    "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
    "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.01em", "fontWeight": "500" }],
    "body-md": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "400" }],
    "headline-md": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
    "label-caps": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "700" }],
    "data-mono": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
    "display-lg": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }]
}

for k, v in fontSizesObj.items():
    theme_inline.append(f"  --text-{k}: {v[0]};")
    theme_inline.append(f"  --text-{k}--line-height: {v[1].get('lineHeight', 'normal')};")
    if 'letterSpacing' in v[1]:
        theme_inline.append(f"  --text-{k}--letter-spacing: {v[1]['letterSpacing']};")
    if 'fontWeight' in v[1]:
        theme_inline.append(f"  --text-{k}--font-weight: {v[1]['fontWeight']};")

# Dark mode map (approximate inversion for now or just stick to light for these specific tokens, as DESIGN didn't include dark tokens directly except for generic ones, wait, Invorio HTML doesn't seem to have explicit dark mode tokens, it has standard tailwind dark mode with `dark:` classes or relying on variables. We will just use standard light mode variables since the HTML is hardcoded for light mode mostly.

theme_inline_str = "\n".join(theme_inline)

css_content = f"""@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {{
{theme_inline_str}
}}

@layer base {{
  * {{
    @apply border-border outline-ring/50;
  }}
  body {{
    @apply bg-background text-foreground;
  }}
  html {{
    @apply font-sans;
  }}
}}
"""

with open("/Users/eliasemon/personal-projects/invorio/invorio-app/src/app/globals.css", "w") as f:
    f.write(css_content)

print("Updated globals.css")
