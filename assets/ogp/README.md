# OGP image font-fixed files

- `../../public/ogp.png`: published 1200 × 630 px PNG, generated from the outlined SVG.
- `notes-ogp.svg`: outlined version; it renders the same regardless of installed fonts.
- `notes-ogp-editable.svg`: text-editable version; it expects Zen Maru Gothic to be installed.
- `OFL.txt`: license for the font used to create these files.

The title uses **Zen Maru Gothic Bold (weight 700)** from the [official Google Fonts project](https://github.com/googlefonts/zen-marugothic), distributed under SIL OFL 1.1. The source SVG requested weight 600, while the site loads weights 400, 500, and 700. Weight 700 is the matching face browsers select for a 600 request from that set (the CSS weight matching rule favors the heavier face above 500).

The original 1200 × 630 canvas, colors, font size (168 px), baseline (y=340), and underline placement were preserved. The word is centered using the selected font's shaped advance width (2435 font units, 409.1 px at 168 px). The raster was rendered from the outlined SVG, so its appearance does not depend on a locally installed font.
