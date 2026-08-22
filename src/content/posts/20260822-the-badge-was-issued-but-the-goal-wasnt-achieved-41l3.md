---
template: post
title: "The Badge Was Issued, but the Goal Wasn't Achieved."
date: "2026-08-22T20:43:50Z"
excerpt: "How I apply Theory of Constraints to technical enablement systems."
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fqetduvq4svqqv9krbeck.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fqetduvq4svqqv9krbeck.png"
canonical_url: "https://dev.to/raphink/the-badge-was-issued-but-the-goal-wasnt-achieved-41l3"
devto_url: "https://dev.to/raphink/the-badge-was-issued-but-the-goal-wasnt-achieved-41l3"
tags: ["devops", "education", "productivity", "career"]
---
A couple of years ago, users of the [Isovalent Labs platform](http://labs.isovalent.com/) regularly complained that they hadn't received their badge after completing one of our hands-on labs. The badge had been issued, but they expected it in the wrong place.

Here's the way things work: Instruqt sends a webhook when a lab is completed, the platform catches the event, processes it, and asks Credly to issue the credential. Credly then emails the learner with a link to claim it. Every part of that chain was working. But from the learner's perspective, completing the lab should produce a badge, and they expected to see a link on the final screen. The webhook is asynchronous, though —it can arrive after the lab has ended, at a point the UI can no longer catch— so the link just wasn't there.


![Badge issuance process](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/g23dw9zbhlcfxxjdh1op.png)



Some users complained. Others completed the lab again —sometimes more than twice— apparently hoping another completion would make the badge appear. The obvious diagnosis was a badge-delivery problem, but the badge was being delivered: what was missing was the learner's understanding of what happened next.

So I started measuring two things: how often people complained about a missing badge, and how often they repeated a lab after completing it. Then I ran a very small experiment. I added a slide before the final exam, explaining that successful learners would receive an email from Credly with their badge.

![Exam explanation slide example](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/2bwf3bpiifrzx2ej6usg.png)

Complaints fell sharply, and most of the unnecessary repeats disappeared. No API changed. No webhook became synchronous. No new service was deployed. One slide fixed the flow.


## When is a badge successfully issued?

As far as the credential system was concerned, the badge was successfully issued, so that system was successful. But an issued badge isn't yet a credential the learner can use. It has to reach them, and they have to claim it before they can use it and —if they choose to— share it.

```text
complete
→ issue
→ notify
→ claim
→ use or share
```

Stopping at issuance is a bit like declaring a package delivered when it's only left the warehouse. Credentials aren't just database records: they give learners portable evidence of what they achieved, and when learners choose to share them, they make the learning path visible to other people. That can bring new practitioners into the system far more naturally than the platform promoting itself.

Now here's the problem: I can't make someone claim a badge, and I can't make them share it either. That apparent lack of control makes it tempting to stop caring at the point of issuance: my component worked, the next action belongs to the user, and I shouldn't even try to control what's out of my platform boundaries. But the boundary of control is not the boundary of influence.

What happens before issuance still affects what happens after it. Did learners know they were earning a credential? Did they understand its value? Did they know when it would arrive, what the email would look like, and which address it would use? The way the badge is issued matters too: timing, deliverability, sender recognition, the number of steps, the clarity of the claim link.

The resulting artifact matters as well. If a credential is meaningful, credible, and easy to present, people are more likely to use it. If sharing is clear and frictionless, people who already want to share are more likely to do so. None of this controls the learner. It changes the conditions around their decision.

> Humans cannot be fixed, but processes can. When a learner behaves differently from what the system expected, the useful response is not to treat the learner as a defective component, but to examine the process built around that behaviour: what they understood, what they expected, what attracted their attention, what they trusted, and what competing demands existed at the moment they were asked to act. Friction therefore has to be addressed with human behaviour in mind, including the mental shortcuts and cognitive biases that shape decisions, because a process designed for an idealized rational user will reliably fail real ones.

Later, I added direct badge-claim links to follow-up emails. The constraint had moved: telling learners to expect an email had reduced uncertainty, so making the claim link easier to find addressed the next friction in the flow.


## The book behind DevOps

I started working as a sysadmin in 2006 and quickly found myself working in what we'd now call a DevOps environment, though the word wasn't in common use yet. Development, packaging, testing, infrastructure, operations, documentation, and community contribution were all parts of the same system. Improving one part could make another worse. Automating a local task could just move the work downstream.

The principles later associated with DevOps always felt obvious to me: shorten feedback loops, automate repeatable work, make quality structural, optimize the whole rather than one team.

I read *The Phoenix Project* when it came out in the early 2010s, and I found it frustrating. The recommendations made sense, but the book kept pointing to another book that contained the reason they made sense: *The Goal*, by Eliyahu Goldratt, a book written in the 1980s about optimizing a factory —not at all about IT.

So I read *The Goal*, and everything clicked. The point wasn't manufacturing: the point was _flow_:
- define the goal of the system;
- find what currently limits progress toward it;
- use the capacity you already have;
- align the rest of the system around the constraint;
- elevate it when necessary;
- then look again, because the constraint will have moved.



![The Goal](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/ila0659v89g3h88fzqvq.png)


*The Phoenix Project* applied that pattern to IT, but Theory of Constraints was much broader and could be applied to many other systems.

This is why I've recommended *The Goal* for years when teaching or consulting about Puppet, Terraform, Kubernetes, and DevOps. The technologies are interventions. Theory of Constraints explains why and where to use them.

In particular, it forces practitioners to look beyond their local sphere of influence and evaluate the constraint governing the global system. In my case, a credential has not fulfilled its purpose until it has been claimed and can be used or, if the learner chooses, shared, so my job does not end when the issuing component reports success.


## What is the goal of technical education?

Over my twenty years in IT, technical education has had an increasingly prominent role. I've always practiced some form of enablement, either training my colleagues, or customers, and nowadays building a learning platform to automate and scale that approach as much as possible.

Most technical-education systems measure what they produce: content published, labs completed, events attended, badges issued. These numbers are useful, but they aren't the goal. A lab isn't successful because it runs. Documentation isn't successful because it's published. An event isn't successful because people attended. A badge isn't successful because it was issued.

The goal I use is this:

> Move complex technical knowledge into confident, increasingly independent practitioner action.

That changes where the system ends. For a learner, access isn't the goal: it's merely what makes learning possible. Learning isn't the goal either if nothing can be done with the acquired knowledge, so the flow continues into practice, demonstrated understanding, application, recognition, and whatever useful action follows.

For a content creator, writing the material isn't the whole job. The content still has to be validated, published, found, used, measured, and improved. If every author has to rebuild environments, integrations, credential logic, event plumbing, and analytics, expert time is being spent on the wrong constraint.

For a marketing team, organizing an event isn't the goal, and neither is counting registrations. What happens during the event matters, but what happens after it matters just as much: did people engage technically, did they continue, did the team learn what interested them, is there a useful next action, and did the event produce meaningful and actionable data?

For sales, partners, and customer-facing teams, sending someone a link isn't the goal. The right experience should help a practitioner understand a capability, prepare for a deeper technical engagement, or continue without requiring the same expert to repeat the same walkthrough.

These aren't separate systems. They're different views of the same flow:

```text
technical knowledge
→ accessible experience
→ practice
→ confidence
→ independent action
→ feedback
```

Because that flow runs through all of these teams, the constraint can appear anywhere along it.

## Friction is not the constraint

Every system contains friction. A confusing button is friction. A slow environment is friction. An unclear authoring convention is friction. A missing report field is friction. They can all be real without all being equally important.

The constraint is the friction currently governing the flow of the whole system. That distinction is what keeps continuous improvement from turning into a list of everything we could make nicer.

In order to improve the system, I start by observing behavior: where do people stop, where do they repeat work, where do they ask for help, where do teams invent manual workarounds? Then I measure enough to understand the flow: not every available metric, just enough to test the diagnosis.

Then I make the smallest useful change I can—for example, adding a slide before the exam challenge—and watch what happens. If it works, I turn it into something reusable: an interface, an automation, a convention, or sometimes just a sentence in the right place. Then I look for the next constraint in the system.

The badge slide is a tiny example of that. The same pattern led to faster lab startup, progress restoration, progressive hints, visible learning journeys, recommendations, automated quality checks, reusable event formats, and better feedback loops. From the outside, these can look like unrelated features. They're not: each one is an intervention at the point where knowledge was failing to become action.


## The system does not end where my ownership does

People tend to focus their effort on what they believe they can control. That's understandable: teams have their own tools, mandates, and metrics, and each one mostly sees the part of the flow directly in front of it. But it's also how local optimization happens: the content team publishes, the event team delivers, the credential platform issues, the analytics system records, and every component looks healthy while the user runs the lab twice because they think the first completion failed.

End-to-end responsibility doesn't mean owning every component or controlling every stakeholder. It means refusing to confuse an organizational boundary with the boundary of the system. Sometimes the best intervention is inside the component I own. Sometimes it's before the constraint becomes visible. Sometimes it's an interface with another platform or team. Sometimes it's just helping a person understand what happens next.

The useful question isn't:

> What can my component control?

It's:

> What can the system change to improve the probability that value reaches the goal?

The badge was issued, but the goal wasn’t achieved, so I followed the constraint until the flow improved—and then looked for where it had moved next.
