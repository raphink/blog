---
template: post
title: "Recognizing faces in historical photographs"
date: "2020-05-03T20:10:58Z"
excerpt: "Using machine learning to identify people in historical photographs"
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fzkzysi903rs0m6w8rvy1.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fi%2Fzkzysi903rs0m6w8rvy1.png"
canonical_url: "https://dev.to/raphink/recognizing-faces-in-historical-photographs-3ikc"
devto_url: "https://dev.to/raphink/recognizing-faces-in-historical-photographs-3ikc"
---
Genealogy has been one of my main personal activities for years. As part of my research, I've collected old pictures of family members that cousins I met were kind enough to send me (usually in scanned form, although at times I was actually given the custody of original photographs).


# AI to Help with Identification

In the last few years, I've added these photographs to Google Photos to take advantage of the face recognition features. It's allowed me to quickly find pictures of people, and it has helped me to identify people in pictures with the help of AI.

![Google Photos helps me keep track of known people in photographs](https://dev-to-uploads.s3.amazonaws.com/i/wtowmhpvyc51m79yef5j.png)
*Google Photos helps me keep track of known people in photographs*


However useful this has been though, I've felt for some time that the scope was too narrow. I've found pictures of my great-grandfather and his associate in books and newspapers, and there's probably more I haven't seen yet.

Furthermore, there's people in my collection that I haven't identified yet. Somewhere, somehow, I'm sure there's descendants of these people who have portraits of them, and would love to get more pictures of their ancestors. I have occasionally been able to identify them with notes in the back of pictures, but there's still a lot left to put a name on.


# Thinking Broader

So I've been thinking… What if I could have a system similar to Google Photos face grouping and identification, but at a much more global scale?

The time seems ripe for this:

* we have the algorithms to identify faces
* each new day brings hundreds of new historical pictures online —from family portraits to war pictures
* there's large genealogy databases that associate portraits with identity ([Ancestry](http://ancestry.com/), [Geni](https://geni.com), [MyHeritage](http://myheritage.com/), [Geneanet](https://geneanet.org/), etc.)


# Starting Point

A few months ago, I've started playing with [AWS Rekognition](https://aws.amazon.com/rekognition/) to see what I could get out of my own personal collection. Encouraged by the results, I launched a little PoC project, which can be found at:

https://raphink.github.io/find-my-ancestor/


![President Paul Kruger found by the AI among his family](https://dev-to-uploads.s3.amazonaws.com/i/79uz5005ebjyex7knfwz.png)
*President Paul Kruger found by the AI among his family*


In this project, I picked public Flickr collections featuring historical photographs from all over the world. I scanned a few million pictures and stored face metadata about them in AWS Rekognition. I then built a simple web UI to query this database from a given picture.

The code (both Ruby scripts and web interface) can be found on GitHub:

[GitHub — raphink/find-my-ancestor](https://github.com/raphink/find-my-ancestor)

I've communicated about this project on various Genealogy websites and groups. Unfortunately, the results were not so great. Apart from celebrities and royalties, it's hard to identify random people in a database of "only" a million faces, though I am quite sure the algorithm did identify my great-great-uncle in two pictures from the Boer War.


# The Vision

MyHeritage recently worked with AI developer [Jason Antic](https://twitter.com/citnaj) to provide an amazing colorization algorithm.

Most of these genealogical websites provide some kind of hinting system, which send you regular notifications of:

* historical documents matching the names of people in your tree
* other trees with people matching yours
* DNA matches


My goal would thus be to provide a new kind of hint, in the form of photographs matching known portraits of people in your tree.


After giving it some thinking, I'm afraid though that the database I have built in AWK Rekognition won't be of much help. It seems I should be using another kind of algorithm to group faces by known person in order to improve matching.


I'd love to this see project get somewhere. There's so many people who could be identified… soldiers in WWI/WWII pictures, lost family members in concentration camps, and many other unsolved mysteries…

Do you AI experts have any tips to help me continue this project?
