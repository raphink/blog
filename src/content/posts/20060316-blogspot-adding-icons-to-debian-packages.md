---
template: post
title: "Adding icons to Debian packages"
date: "2006-03-16T15:14:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2006/03/adding-icons-to-debian-packages.html"
blogspot_url: "https://raphink.blogspot.com/2006/03/adding-icons-to-debian-packages.html"
tags: ["debian", "english", "packaging", "restored"]
---
### Rationale

So you packaged a nice app for Debian/Ubuntu… but there’s no icon, or the icon is horrible, or it’s missing some sizes…

In short, you are in a situation in which you need to add icons to your package…

Well the easy way would be to add png files directly in debian/ and dh\_install them in /usr/share/icons/hicolor/fooxfoo/bar . Unfortunately, your package is not a Debian-native and the build fails because it can’t create the diff since it contains binary stuff! Too bad…

Now let’s think about it… The idea in Debian package is that they are **source** packages. So just the way we now try to provide docbook/sgml manpages and build them in debian/rules, install the binary then clean it, why not do this with icons too?

### What do you gain from doing so ?

-   You package is easier to maintain: just change the source and the binaries are generated from it at build and cleaned
-   You don’t add binary stuff to your package
-   You don’t have to use xpm icons
-   You don’t have to add pngs directly in the source or make your package a Debian-native …

### Now what is the option then?

Well looking around I found librsvg-bin (no idea why it’s named this way since it’s an exec, not a lib) which is a tool in main, allowing to convert svg files to png. There we are. Just as we provide docbook/sgml for manpages, let’s provide svg (which is xml, too) for icons!

So we’re adding librsvg-bin to Build-Depends, putting our svg as debian/myapp.svg, and completing debian/rules. Now the problem I have is that I’d like to use a for loop to generate all icons but make won’t let me use bash script… So I’ll create a script file that I’ll name debian/buildicons.sh, with these contents (don’t forget to give it a chmod +x):

```bash
#!/bin/bash  
  
svgname="$1"  
\[\[ -z "$2" \]\] && section="apps" || section="$2"  
\[\[ -z "$3" \]\] && maxres="128" || maxres="$3"  
  
pngname="\`basename ${svgname} .svg\`.png"  
  
for resol in 16 22 32 48 64 128  
do  
       if \[\[ "$resol" -le "$maxres" \]\]  
       then  
               icondir="debian/icons/hicolor/${resol}x${resol}/${section}"  
               mkdir -p "$icondir"  
               rsvg-convert -h "$resol" -w "$resol"  "debian/${svgname}" -o "${icondir}/${pngname}"  
       fi  
done  
icondir="debian/icons/hicolor/scalable/${section}"  
mkdir -p "$icondir"  
gzip -9 "debian/${svgname}" -c > "${icondir}/${svgname}z"  
```

We’re using an argument in this script for the program name so it can be ported and used in other packages.  
Note the last lines, that are aimed to gzipping and installing the svg file in /usr/share/icons/hicolor/scalable/.

We’ll call this script from within debian/rules with the following:

```makefile
build/mypackage::  
debian/buildicons.sh myapp.svg apps  
```

Then we’ll install the icons with:

```makefile
install/mypackage::  
dh\_install debian/icons/\* usr/share/icons
```

Then finally clean the build:

```makefile
clean::  
rm -rf debian/icons
```

Note: I reckon it’s kind of dirty to externalize debian/buildicons.sh as I propose to do. If anyone has a proposal to make it part of debian/rules cleanly, I’ll be happy to hear it ![:D](http://web.archive.org/web/20060806182544/http://raphink.info/blog/wp-includes/images/smilies/icon_biggrin.gif)
