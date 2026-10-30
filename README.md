# Dave Chan — personal website

A GitHub Pages / Jekyll portfolio with a custom light homepage, an illustrative urban canvas, and a vertical project timeline. Existing research notes continue to use Minimal Mistakes.

## Preview

```sh
bundle install
bundle exec jekyll serve --livereload
```

Jekyll downloads the configured remote theme during builds, so network access is required. Open http://127.0.0.1:4000.

## Edit

- `index.html`: introduction, education, selected projects, and recent notes.
- `_pages/projects.md`: six project branches, descriptions, publications, and expandable image galleries.
- `_pages/about.md`: biography and email contact.
- `_layouts/portfolio.html`: shared navigation, footer, and accessible image dialog.
- `assets/css/portfolio.css`: responsive layout and visual styling.
- `assets/js/portfolio.js`: deterministic illustrative cityscape and image viewer.
- `assets/images/portfolio/manifest.json`: extracted image inventory with original PDF page numbers. Soft masks are composited into their associated images.

Content was reconciled against `assets/pdf/Portfolio_Dave_v1.pdf`. The current Postdoctoral Fellow role, 2018 MSc, and earlier employment dates were updated from the owner’s corrections. The timeline uses the retained project images, with deleted low-resolution assets removed from both galleries and the image inventory. Featured images are not repeated in expanded galleries; cover and biography assets are also retained. The assembled wind-platform diagram preserves vector labels from the source page.

## Privacy

Public contact is email and professional profile links only. Do not add telephone numbers to page content, metadata, images, or downloadable documents. Check any replacement portfolio PDF before publishing it. The urban canvas is an illustration, not a geographic map, and does not request geolocation or API credentials.

## Validation

```sh
bundle exec jekyll build
node --check assets/js/portfolio.js
```

The site retains the existing GitHub Pages deployment setup. Local changes are not published until committed and pushed through that workflow.
