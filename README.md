# AMANIN

Responsive static website for the AMANIN digital-safety experience.

## Pages

- `index.html` — public landing page and entry point, with a bold full-bleed security hero, mobile sticky scan CTA, and single-column feature flow.
- `login.html` — local demo sign-in and guest entry.
- `dashboard.html` — AMANIN dashboard.
- `scan.html` — local conversation-text, QR/link, and screenshot inspection tools.

The pages use relative links and can be deployed directly as a static site (including on Vercel). The current sign-in and profile flow stores username and cropped avatar photo in the browser; it does not provide server authentication or sync between devices. The scanner analyzes pasted conversation text locally in the browser and processes selected images there; QR decoding loads jsQR from a CDN and screenshot text recognition loads Tesseract.js when needed.
