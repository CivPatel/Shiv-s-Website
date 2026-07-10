Project Logos — drop-in replacements
====================================

These four files replace your existing project images and keep the
EXACT same filenames, so you can drop them straight into your
website's /assets folder (overwrite the old ones):

  propertyops.svg   →  PropertyOps        (ASP.NET Core · SQL Server · OpenAI)
  latest.jpg        →  Historic Hammond   (Django · React · Postgres)
  project-2.png     →  EEG Circuit        (Python · FFT · Processing)
  project-3.png     →  Playback           (React · Node.js · PHP)

All four share one visual system: a dark app-icon tile with a
project-specific emblem, an amber accent, and a wordmark — on a light
"data-hub" field. Each is 1200×900 (4:3), so they fill the project
cards edge-to-edge with no cropping.

Notes
-----
- propertyops.svg is self-contained: the wordmark fonts (Space Grotesk
  + JetBrains Mono) are embedded inside the file, so it renders
  identically everywhere, even when loaded as an <img>. No font setup
  needed.
- latest.jpg / project-2.png / project-3.png are flat raster tiles with
  the same fonts baked in.
- If you're using the updated Shiv-Website build, these are already in
  place — this folder is just for convenience if you only want the images.
