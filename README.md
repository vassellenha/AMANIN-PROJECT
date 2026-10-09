# AMANIN

Responsive static website for the AMANIN digital-safety experience.

## Pages

- `index.html` — public landing page and entry point, with a bold full-bleed security hero, mobile sticky scan CTA, and single-column feature flow.
- `dashboard.html` — AMANIN dashboard.
- `scan.html` — QR, link, and screenshot inspection tools.

The pages use relative links and can be deployed directly as a static site (including on Vercel). The scanner processes selected images in the browser; QR decoding loads jsQR from a CDN and screenshot text recognition loads Tesseract.js when needed.
