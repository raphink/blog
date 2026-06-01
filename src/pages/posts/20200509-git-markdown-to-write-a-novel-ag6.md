---
template: post
title: "Git & Markdown to write a novel"
date: "2020-05-09T06:20:31Z"
excerpt: "Using Git and Markdown to write a novel"
canonical_url: "https://dev.to/raphink/git-markdown-to-write-a-novel-ag6"
devto_url: "https://dev.to/raphink/git-markdown-to-write-a-novel-ag6"
---
This year, I started writing a historical novel about a branch of my family. I quickly realized I needed some tooling to organize my data: what I know about the characters, the places, a general timeline, etc.


# Manuskript

I looked for software to do that and found that the reference is [Scrivener](https://www.literatureandlatte.com/scrivener/overview). However interesting it looked, I'd rather use Open Source software whenever possible, so I started using [Manuskript](https://www.theologeek.ch/manuskript/), an Open Source software for writers similar to Scrivener.

![Manuskript on Ubuntu](https://dev-to-uploads.s3.amazonaws.com/i/fj7xlois1xl9d7qtzyjl.png)

I laid out some chapters, characters, plots… then I realized the saving format was binary. It's actually a Zip archive which contains all the information in flat files:

```console
        1  2020-05-09 08:05   MANUSKRIPT
      137  2020-05-09 08:05   infos.txt
        0  2020-05-09 08:05   summary.txt
       46  2020-05-09 08:05   status.txt
      147  2020-05-09 08:05   labels.txt
      284  2020-05-09 08:05   characters/0-Samuel_L-on.txt
      281  2020-05-09 08:05   characters/1-L-on_Grunberg.txt
      261  2020-05-09 08:05   characters/2-Adolphe_Grunberg.txt
      309  2020-05-09 08:05   characters/3-Elisabeth_Rau.txt
      112  2020-05-09 08:05   characters/4-Victor_Grunberg.txt
      109  2020-05-09 08:05   characters/5-Maria_Schorr.txt
      224  2020-05-09 08:05   characters/6-Fred_Grunberg.txt
      125  2020-05-09 08:05   characters/7-Colonel_de_Villebois-Mareuil.txt
      107  2020-05-09 08:05   characters/8-Said_Pacha.txt
      109  2020-05-09 08:05   characters/9-Isaac_Aghion.txt
       92  2020-05-09 08:05   outline/00-Setup.md
      322  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/folder.txt
     3753  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/0-Une_rencontre_inattendue.md
     1706  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/1-Office_de_chabbat.md
      715  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/2-Un_d-ner_chez_Isaac.md
      482  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/3-Proc-s_1.md
      166  2020-05-09 08:05   outline/01-Les_joyaux_-gyptiens/4-Sc-ne_5.md
       83  2020-05-09 08:05   outline/02-Paris/folder.txt
      102  2020-05-09 08:05   outline/02-Paris/0-Sc-ne_1.md
       97  2020-05-09 08:05   outline/03-Etudes_des_enfants/folder.txt
      103  2020-05-09 08:05   outline/03-Etudes_des_enfants/0-Sc-ne_1.md
      103  2020-05-09 08:05   outline/03-Etudes_des_enfants/1-Sc-ne_2.md
       95  2020-05-09 08:05   outline/04-Premiers_emplois/folder.txt
      103  2020-05-09 08:05   outline/04-Premiers_emplois/0-Sc-ne_1.md
       96  2020-05-09 08:05   outline/05-Vers_le_Transvaal/folder.txt
      103  2020-05-09 08:05   outline/05-Vers_le_Transvaal/0-Sc-ne_1.md
      334  2020-05-09 08:05   outline/21-Epilogue.md
    40074  2020-05-09 08:05   revisions.xml
      275  2020-05-09 08:05   world.opml
     1669  2020-05-09 08:05   plots.xml
     2499  2020-05-09 08:05   settings.txt
```

This is rather good news, and there's ways to automate PDF creation from this within the software, good news again!


However, some things were problematic to me:

* I like to tune my pandoc/LaTeX rendering, and the options in Manuskript were pretty limited for that
* I'd rather not commit a single Zip file in Git, so I would have preferred to have all the files in the current directory
* Manuskript cannot be automated to compile the PDF, you need to go through the GUI and click on buttons. That's a blocker for me.


# Going the full-git way

So I decided I would do everything in Git + Markdown, without the help of a third-party application.


## Chapters

I'm currently storing the chapters in their own directories, with numbered Markdown files:

```console
chapitres/
├── 01_les_joyaux_egyptiens
│   ├── 00_titre.md
│   ├── 01_une_rencontre_innatendue.md
│   ├── 02_office_de_chabbat.md
│   ├── 03_brody.md
│   ├── 04_chabbat_2.md
│   ├── 05_diner_chez_isaac.md
│   └── 06_audience.md
├── 02_les_enfants_grunberg
│   ├── 00_titre.md
│   ├── 01_leon.md
│   ├── 02_retour.md
│   ├── 03_coffre.md
│   ├── 04_burtaux.md
│   ├── 05_article.md
│   └── 06_article2.md
├── 03_annees_noires
│   └── 00_titre.md
├── 04_etudes
│   └── 00_titre.md
├── 05_premier_travail
│   └── 00_titre.md
├── 06_le_creusot
│   └── 00_titre.md
└── 21_epilogue.md
```

## Characters & Places

The characters documentation is stored in Markdown files as well, and links can be made between them when necessary:

```console
personnages/
├── Adolphe_Grunberg.md
├── Charlotte_Grunberg.md
├── Elisabeth_Rau.md
├── Emilie_Grunberg.md
├── Felix_Zottier.md
├── Frederic_Grunberg.md
├── Isaac_Aghion.md
├── Jacques_Grunberg.md
├── Leon_Grunberg.md
├── Lucie_Leon.md
├── Marc_Leon.md
├── Mirel_Schorr.md
├── Paul_Grunberg.md
└── Samuel_Leon.md
```

Same goes for places:

```console
lieux/
├── Alexandrie.md
├── Brody.md
├── Dubno.md
├── Grunberg_Boulogne.md
├── Paris.md
├── Petite_Jonchere.md
└── Vienne.md
```

Links can easily be made between these documentation files:

```markdown
# Mirel Schorr


## État civil

* Prénoms : Mirel, dite Maria
* Nom : Grünberg
* Nom de naissance : Schorr


## Portrait

Inconnu


## Description physique

Inconnu



## Evénements


* ca 1800 : ° à [Dubno](../lieux/Dubno.md) (Russie)
* Enfance à [Brody](../lieux/Brody.md) (Autriche)
  avec ses parents [Schachne](Schachne_Schorr.md)
  et [Sarah](Sarah_Bick.md)
  et ses frères [Naphtali](Naphtali_Mendel_Schorr.md)
  et [Osias](Osias_Heschel_Schorr.md)

* 1821: Mariage à [Brody](../lieux/Brody.md)

* 1870 : habite à [Vienne](../lieux/Vienne.md) (testament [Adolphe](Adolphe_Grunberg.md))

* 1877 : habite à [Paris](../lieux/Paris.md) (+)
* 1877 : + à [Vienne](../lieux/Vienne.md)


## Habillement

Voir sa garde-robe en 1853 dans l'inventaire de [Victor](Victor_Grunberg.md)
```


## Section stats

Manuskript provides stats about the number of words in a section. I've added a Make target for that:

```Makefile
stats:
	find chapitres/ -name "*.md" -not -name '00_titre.md' -print0 | sort -z | xargs -0 wc -w
```

Caveat: it also lists the words in the comments…


# Building the project

I'm using Pandoc to build the project with my own LaTeX template.


```Makefile
%.md:
	cat meta.md > $@
	find chapitres/ -name "*.md"  -print0 | sort -z | xargs -0 cat >> $@

%.tex: %.md
	pandoc --pdf-engine lualatex  --template extended.tex \
		   --variable numbersections --toc --variable toc-depth=2 \
		   --variable documentclass=memoir --variable fontsize=12pt \
		   --filter pandoc-citeproc \
		   --verbose \
		   $< -o $@

%.pdf: %.tex
	OSFONTDIR=$(FONTSDIR) lualatex $<
	makeindex $*.idx
	OSFONTDIR=$(FONTSDIR) lualatex $<
```


The novel project can be found in this GitHub repository:

{% github raphink/genearoman %}
