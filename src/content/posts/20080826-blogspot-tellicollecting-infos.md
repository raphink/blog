---
template: post
title: "Tellicollecting infos"
date: "2008-08-26T09:09:00.001+02:00"
canonical_url: "https://raphink.blogspot.com/2008/08/tellicollecting-infos.html"
blogspot_url: "https://raphink.blogspot.com/2008/08/tellicollecting-infos.html"
tags: ["english", "kde", "linux", "programs"]
---
In the last few weeks, I've been using [Tellico](http://periapsis.org/tellico/) extensively. I first used it to manage a collection of boardgames for an association close to our house.  
  

## A first collection: boardgames

  
Tellico makes it easy to create and manage collections of objects, files, or whatever you want to keep a track of. In the case of the boardgames collection, I added a 'contents' table to list all the pieces of each game and track if the game was complete or not.  
  
[![Tellico's main view listing boardgames](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEivHNIrPmpQvTlptS7FgpKhjMCvcYcTMvLQBhQTvLarHezso9z-BhFcIn9oD1wRlCMl7MBzT3pBxwNqVvAUFLeApo9Z09AwcAvm54b7q5ergdMXsv3pO-9MjV2pmBBnwlb-CwxNr_FmwoaN/s320/web_tellico_main.jpg "Tellico's main view listing boardgames")](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEivHNIrPmpQvTlptS7FgpKhjMCvcYcTMvLQBhQTvLarHezso9z-BhFcIn9oD1wRlCMl7MBzT3pBxwNqVvAUFLeApo9Z09AwcAvm54b7q5ergdMXsv3pO-9MjV2pmBBnwlb-CwxNr_FmwoaN/s1600-h/web_tellico_main.jpg)  
I also added a 'reference' field automatically generated from the ID of the game in the database, to easily assign a unique reference to each object. The 'reference' field uses a "Dependant" type and its definition is "JEU %{id}" which appends the ID of the object to the string "JEU".  
Using the [fancy report](http://kde-files.org/content/show.php/Fancy+Report+%282+columns%29?content=56655) from [kde-files.org](http://kde-files.org/), I was able to easily print labels for each game.  
  
  
  

## DVDs, CDs, books, and many more...

  
After listing the boardgames, I began to make a list of our own DVDs and CDs. I found it very useful that Tellico allows to search for objects on a lot of web services, such as [Amazon](http://www.amazon.com/), and can even search by barcode (or ISBN for books). I was able to enter most of my CDs using the barcodes with the [amazon.fr](http://www.amazon.fr/) plugin. Tellico even completes ISBN as you type. Since the last number of ISBN codes is a check, Tellico adds it automatically so you can check if the ISBN you typed is correct.  
  
  
[![Tellico search for a book by ISBN on amazon.fr](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj_Lywo3izmk0O_LcPeKTeirtsj3ydqs5wBZVdSGTR35OlN7v0xnPGqCjB7NHbLN3_F5BbRqD5lDK8YpSL1bFtWVHfwsYbQNt8_Nyu6Te2ya-JnSrsEsaT0n-38E2quYbANiuM-KHsVTyJE/s320/web_tellico_isbn_search.jpg "Tellico search for a book by ISBN on amazon.fr")](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj_Lywo3izmk0O_LcPeKTeirtsj3ydqs5wBZVdSGTR35OlN7v0xnPGqCjB7NHbLN3_F5BbRqD5lDK8YpSL1bFtWVHfwsYbQNt8_Nyu6Te2ya-JnSrsEsaT0n-38E2quYbANiuM-KHsVTyJE/s1600-h/web_tellico_isbn_search.jpg)  
Tellico also allows you to enter several ISBN/barcodes at a time, either within the interface or by importing them from a file. This opens the door to scanning the codes with a barcode scanner. Unfortunately, barcode scanners are quite expensive. While the most expensive ones come with a USB interface and emulate a keyboard, the few cheap ones you find usually send special codes that can be pretty hard to deal with.  
  
Since version 1.3, Tellico includes a patch that allows to use a webcam to read barcodes. I tried to plug a webcam to my machine, fired up Tellico and opened the import window, but nothing special happened. I took a look at the [scripts that gave birth to the patch](http://tellico.dyndns.org/). These scripts use a combination of the v4l driver with mplayer to capture images from the webcam and send them to the [BaToo](http://people.inf.ethz.ch/adelmanr/batoo/) Java classes to decode the barcode. Since mplayer was only showing a black screen from my webcam, I hacked the script a bit to use vgrabbj instead, and managed to import shots from the webcam and send them to the BaToo Java script, but the quality of the shots taken by the webcam didn't quite please BaToo... so I finally gave up and typed the ISBN codes manually.  
  
  

## KDE integration

  
One thing I like very much with KDE program is integration. Since they share most of their resources, you can always expect them to easily cooperate. In the case of Tellico, I was very pleased to discover that the lending interface can use the contacts from KAddressBook (kabc) and inform KOrganizer about the planned date of return (although I couldn't get this to work for some reason).  
  
  
[![Lending a book to a kabc contact from Tellico](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjaknyCfRJ1tngxi-fDM7niWtBiFJ7f0F81ztVGCeKvjOKCtPWMxumZcmTaMCtCymrH0V9V8tjdXZX5LIXC_m1j4owoIJyQlJx_qOYTFNCqeY7Tw4hd-SHZ7s1W1gVE4zMpcdnVvnA7wfFV/s320/web_tellico_isbn_lending.jpg "Lending a book to a kabc contact from Tellico")](https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjaknyCfRJ1tngxi-fDM7niWtBiFJ7f0F81ztVGCeKvjOKCtPWMxumZcmTaMCtCymrH0V9V8tjdXZX5LIXC_m1j4owoIJyQlJx_qOYTFNCqeY7Tw4hd-SHZ7s1W1gVE4zMpcdnVvnA7wfFV/s1600-h/web_tellico_isbn_lending.jpg)  
  
  

## And a reactive developer

  
[Robby](http://periapsis.org/) was very reactive when I wrote to him concerning the possibility of importing boardgames infos from Amazon. Thank you Robby for reacting so promptly!
