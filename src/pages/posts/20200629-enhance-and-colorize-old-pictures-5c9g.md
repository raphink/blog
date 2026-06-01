---
template: post
title: "Enhance, Colorize, and Animate Old Pictures"
date: "2020-06-29T16:45:38Z"
excerpt: "MyHeritage in Color allows to fine-tune automatically colorized and enhanced photographs"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fb78xjnsl62d9by6bkyoh.jpg"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fb78xjnsl62d9by6bkyoh.jpg"
canonical_url: "https://dev.to/raphink/enhance-and-colorize-old-pictures-5c9g"
devto_url: "https://dev.to/raphink/enhance-and-colorize-old-pictures-5c9g"
---
Over the last 2 years, Machine Learning has brought impressive breakthrough to image processing techniques. In particular, photography colorization has seen amazing progress, thanks mainly to the work of two developers: [Jason Antic](https://twitter.com/citnaj) and [Dana Kelley](https://twitter.com/danasday).


## MyHeritage in Color

Their model is so precise that MyHeritage hired them to include a colorization tool directly on their website. As a result, you can colorize pictures for free at [https://www.myheritage.fr/incolor](https://www.myheritage.fr/incolor). Paid MyHeritage members are not limited in the number colorizations, and don't get the MyHeritage watermark on the result pictures.

Additionally, MyHeritage recently added a new AI-based feature to this tool, by allowing users to enhance faces in their pictures:

[Tweet](https://twitter.com/i/web/status/1276608740884721665)


Using the tool from your MyHeritage picture collection is extremely simple. You just need to upload a picture and use the "enhance" and "colorize" buttons one after the other.

![Colorization and Enhance tools](https://dev-to-uploads.s3.amazonaws.com/i/wt2uwlf0t0dhu2w53w91.png)

## Tuning colorization

In the last few weeks, I've seen lots of people using MyHeritage In Color on their pictures, and they're usually quite content with the result. However, most of them have no idea they could get even better results by tuning the rendering.

Once a picture is colorized, a gear icon appears to let you fine-tune the result:

![Tuning gear icon](https://dev-to-uploads.s3.amazonaws.com/i/4prlyuwyikgo0qhi9v69.png)


There are 4 parameters which can be tuned using this icon:

- Contrast enhancement: leave it checked usually. It is mainly useful if your input picture is already very contrasted, which is not the case of most pictures.
- Saturation: use this to keep the same colors, but make them "stronger"
- Automatic vs Manual rendering: this allows you to set a rendering factor manually. Generally, a lower factor brings more colors, but also more colorization "mistakes" (such a purple zones)
- Colorization model: this lets you use an alternate model, which at times looks better.


## General observations

Generally speaking, this is what I have found from colorizing hundreds of pictures, essentially portraits of people:

* If clothes (in particular dark ones) have purple spots over them but the faces are rendered well, try switching to the "Alternative" model
* If faces are colorized properly but legs are grey, try the "Alternative" model as well
* If the colors are fine, but the colors aren't coming through strong enough, increase the saturation
* If the colors are too grey-ish (especially with low-res pictures), try reducing the rendering factor to 16.
* If the picture is high-res enough and renders rather well but has uncolorized spots, you can try increasing the rendering factor. Note that rendering will generally be longer with a higher factor.


Here is an example:

![Default settings](https://dev-to-uploads.s3.amazonaws.com/i/of5je7h1ou8nd48dtugh.png)

This colorized (and enhanced) picture doesn't look bad, but the clothes have lots of purple spots all over them. Switching to the alternative model reduces this, without affecting the faces too much:

![Alternative model](https://dev-to-uploads.s3.amazonaws.com/i/epmwc8x4r4zp90nu6jju.png)


There's still some weird zones though, so I want to try and reduce these by increasing the rendering factor. After playing around, I ended up with a factor of 64 for that picture:

![Render factor](https://dev-to-uploads.s3.amazonaws.com/i/sqv6a9c7s7rrb2gtb9l1.png)


However, the colors are getting slightly dim now, so I've increased the saturation to 1.2 to counteract that:

![Saturation](https://dev-to-uploads.s3.amazonaws.com/i/l6ttuj25eh7jxtzolp28.png)


Granted, the results on this picture are far from perfect, as it is hard to colorize (which is why I chose it!).


## Methodology

When tuning a colorization, every time you modify a parameter, you can preview the changes, and then choose to save them.

In a very practical fashion, MyHeritage lets you click on the colorized picture to compare with the previously saved version.

However, it doesn't save the results for each combination, so when you play around with parameters, you can end up waiting a long time to go back to previous combinations.

For this reason, I use A/B testing when colorizing. My process is:

1. Colorize the picture a first time
2. Open the tuning interface
3. Tune one parameter, preview and compare
4. If the result is better than the previously saved picture, save it
5. Repeat from step 2 until you can't improve the result

The drawback of this method is that you need to re-open the tuning interface every time, but in the end, you'll save lots of rendering time and you know you're saving the best version you could get.


## Fixing other color issues

While the settings in MyHeritage in Color clearly help, they can't —yet— get you to a perfect result most of the time.

In many cases, some parameters will have better results on people, while others will improve objects or the background.

One thing I've started doing is downloading multiple versions of the colorization, importing them all as layers in Gimp, and cutting them so as to get the best result in every zone.

In other cases, the tint on some objects may not be perfect despite trying to tune the engine. In these cases, you can duplicate these zones in Gimp and tune their tint/saturation/hue individually until you get the result you want.


## Improving Face Enhancing

Face enhancing can lead to very impressive results by recreating realistic faces that match the shadow of faces in the blur pictures.

For example, in the picture I used before, some of the children's faces look amazing:

![Face enhancement and colorization](https://dev-to-uploads.s3.amazonaws.com/i/2svy7z72gnqo6cl90oql.jpg)

Yes, the original is on the left!

At times however, little dots or other issues with the original picture can lead the face enhancer astray and generate some very disturbing results. Here for example, there's a line on the face in the original picture, which gets "interpreted" as a scar:

![Scar mouth](https://dev-to-uploads.s3.amazonaws.com/i/i8d5qjc1ysxlegxooylj.jpg)

And in this one, the left eye looks too dark in the original picture, leading to a strange color dissymetry:

![Eye color dissymetry](https://dev-to-uploads.s3.amazonaws.com/i/dbzchaqre1c8eyy3zc6e.jpg)


Fortunately, these aren't too hard to fix. In the case of the "scar", erasing it (using Gimp with simple editing methods such as the stamp tool) fixed the issue:

![Fixed scar mouth](https://dev-to-uploads.s3.amazonaws.com/i/b78xjnsl62d9by6bkyoh.jpg)


The eyes weren't much harder to fix. Since the face is straight, I just copied the right pupil (just the pupil, not the entire eye) and pasted it on the left eye. The difference is hardly noticeable in the B&W picture, but it's enough for the AI algorithm to pick it up properly:

![Fixed eye color](https://dev-to-uploads.s3.amazonaws.com/i/2xxhxugvmo4wqnxdj2qa.jpg)


## Edit (2021-02-26): Animate the Portrait

As of February 2021, MyHeritage now allows to animate portraits that were enhanced.

From the picture view, simply click the animation button and choose the face to animate. You can choose from 10 different animations. If the face was colorized, the animation will honor it.


<iframe width="560" height="315" src="https://www.youtube.com/embed/JVm5dEa9VlY" title="YouTube video" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


## How about you?

Have you colorized pictures with DeOldify or MyHeritage in Color? Have you found useful ways to get good results? Share them in the comments!
