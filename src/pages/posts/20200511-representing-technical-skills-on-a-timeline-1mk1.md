---
template: post
title: "Representing technical skills on a timeline"
date: "2020-05-11T15:19:14Z"
excerpt: "Several ways to display technical skills on a timeline"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F0kwh14busu2ckvvmofwp.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2F0kwh14busu2ckvvmofwp.png"
canonical_url: "https://dev.to/raphink/representing-technical-skills-on-a-timeline-1mk1"
devto_url: "https://dev.to/raphink/representing-technical-skills-on-a-timeline-1mk1"
tags: ["jquery", "latex", "showdev", "opensource"]
---
CVs and other websites presenting technical skills often lack a time dimension, allowing to know when and for how long a technology has been used.


# Timeline on CV

About 8 years ago, I wanted to add a visual representation of my experience on my PDF CV.

Since I already used LaTeX with the excellent [moderncv class](https://ctan.org/pkg/moderncv), I wanted the solution to extend on that class. [TeX StackExchange did not disappoint](https://tex.stackexchange.com/questions/29725/putting-a-timeline-for-dates-in-moderncv) (they never do) and this gave birth to the [`moderntimeline` LaTeX package](https://ctan.org/pkg/moderntimeline) which I have been maintaining since.

![Moderntimeline example](https://dev-to-uploads.s3.amazonaws.com/i/4ae3bwwiymnffrljjypc.png)


To this day I still use this solution [on my CV](https://github.com/raphink/CV).

Since then, a template has even been added to [Overleaf](https://www.overleaf.com/latex/examples/moderncv-with-modern-timeline/prmmmvtvfxsn) to make it easier!

![Template on Overleaf](https://dev-to-uploads.s3.amazonaws.com/i/hvcmi91fhd8eaqex8u8c.png)


# Technology timeline

The CV timeline is still not enough to present the data I wish to display, which is the temporal evolution of technical skills.

## OpenHub

Among the many websites which analyze public code repositories to get metrics out of them, [OpenHub](https://www.openhub.net/) (previously Ohloh) is very interesting because it presents a timeline of languages used in projects.

Here's an example with [my profile](https://www.openhub.net/accounts/raphink), where you can identify clear periods: a lot of LaTeX (dark blue) in the first years (when I edited books), then Augeas (light grey), mostly Ruby (red) between 2012 and 2015, then mainly Go (purple).

![OpenHub Languages View](https://dev-to-uploads.s3.amazonaws.com/i/0kwh14busu2ckvvmofwp.png)



## A broader approach

Not every tech skill can be measured with a number of code lines though.
So in 2013, I switched [my main CV page](https://raphink.info/) to a temporal skills view.

![Skills View](https://dev-to-uploads.s3.amazonaws.com/i/8ld9549ukxidnb7i7jjv.png)

This uses [vis.js](https://visjs.org/) to build a table of skills from [a JSON file](https://github.com/raphink/CV/blob/gh-pages/items.json), e.g.:

```json
[
  {"id": "Orange", "content": "<img src='img/orange.png' class='logo' /><b>Orange Portails</b><br />Systems Engineer", "start": "2006-06-01", "end": "2012-03-01", "type": "background", "className": "orange"},
  {"id": "Camptocamp", "content": "<img src='img/camptocamp.png' class='logo' /><b>Camptocamp</b><br />Infrastructure Developer", "start": "2012-03-01", "type": "background", "className": "camptocamp"},

  {"group": "provisioning", "content": "Debian FAI", "start": "2006-06-01", "end": "2012-03-01", "className": "contributed"},
  {"group": "provisioning", "content": "Kickstart", "start": "2006-06-01", "className": "implemented"},
  {"group": "provisioning", "content": "Terraform", "name": "terraform", "start": "2016-05-01", "className": "contributed"}
]
```

This JSON file is parsed and displayed on the page. Each skill can be assigned an icon as well as additional information. The skill bar can be clicked to display this information, taken from the `skills/` directory and [documented in Markdown](https://github.com/raphink/CV/blob/gh-pages/skills/go/details.md).

![Details View](https://dev-to-uploads.s3.amazonaws.com/i/xe2j9wktc28leawnu9ee.png)


The code is open-source and can be forked on GitHub. Just check the `gh-pages` branch:

[GitHub — raphink/CV](https://github.com/raphink/CV)


As usual, pull requests are welcome if you find nice ways to improve this!
