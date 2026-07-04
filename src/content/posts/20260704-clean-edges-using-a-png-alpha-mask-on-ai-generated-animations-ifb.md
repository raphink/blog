---
template: post
title: "Clean Edges: Using a PNG Alpha Mask on AI-Generated Animations"
date: "2026-07-04T20:51:08Z"
excerpt: "How I solved the background removal problem for AI-generated animated WebP tiles, and why color detection and chroma key both fail."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2F2fvgoct8fo3wvepykl7w.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2F2fvgoct8fo3wvepykl7w.png"
canonical_url: "https://dev.to/raphink/clean-edges-using-a-png-alpha-mask-on-ai-generated-animations-ifb"
devto_url: "https://dev.to/raphink/clean-edges-using-a-png-alpha-mask-on-ai-generated-animations-ifb"
tags: ["webdev", "ai", "animation", "tooling"]
series: "The Misallocated Machine"
---
I'm building something new for Isovalent Labs. I can't say much yet, but there's an announcement coming. What I *can* tell you about is a technical rabbit hole I fell into along the way: AI-generated video, animated WebP, and a transparency problem with a surprisingly clean solution.


## The Setup

The new UI needs animated tiles — isometric city-builder scenes, one per learning zone, that come alive on hover. Each tile starts as a static PNG, then gets animated with a short looping video.

Here are a few examples of PNG tiles with a background:


<div class="carousel">
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/vjezultbg1tms8arnogg.png" alt="Getting Started tile" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/fqdn1tlu1kumgszvfbym.png" alt="eBPF tile" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/6p8mkt7bxcshgzvk7zw5.png" alt="Day 2 tile" loading="lazy" />
</div>



The generation prompt for the videos was deliberately constrained:

> *"Animate this tile very slightly/subtly. No camera movements or angle change."*

That constraint turned out to be load-bearing — more on that later.

I pass the same 320×320px PNG as both start and end frame to ensure a seamless loop. The tool only outputs 16:9 or 9:16, so I go with 16:9 at 720p, 4 seconds (the minimum). The result: a 1280×720 MP4 with the tile centered and the background rendered to black.



![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/m3vdxpvlxvfcyi77rl9a.webp)


You can already tell that the edges suffered in the process and don't look very clean.

The goal then was to crop out the square tile, remove the black background, and serve as an animated WebP with transparent background, but that wasn't as simple as it sounds.


## Attempt 1: Background Removal by Color Detection

The easiest approach I could find was to use [ezgif.com](https://ezgif.com) to:
1. crop the MP4 back a 720x720 square
2. convert it to WebP
3. resize to 320x320 (the original PNG size)
4. remove the black background by detecting black
5. optimize to reduce file size

The results were far from satisfying, with ugly, moving edges:


<div class="carousel">
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/s4cus1577sk6k91xiho9.webp" alt="Getting Started tile" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/6gglylhj1eqpvoclip71.webp" alt="eBPF tile" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/yp3p5diwi22sq37s24cp.webp" alt="Day 2 tile" loading="lazy" />
</div>



The black background means not only the edges are flaky, but also any dark area inside the subject might get removed. Shadows, outlines, eyes, rooftops... The detector can't tell "background black" from "subject black".


## Attempt 2: Chroma Key

One solution I considered was to add a solid magenta background to the source PNG before generating the animation. Magenta is the go-to chroma key color for content with greens and blues, since it shouldn't appear in isometric foliage, stone, or sky.

I chose a tile and set a bright pink at the background color:

![Day 2 with pink background](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/07m5irv6opaztnxf16ug.png)


Then I generated a new animation from it:


![Day 2 animation with pink background](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/veo9xfog7krrrkg0pe3b.webp)


Finally, I went to crop, remove the background and optimize, but the result was even worse somehow: I couldn't remove the pink background cleanly, there were always some pink pixels remaining, and you could easily tell that they did not belong in that picture.

One of the issues with that approach was that the AI video model didn't preserve the precise pink I chose. It interpolated it like any other color. By the end, `#FF00FF` had become a cloud of pinks, magentas, and purples.

One fix was to erode the detected border — shrink the kept area by a few pixels. At 5px the stray pixels mostly disappear. But the edges were now worse than the first attempt.


## The Solution: Apply the PNG Alpha as a Mask

Then I realized: I already had a clean mask.

The original static PNG had a perfect alpha channel — sharp hexagon boundary, exactly the shape I wanted. And since I enforced no camera movement, every frame of the animation supposedly fitted within that same boundary.

So instead of detecting and removing the background from the animation, I extracted the alpha channel from the PNG and stamped it onto every frame. No detection, no approximation. The mask was exact because it came from a clean source.

Moreover, this approach could easily be scripted.

The resulting script uses `ffmpeg` to crop and resize, then ImageMagick to apply the mask per frame and reassemble:

```bash
#!/usr/bin/env bash
# Usage: ./make_tile.sh <name>
# Expects <name>.mp4 (16:9) and <name>.png (square, with alpha)

set -euo pipefail

NAME="${1:?Usage: $0 <name>}"
FPS=12
QUALITY=75
SIZE=320
CROP="crop=720:720:280:0"

mkdir -p "${NAME}_frames"

ffmpeg -y -i "${NAME}.mp4" \
  -vf "${CROP},fps=${FPS},scale=${SIZE}:${SIZE}" \
  -vsync vfr \
  "${NAME}_frames/frame_%04d.png" \
  -loglevel warning

for f in "${NAME}_frames"/frame_*.png; do
  magick "$f" \
    \( "${NAME}.png" -alpha extract -resize "${SIZE}x${SIZE}!" \) \
    -compose CopyOpacity -composite \
    "$f"
done

DELAY=$((100 / FPS))
magick -delay "$DELAY" -loop 0 \
  "${NAME}_frames"/frame_*.png \
  -define webp:lossless=false \
  -quality "$QUALITY" \
  "${NAME}.webp"

rm -rf "${NAME}_frames"
```

Example usage:

```bash
./make_tile.sh ebpf
```

And the results on the previous images is clean, fast, and easily reproductible:


![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/nd7eugkw3ijn1qa99ox8.webp)




## A Note on Format

Use **WebP** or **APNG**, not GIF. GIF only supports binary transparency — fully on or fully off per pixel — so you get jagged edges no matter how clean the mask is. WebP and APNG support full alpha, with smooth anti-aliased edges.

For web UI, animated WebP is the right choice: good compression, full alpha, universal browser support.


---

More on what those tiles are actually *for* — soon.
