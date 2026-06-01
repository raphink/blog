---
template: post
title: "Colored initials in LaTeX"
date: "2011-08-26T19:01:00.001+02:00"
canonical_url: "https://raphink.blogspot.com/2011/08/colored-initials-in-latex.html"
blogspot_url: "https://raphink.blogspot.com/2011/08/colored-initials-in-latex.html"
tags: ["latex", "ubuntu"]
---
Georg Duffner, the creator of the [EB Garamond open-source font](http://www.georgduffner.at/ebgaramond/), has been working on an initials font for EB Garamond based on a 16th century French Bible lately. A few days ago, he was thinking about producing colored initials with it, and had the idea of splitting the font in two: one font for the background ornament, and one font for the foreground letter to superimpose on it.  
  
Base on this idea, I have hacked a little LaTeX module to typeset the initials in a simple way. The module can be found [on github](https://github.com/raphink/eblettrine) and is based on the lettrine LaTeX module.  
  
It makes use of fontspec to load the fonts so it only works with XeTeX and LuaTeX.  
  
The alphabet only contains 3 letters for now, so not really much can be achieved with it so far, but the code is there.  
  
Here is an example reproducing parts of the 16th century Bible used to get the samples of the initials:  
  

[![](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjY5NXP489C8FD8qR9sfWMqQayRDzriRd9hxcct_gGxUACb4qi9vUL7i9UHE7y-vpI8o4oTRDqFidmvaN7hXU10BLtTmQqVr_S_8KPA_ANdeKUpC4JuV4XwVFZqaUtjpOwIM3uUleQhxeM_/s320/eblettrine.png)](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjY5NXP489C8FD8qR9sfWMqQayRDzriRd9hxcct_gGxUACb4qi9vUL7i9UHE7y-vpI8o4oTRDqFidmvaN7hXU10BLtTmQqVr_S_8KPA_ANdeKUpC4JuV4XwVFZqaUtjpOwIM3uUleQhxeM_/s1600/eblettrine.png)
