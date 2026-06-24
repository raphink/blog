---
template: post
title: "Four years chasing a consistent eBee — and what I built when I finally caught one"
date: "2026-06-23T08:10:00Z"
excerpt: "Four years of AI image generation, three platforms, one stubborn cartoon bee, and the declarative pipeline I built to stop the drift."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fm6bajk4hqkix8ssaegkz.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fm6bajk4hqkix8ssaegkz.png"
canonical_url: "https://dev.to/raphink/four-years-chasing-a-consistent-ebee-and-what-i-built-when-i-finally-caught-one-35je"
devto_url: "https://dev.to/raphink/four-years-chasing-a-consistent-ebee-and-what-i-built-when-i-finally-caught-one-35je"
tags: ["ai", "showdev", "opensource", "devtools"]
series: "The Misallocated Machine"
translation: /fr/posts/20260623-quatre-ans-a-poursuivre-une-ebee-coherente
---
I've been trying to generate a consistent cartoon bee with AI for four years.

Not just any bee. A specific one: eBee, the Isovalent mascot. Black rounded head, large teal oval eyes, semi-transparent wings, yellow and black body. Simple enough in concept. Surprisingly hard in practice.

This is the story of that chase — and what I ended up building because of it.

## The Midjourney years (2021–2024)

I started with Midjourney v3 shortly after it launched. The results were immediately interesting, but not useful — blurry bee-adjacent blobs that had no relationship to the character I was after.

![Midjourney v3 — bees around a stone castle](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/c1np24hmt8p41ikdmvn3.png)


V4 and v5 brought a quality leap. I started getting images I could actually use: atmospheric backgrounds for slide decks, dramatic scenes, a Cilium network map background I still use today. But for character work — a specific, recognizable, repeatable eBee — the models kept missing. Too photorealistic. Too generic. Too *bee* and not enough *eBee*.



  ![Midjourney v5 — steampunk mechanical bee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/zf2e5olzkgmstlpgweqd.png)
  ![Midjourney v5 — realistic bee on server hardware](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/v3pskgikj18c7ynlx9go.png)
  ![Midjourney v5 — floating island map](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/d6j7z2loxma9uxbd0oz1.png)



V6 got closer in style, and v6.1 closer still. A watercolor bee scientist. A cartoon bee astronaut. A bee in front of a cottage. Each one charming. None of them quite right.

I tried style references, style boards, and character references — Midjourney's own tools for exactly this problem. None of them gave me the consistency I needed across scenes.


  ![Midjourney v6.1 — watercolor scientist bee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/x1svqqy2s1qwjxcse3xq.png)
  ![Midjourney v6.1 — astronaut bee orbiting Earth](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/kazvqjdvok15xuj5p0ak.png)
  ![Midjourney v6.1 — cartoon bee at cottage door](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/8qpibnkpivum3q96ux9w.png)



By late 2024, the best I could produce was a mountain climber eBee, an aviator eBee, a Christmas eBee. Recognizable as the same character across scenes. Close enough to use. But still requiring manual fixes, and always with that slight wrongness I couldn't prompt away.


  ![Late 2024 Midjourney — mountain climber eBee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/d88nqa7nxdyai88l1r9v.png)
  ![Late 2024 Midjourney — aviator eBee in biplane](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/kp59dgdcha7dy5sfh7js.png)
  ![Late 2024 Midjourney — Christmas eBee on sled](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/xl4ncwttjm1wpk0szsfe.png)



## The breakthrough (early 2025)

Then OpenAI released gpt-image-1, and from one day to the next, everything changed.

I handed it a few reference images and got back this:



  ![gpt-image-1 — baseball eBee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/pmtc0lr4gdgi4x5dx4wd.png)
  ![gpt-image-1 — Starfleet eBee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/g4xp3imr0w5l5auz130m.png)
  ![gpt-image-1 — basketball eBee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/n9ggia93wuv1zc05zlic.png)
  ![gpt-image-1 — aviator eBee with toy plane](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/j1h3pyk84g6aw00e67vg.png)
  ![gpt-image-1 — samurai eBee](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/awvd142kk1pnc0cozuhu.png)


Same character. Five completely different costumes and scenarios. Unmistakably the same eBee.

The remaining gap was concrete and finite: eBees occasionally sprouted mouths, abdomens appeared when they shouldn't, the odd anatomical quirk crept in. Fixable in GIMP in minutes. My rule is simple: I won't publish something made with generative AI that I wouldn't publish if I'd made it without. No six-fingered hands. No eBees with mouths. If it would make a reader do a double-take for the wrong reason, it doesn't ship. With gpt-image-1, the fixes needed to meet that bar finally felt like a reasonable ask rather than a full redraw.

I wrote a detailed character prompt my colleagues could copy-paste into ChatGPT. I even built a custom GPT called eBee Creator. But there was still a manual step nobody could get around: the reference images had to be attached by hand, every time. The platform had no way to bundle prompt and images together. You had to know where to find the refs and attach them to the chat thread, every time.


## The comic problem

Then I decided to make comic strips to explain Kubernetes networking concepts. Sixty-four panels, three character types, multiple recurring scenes.

The drift started immediately.

