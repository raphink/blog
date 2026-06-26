---
template: post
title: "AI Doesn't Hallucinate. Your Architecture Does."
date: "2026-06-15T08:30:00Z"
excerpt: "Hallucination isn't a bug in LLMs — it's the mechanism. The real problem is misallocating non-determinism, and why \"SKILLS.md is enough\" is exactly backwards."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0jn7tqw1rv0zxb25aq2g.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0jn7tqw1rv0zxb25aq2g.png"
canonical_url: "https://dev.to/raphink/ai-doesnt-hallucinate-your-architecture-does-32pe"
devto_url: "https://dev.to/raphink/ai-doesnt-hallucinate-your-architecture-does-32pe"
tags: ["ai", "architecture", "llm", "discuss"]
series: "The Misallocated Machine"
translation: /fr/posts/20260615-lia-nhallucine-pas-cest-votre-architecture-qui-hallucine
---
Everyone is talking about hallucination. That's the wrong diagnosis.

Hallucination isn't a bug. It's the mechanism. Turn the temperature down far enough and the model stops confabulating, but it also stops being useful. What people call hallucination is what LLMs do when their creativity fails in a context that needed correctness. But all LLM output is hallucination in some form: generated token by token, probabilistically, without ground truth — just with enough structure and guardrails that most of it lands close enough to be acceptable.

The creativity and the confabulation are the same thing. Different temperature, different context, different guardrails.

Which means "reducing hallucination" is the wrong goal. You can't reduce it without reducing the model. The right goal is routing: giving LLMs only the problems where that generative, probabilistic process is actually what you need.

Using a non-deterministic tool where a deterministic one would do the job perfectly is what breaks agentic systems.

A deterministic API call costs microseconds and fractions of a cent. It is correct 100% of the time, by definition. An LLM doing the same task is slower, more expensive, and introduces a failure rate you now have to reason about — not because the model is broken, but because you've asked a creativity engine to act like a lookup table. Chain three of those steps together and you don't have a 10% failure rate, you have 27%. Five steps and you're past 40%. The errors are hard to reproduce and harder to attribute.

I've been building an agentic genealogy research system. Two tasks, completely different natures.

Fetching newspaper archive records for a given name and date range: deterministic. The API either returns results or it doesn't. There's no judgment to exercise, no ambiguity to resolve. An LLM here is just an expensive way to call curl — and one that will occasionally invent records that don't exist, because that's what it does.

Deciding whether the person in that archive record is the same as the one in the birth register — given a different spelling of the surname, a two-year age discrepancy, and a naming convention that shifted at the border: LLM. This is exactly the kind of ill-defined correlation across uncertain evidence where you *want* the probabilistic reasoning. The hallucination, properly constrained, is the feature.

This is also why the current wave of "we don't need MCP anymore — SKILLS.md is enough" is exactly backwards.

SKILLS.md is a routing layer. It tells the LLM which tool to use for which class of problem, directing judgment toward genuinely hard problems rather than eliminating it. That's valuable. But SKILLS.md is still natural language processed by a probabilistic model. MCP gives the model actual deterministic tools: APIs with guaranteed behavior, typed inputs, reliable outputs. Replacing MCP with SKILLS.md doesn't simplify your architecture, it replaces a deterministic function call with a probabilistic description of one. You've kept the complexity and removed the reliability.

The routing layer is where most agentic architectures fail silently. Engineers reach for the LLM because it's faster to prototype, because it removes the need to maintain separate services, because describing a tool in natural language feels easier than building it. What they get instead is unnecessary entropy at every step, and failure modes that look like model problems but are actually architecture problems.

The question to ask at every step of your pipeline isn't "can the LLM do this." It can, after enough tries. The question is: is this problem actually non-deterministic? Is there genuine ambiguity here that requires judgment? If not — if there's a correct answer a function could return reliably — you've given a creativity engine a job that doesn't need creativity. And you'll pay for it in every run.

The good news: MCP servers are rather easy to build. Using LLMs.
