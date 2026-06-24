---
template: post
title: "Open Source, Standards, and Technical Debt"
date: "2021-02-03T11:10:41Z"
excerpt: "As software needs evolve, technological evolution implies Technical Debt. Open Source can help mitigate Technical Debt by influencing on standards."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fa1ozenortfr4pe0d1vad.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fa1ozenortfr4pe0d1vad.png"
canonical_url: "https://www.camptocamp.com/en/news-events/open-source-standards-and-technical-debt"
devto_url: "https://dev.to/camptocamp-ops/open-source-standards-and-technical-debt-2g1"
tags: ["devops", "agile", "opensource", "productivity"]
---
Twenty years ago, Camptocamp was a pioneer company in Open Source adoption. Nowadays, [Open Source has become mainstream](https://ieeexplore.ieee.org/document/8880574) and the vast majority of the industry agrees on the many benefits of its practices. In fact, the Open Source model has become a *de facto* standard in some fields such as Web Frontend development.

Many companies make an increasing use of Open Source software in their infrastructure and development stacks, and there are countless proven reasons for doing so, such as standard formats or [security by openness](https://www.forbes.com/sites/martenmickos/2018/09/26/why-openness-is-the-greatest-path-to-security/?sh=567640cf5f7f), to name just a couple.

In spite of these benefits, companies openly contributing —let alone Open Sourcing their own projects— are still somehow not very common, and most firms think of Open Source purely as a consumer’s benefit.

![Open Source Community | © Shutterstock](https://dev-to-uploads.s3.amazonaws.com/i/dqdagbzcqm5kgkbcx4qz.png)


## So why should you contribute to Open Source software?

For years, I used to think the best argument in favor of contributing to existing projects was maintenance and compatibility. If I fork a project and add functionality to it, there is a risk that my changes will become increasingly hard to maintain as time goes by. If the core developers of the program are aware of my changes and actively intend to go along with them, this risk will be greatly reduced.

So contributing my changes ensures they will stay compatible with the base code as time goes by. There might even be improvements to my code if more people encounter a similar need in the future, and decide to build on top of my changes.

Today, however, I believe the example I have just given is a specific case of a more general rule, which encompasses more pragmatic reasons to contribute code as Open Source. This more general context is linked to the concept of [Technical Debt](https://www.linuxfoundation.org/en/resources/publications/solving-technical-debt-with-open-source/): the idea that technical decisions imply a hidden cost (a “debt”) that will have to be paid in the future in order to catch up with state-of-the-art technology.

 

## So how do I minimize the debt?

Minimizing technical debt is a vast —and at times conflicting— subject. However, I think it is safe to assume that one way to reduce its risk is to stick to standards. The closer a project sticks to industry standards, the less likely it will have to be ported to another technological stack in the foreseeable future.

 

## What if the standards don’t meet my needs?

When faced with a missing feature, most people’s reflex might be to start building a specific component to meet their use case. In the words of [Strategy Theorist Simon Wardley](https://hiredthought.com/2018/09/01/intro-to-wardley-mapping/), they’ll be shifting this component to the Genesis stage, making it more unpredictable —or even erratic—, less standard, and thus more prone to building up technical debt in time.

There is another way though. If my need is not met, and it is in fact a valid need (which is a very important question to ask in the first place), then other people might have this need in the future. When they do, someone, somewhere, will create a new standard for this need. When this new standard becomes enforced, then will my specific component’s debt become obvious.

So what if, instead of building a specific component to make up for the lack of standard, I set the new standard myself? Open Source lets you do just that! It gives you the opportunity to be the first one providing an open implementation to a generic need, and the chance to make it into the new standard. If that new standard catches on, you have not only solved your problem, but you also haven’t accumulated technical debt. In fact, you’re ahead of the other users, because you set the new standard.

 

## Wait, we’re no FAANG!

Obviously, the majority of organizations can't afford to have engineers focusing on IETF RFCs or moving ISO standards to fit our needs.

However, a standard doesn't have to be that complicated. Let’s say I use this popular CLI tool, but I need to specify an option which doesn’t exist yet. I could hack something around the generation of its configuration file to produce the options I need. Or I could patch that tool and add a new flag for my needs, and contribute that change back to the project. Chances are, if I need this option, some else does too.

Now, every time someone has the need for that option, they’ll be using my new flag. I’ve contributed a new standard, and I haven’t made any technical debt on my side.

It’s not the size of the steps that matters, it’s really the direction in which you take them.


![Start with Open Source | © Shutterstock](https://dev-to-uploads.s3.amazonaws.com/i/8z3stx204q4gut3w4coq.png)


## Where do I start?
Open Source is not just a philosophy. It encompasses licensing issues, technology standards, culture, and much more.

At Camptocamp, we’ve been committed to the Open Source approach for years.

This means we have a habit of solving problems in generic terms and building new standards.

It also means we have contacts in many Open Source communities, which allow us to brainstorm ideas and quickly contribute to projects, ensuring a fast feedback loop on our work.

When we implement Open Source software for our clients, we actively seek to limit technological debt. Because we believe in a world of standards, we don’t want our clients to feel entirely stuck with a technological stack in the future. Or even with us!
