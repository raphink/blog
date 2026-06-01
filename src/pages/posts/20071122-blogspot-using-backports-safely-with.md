---
template: post
title: "Using backports safely with apt/preferences"
date: "2007-11-22T15:39:00.000+01:00"
canonical_url: "https://raphink.blogspot.com/2007/11/using-backports-safely-with.html"
blogspot_url: "https://raphink.blogspot.com/2007/11/using-backports-safely-with.html"
tags: ["debian", "english", "linux", "package", "restored", "sysadmin", "ubuntu"]
---
Many Ubuntu users like to have the latest versions of softwares and use backports for that. But backports tend to break the stability of a system, and it can be quite boring to comment/uncomment the backports line in /etc/apt/sources.list everytime you want to install a backport. Fortunately, apt/preferences is there to help us!

## The changes to make

First of all, add the backports line for your release of Ubuntu in your sources.list. For example, on my feisty server I added:  
`    deb http://archive.ubuntu.com/ubuntu feisty-backports main restricted universe multiverse    `

Now to set the preferences. In my /etc/apt/preferences file, I have:  
`    Explanation: Backported packages have a lower priority   Package: *   Pin: release a=feisty-backports   Pin-Priority: 100    `

## Installing a package from the backports

Now, let’s see what happens on my system. Backports have higher version numbers than the packages in feisty, feisty-updates and feisty-security, but all packages in feisty-backports have a priority of 100 (the default priority being 500), so they are never chosen for installation.

From then on, backported packages will not be installed by default. If I want to install a backported package, I have two ways of doing so:

#### Installing the package from backports but not its dependencies

`apt-get install foo/feisty-backports`

This will install package `foo` from feisty-backports, but the possible dependencies will not be taken in feisty-backports. This is safer but will not necessarily work.

For example:

`   $ sudo apt-get install -s postfix-mysql/feisty-backports   Lecture des listes de paquets... Fait   Construction de l'arbre des dépendances   Reading state information... Fait   Version choisie 2.4.5-3~feisty1 (Ubuntu:7.04/feisty-backports) pour postfix-mysql   Certains paquets ne peuvent être installés. Ceci peut signifier   que vous avez demandé l'impossible, ou bien, si vous utilisez   la distribution unstable, que certains paquets n'ont pas encore   été créés ou ne sont pas sortis d'Incoming.`

Puisque vous n’avez demandé qu’une seule opération, le paquet n’est  
probablement pas installable et vous devriez envoyer un rapport de bogue.  
L’information suivante devrait vous aider à résoudre la situation :

Les paquets suivants contiennent des dépendances non satisfaites :  
postfix-mysql: Dépend: postfix (= 2.4.5-3~feisty1) mais 2.3.8-2 devra être installé  
E: Paquets défectueux  
The installation fails because the necessary dependency is only present in feisty-backports.

#### Installing the package and its dependencies from backports

`apt-get install -t feisty-backports foo`

This will install package `foo` using the feisty-backports repository with a temporary priority of 990. Dependencies will be taken in feisty-backports aswell.

For example:  
`    $ sudo apt-get install -s -t feisty-backports postfix-mysql   Lecture des listes de paquets... Fait   Construction de l'arbre des dépendances   Reading state information... Fait   Les paquets supplémentaires suivants seront installés :   postfix   Paquets suggérés :   procmail postfix-pgsql postfix-ldap postfix-pcre sasl2-bin resolvconf postfix-cdb   Les NOUVEAUX paquets suivants seront installés :   postfix-mysql   Les paquets suivants seront mis à jour :   postfix   1 mis à jour, 1 nouvellement installés, 0 à enlever et 4 non mis à jour.   Inst postfix [2.3.8-2] (2.4.5-3~feisty1 Ubuntu:7.04/feisty-backports)   Inst postfix-mysql (2.4.5-3~feisty1 Ubuntu:7.04/feisty-backports)   Conf postfix (2.4.5-3~feisty1 Ubuntu:7.04/feisty-backports)   Conf postfix-mysql (2.4.5-3~feisty1 Ubuntu:7.04/feisty-backports)    `

All the packages are taken from feisty-backport in this example.

## Upgrading the system with all available backports

Let’s say I want to upgrade my system using all the available backports for the packages I use (which is not recommended). The command would be :  
`apt-get -t feisty-backports dist-upgrade`