ChatGPT threads are both your context and your liability. The longer a thread runs, the more it drifts — more stars appearing in the sky across pages, characters subtly changing, scene backgrounds shifting. There's no surgical fix. You can't undo drift without losing all the good context that preceded it.



  ![more and more stars](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/e8et5n7x4r5no33mrbfc.png)
  ![more and more stars](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/gup3bjocub77zw68dpnb.png)
  ![more and more stars](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/iayv25rn3cplb2zedlc4.png)
  ![more and more stars](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/0m9kffl8sl3csw9i6obq.png)


I ended up with a multi-thread architecture: one thread for the storyline, separate threads for each scene type, with manual copy-pasting between them to prevent cross-contamination. It worked, but it was fragile. Any drift in any thread propagated forward. The only reset was starting from scratch and losing everything.

When I cancelled ChatGPT for unrelated reasons, I moved the same workflow to Microsoft Copilot. Similar results, with the added frustration of edit features that kept losing images into a void.


## Building the tool I needed

When gpt-image-2 was released, I wanted to test it. Copilot didn't have it yet. So I deployed it on Azure AI Foundry myself and wrote the first version of panelgen in Python.

I knew immediately what it needed to be: declarative and idempotent. Every pain point I'd accumulated across four years pointed at the same root cause — there was no persistent ground truth. The thread was doing the job that a spec file should be doing.

And importantly: panelgen is not AI. It's deterministic glue — it reads a spec, builds a prompt, calls the API, and saves a versioned output. No model makes decisions inside it. The intelligence is in the spec you write; the creativity is in the prompts you craft. panelgen just makes sure both travel reliably to the API every single time, without drift.

That said, nothing stops you from using an LLM to generate the YAML itself — I have. The spec is just text. Write it by hand, generate it, or have an agent produce it panel by panel. panelgen doesn't care.

The insight was simple: replace the thread's implicit memory with an explicit config.

```yaml
characters:
  astronaut:
    description: "Astronaut eBee — white space suit, glass helmet, orange 'eBPF' badge"
    refs:
      - characters/astronaut-bee.png
  engineer:
    description: "Engineer eBee — hard yellow hat, safety jacket"

scenes:
  space-conversation:
    prompt_prefix: >
      Comic panel in outer space with deep purple/blue starry background.
      Two eBee characters facing each other. Square panel with rounded corners.
    characters: [astronaut, engineer]

panels:
  - page: 10
    scene: space-conversation
    prompt: >
      Engineer eBee pointing upward while explaining to astronaut eBee.
      Speech bubble: "You need to go through a Kubernetes Service!"
```

Characters are defined once. Reference images travel with the config. Scenes don't pollute each other. The style guide is prepended to every prompt automatically. And crucially: re-running is safe. Each output is versioned (`page_10_low-1.png`), existing versions are skipped unless you explicitly ask for a new increment.

![Generated Scene](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/hhrclo00nnevlf7417k2.png)


The drift problem disappears because there is no thread. Every generation starts from the same spec, and the config can even be versioned.


## Beyond the comic

Once the workflow was solid, other use cases fell out naturally.

An eBee shop demo app: product images generated as panels, then lifestyle shots of eBees using each product — with every lifestyle panel referencing the corresponding product image as a ref, so the product stays consistent across shots.


![eBee Shop: lamp](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/f6vvdhkqa5yy9mdqgn8h.png)



Consistent diagrams for labs: the same scene/panel abstraction works for technical illustrations. Define the diagram style as a scene, generate variants as panels. Consistent visual language across an entire lab series without copy-pasting style descriptions between prompts.

The spec-first approach turns out to be useful anywhere you need a series of images that share visual DNA — not just comics.


## The agentic angle

Once image generation is driven by a YAML file and a prompt field, any upstream step can write to that prompt field — including an LLM. The `-prompt-file` flag exists precisely for this: an agent generates or refines the panel prompt, writes it to a file, and panelgen consumes it.

```bash
# Agent writes the prompt
echo "Astronaut eBee looking shocked. Pod is exploding." > prompt.txt

# panelgen consumes it
panelgen generate -prompt-file prompt.txt -scene space-solo output.png
```

Better yet, it can now generate a full YAML config with multiple scenes and panels, commit it to Git, and generate all the images from it.

The agent doesn't need to know anything about the Azure API, the style guide, or the reference images. It just writes a prompt. The tool handles the rest. This is Unix composability with an LLM upstream — and that's why I rewrote the tool in Go: a simple static binary with no runtime dependencies drops into any pipeline without dependency management.

I'll dive more into the agentic approach for labs design and illustration in a future post.


## panelgen


Panelgen is open-source and can be found (and contributed to) on GitHub:


[GitHub — raphink/panelgen](https://github.com/raphink/panelgen)


You can install it via brew:


```bash
brew tap raphink/tap
brew install panelgen
```

The full config format, batch generation options, parallel generation, and agentic usage patterns are documented in the [GitHub repository](https://github.com/raphink/panelgen).


## What four years taught me

The models got better — dramatically better. But the workflow bottleneck wasn't the model. It was the absence of a spec.

Every time I was working around drift, copying prompts between threads, manually attaching reference images, I was compensating by hand for what a declarative config should do automatically. The tool I built isn't clever. It's just the missing infrastructure that should have existed from the start.

If you're generating more than a handful of images with a consistent character or style, you probably need a spec too.

For AI image generation, the chat thread is not your friend.
