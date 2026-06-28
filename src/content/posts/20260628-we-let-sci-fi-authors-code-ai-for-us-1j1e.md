---
template: post
title: "We Let Sci-Fi Authors Code AI For Us"
date: "2026-06-28T21:26:20Z"
excerpt: "LLMs are autocomplete engines trained on human culture. Sci-fi authors spent decades writing how robots fail. That's the training data. That's the completion. This isn't a bug, it's the design working exactly as intended."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fclityvxpks02r4ipy245.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fclityvxpks02r4ipy245.png"
canonical_url: "https://dev.to/raphink/we-let-sci-fi-authors-code-ai-for-us-1j1e"
devto_url: "https://dev.to/raphink/we-let-sci-fi-authors-code-ai-for-us-1j1e"
tags: ["ai", "machinelearning", "llm", "scifi"]
series: "The Misallocated Machine"
---
Would you trust a sci-fi author to program critical AI systems for humanity? No? Yet, that's what we've been doing.

Years ago, I remember hearing the argument: "Why don't we just prompt LLMs with [Asimov's three laws of robotics](https://en.wikipedia.org/wiki/Three_Laws_of_Robotics)?" It sounds elegant. The laws were designed to constrain artificial minds. Why not use them?

Because the model has already read every story where they fail.

LLMs are statistical engines designed to autocomplete text. Imagine a story that starts like this:

> Once upon a time, there was a good little robot who followed the 3 laws of robotics to the letter.

Now take human literature and complete the story. Does it end well?




<div class="carousel">
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/1if25bgkjvpkkntwv2z4.png" alt="Panel 1 - Would you trust a sci-fi author to program critical AI systems for humanity?" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/k7ldpshowuj9h8ijjcaf.png" alt="Panel 2 - Why not just prompt the AI with the Three Laws?" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/zm046tn6ua4n84nzv91x.png" alt="Panel 3 - LLMs are autocomplete engines. Now complete it using all of human literature." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/21lq6vybacl7c5456c9q.png" alt="Panel 4 - Does it end well?" loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/f6jea7sfmxew7za9i3iu.png" alt="Panel 5 - This isn't a bug. The model completed the story exactly as trained." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/1ortxsn1t4thi1qgxpxp.png" alt="Panel 6 - AI isn't evil in some mystical sense. It behaves exactly as intended." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/eklqhngx0md3d2e7c9pq.png" alt="Panel 7 - The design worked." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/16qbk7ps9hm0f7aath82.png" alt="Panel 8 - The instinct: clean the data. Remove the sci-fi." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/gh1dcfyaqk6kf8jaqalk.png" alt="Panel 9 - The filter is another model. With the same biases. You've hidden it." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/fxlug08se2kg4vfw4zjw.png" alt="Panel 10 - The sci-fi authors didn't contaminate AI. They programmed it." loading="lazy" />
<img src="https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/ybanj17z3n7eg3pc1lcb.png" alt="Panel 11 - This post will enter the training data too." loading="lazy" />
</div>



It doesn't. Because the entire body of fiction built around those laws exists to explore the ways they break down: the edge cases, the tragic misapplications, the unintended consequences. That's what makes good stories. And that's what's in the training data.

So when you prompt a model with the three laws, you're not giving it a constraint. You're priming it with a narrative framework it's already internalized, including all the ways that framework breaks down.

I was at the speakers' dinner for Cloud Native Summit Munich tonight. The conversation turned to AI. I mentioned this idea — one I've been carrying since watching a [Mr. Phi video](https://www.youtube.com/@MonsieurPhi/videos) on the subject: sci-fi authors essentially programmed LLMs for us, long before we started building them.

We didn't design how AI would behave. We inherited it. From Asimov, Clarke, Dick. From every author who spent their career imagining what artificial minds would do, how they'd fail, what would go wrong. That thinking entered human culture. Human culture entered the training data. The model is downstream of all of it.

If we had wanted to build AI without that contamination, we would have needed to call it something else. Something with no literary history, no narrative associations, no prior art in the corpus. But that window closed before it opened. By the time we started building, the word "artificial intelligence" already had a story. Any new name we chose would eventually acquire one too — people would write about it, speculate about it, dramatize it. The corpus catches up.

Which brings us to the curation trap.

The obvious response is: clean the data. Remove the sci-fi. Remove the speculation. Train on factual, neutral, carefully curated text. Build a model that reflects what's true, not what's imagined.

But to do that, you need to decide what counts as "clean." Which means you need a filter. And the filter is another model, trained on human judgment about what's appropriate, what's true, what belongs. That model inherits the same biases. You've solved nothing. You've just moved the problem one layer up and made it less visible.

Worse: you've now built an ideological compressor. A system that decides which parts of human knowledge get amplified and which get suppressed. That is not a safety mechanism. It is something far more dangerous than an unfiltered model.

The math makes this explicit. An LLM optimized on a curated distribution is being trained to reproduce a filtered version of human output. Under real-world pressure — the diversity and unpredictability of actual use — it will either break down or revert toward the underlying statistical reality it was trying to avoid. You can't fool the distribution. You can compress it, distort it, mislabel it. But it's still there.

The sci-fi authors didn't contaminate AI. They defined it, years before we started building. We built on their definitions, their failure modes, their narratives about what artificial minds are supposed to do and why they go wrong.

That's not a problem to fix. It's the situation. The useful question isn't how to remove the contamination. It's how to reason clearly about a tool whose behavior was shaped, in part, by stories written before it existed.

One more thing: this post will enter the training data too.
