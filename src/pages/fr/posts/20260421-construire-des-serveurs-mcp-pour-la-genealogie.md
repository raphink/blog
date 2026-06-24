---
template: post
lang: fr
title: "Construire des serveurs MCP pour la généalogie : la recherche historique augmentée par l'IA"
date: "2026-04-21T16:58:46Z"
excerpt: "Comment j'ai utilisé Claude et des serveurs MCP pour transformer ma recherche généalogique."
translation: /posts/20260421-building-mcp-servers-for-genealogy-ai-powered-historical-research-261p
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F3ch2earn53443pwxiifw.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F3ch2earn53443pwxiifw.png"
---
Depuis plusieurs années, j'écris un livre qui retrace quatre branches familiales à travers l'Europe, le Moyen-Orient et l'Afrique du Sud. L'un des fils conducteurs suit Louis Rau, mon arrière-arrière-arrière-grand-oncle, qui présida la Compagnie Continentale Edison (CCE) au début du XXe siècle. Il était un Edison Pioneer — membre du cercle intérieur qui introduisit les systèmes électriques d'Edison en Europe.

L'année dernière, j'ai découvert que les archives de Thomas Edison avaient été numérisées à l'université Rutgers. Je me suis rendu sur [edisondigital.rutgers.edu](http://edisondigital.rutgers.edu), j'ai tapé « Louis Rau » dans le champ de recherche, j'ai appuyé sur Entrée — et 847 résultats sont apparus.

Quelque part dans ces 847 documents se trouvait la correspondance qui expliquerait la relation d'affaires entre Louis Rau et Élie Moïse Léon, co-fondateur de la CCE. Quelque part, les lettres qui retraceraient ses allées et venues entre Paris et Genève. Quelque part, les détails des installations électriques de la CCE à travers l'Europe.

Mais il aurait fallu les parcourir un par un, lire les extraits, ouvrir les documents prometteurs, recouper les dates, prendre des notes, revenir plus tard sans se souvenir lesquels j'avais déjà consultés…

Quelques semaines auparavant, j'avais commencé à soumettre des documents généalogiques à Claude, mais c'était encore fastidieux, et je me heurtais sans cesse aux limites d'import d'images dans les conversations. Et puis l'évidence s'est imposée : pourquoi ne pas construire un serveur MCP, pour que Claude puisse effectuer les recherches directement ?

Cette question a engendré trois serveurs MCP, un flux de travail de recherche entièrement reconfiguré, et un rapport fondamentalement différent aux archives historiques.


# Première victoire : le MCP Edison Papers

Les Edison Papers disposent d'une API. Je ne le savais pas au départ — je savais seulement qu'il existait un site web avec un champ de recherche. Mais un rapide coup d'œil à l'onglet réseau a révélé des endpoints REST propres retournant du JSON.

J'ai ouvert Claude Code et lui ai demandé de construire un serveur MCP enveloppant l'API Edison Papers. Quelques heures d'itération plus tard, j'avais :

- `edison_search` : interrogation avec précision au niveau des champs (`creator:"Rau, Louis"`, `recipient:"Léon, Élie"`)
- `edison_get_document` : récupération des métadonnées complètes et des transcriptions
- `edison_browse_series` : navigation systématique dans les collections de documents
- `edison_get_images` : accès aux numérisations haute résolution

[https://github.com/raphink/edison-archive-mcp](https://github.com/raphink/edison-archive-mcp)

Au lieu de cliquer à travers 847 résultats, je pouvais désormais demander à Claude :

> « Trouve la correspondance où Louis Rau est le créateur, datée de 1892 à 1895, mentionnant des installations électriques ou les opérations parisiennes. »

Et Claude orchestrait l'ensemble du processus de recherche :

1. **Recherche** : appel au MCP Edison Papers → récupération de tous les résultats correspondants
2. **Triage** : lecture de tous les résumés, décision sur les documents méritant une analyse approfondie
3. **Suivi** : création d'une entrée dans une base de données Notion pour chaque document avec son statut d'analyse
4. **Priorisation** : classement des documents par pertinence
5. **Lecture approfondie** : pour les documents prioritaires, récupération des images haute résolution et recours à l'OCR pour le contexte complet
6. **Synthèse** : fourniture d'un résumé de l'ensemble des trouvailles

Ce qui aurait exigé des heures de navigation manuelle, de prises de notes et de recoupements se déroule désormais en une seule conversation.

L'utilité était immédiate. Mais cela a fait surgir un nouveau problème : où déposer toutes ces trouvailles ?


# Le problème d'organisation : le MCP Notion

J'utilisais déjà Notion pour organiser mes recherches : profils de personnes, synthèses de documents, questions en suspens. Et Claude disposait déjà d'un MCP pour Notion.

Désormais, quand je demandais :

> « Cherche dans les Edison Papers la correspondance de Louis Rau de 1892 à 1895, crée une page Notion résumant les trouvailles, et relie-la au profil de Louis Rau. »

Claude effectuait :

1. **Recherche** : appel au MCP Edison Papers → récupération de tous les résultats correspondants
2. **Triage** : lecture de tous les résumés, décision sur les documents méritant une analyse approfondie
3. **Suivi** : création d'une entrée dans une base de données Notion pour chaque document avec son statut d'analyse
4. **Priorisation** : classement des documents par pertinence
5. **Lecture approfondie** : pour les documents prioritaires, récupération des images haute résolution et recours à l'OCR pour le contexte complet
6. **Documentation** : mise à jour des pages Notion avec les trouvailles
7. **Connexion** : mise à jour des pages de profil des personnes mentionnées (Louis Rau, Élie Léon, etc.)

C'était remarquable : un savoir structuré, automatiquement organisé, le tout en une seule conversation.

Puis Claude s'est mis à halluciner.


# Le problème des hallucinations : Claude a besoin d'une source de vérité

Claude trouvait des documents mentionnant par exemple Samuel Léon et Élie Léon, et concluait avec assurance que Samuel était le neveu d'Élie — une affirmation qu'il inventait de toutes pièces.

Ou bien il affirmait qu'une personne était née en 1847 alors qu'elle l'était en 1867. Des décalages de plusieurs décennies. Des liens familiaux fabriqués de bout en bout.

Le problème était simple : Claude avait accès aux *documents* (via le MCP Edison Papers) et aux *notes de recherche* (via le MCP Notion), mais pas aux données généalogiques elles-mêmes. Il inférait la structure familiale à partir de mentions fragmentaires dans des lettres et de mes notes incomplètes.

Il fallait lui donner accès à l'arbre lui-même — la véritable source de vérité sur qui est lié à qui, et quand ces personnes ont vécu.


# Première tentative : un MCP GEDCOM (local)

Mon arbre généalogique vit sur Geni — une plateforme généalogique collaborative visant à construire un arbre familial mondial unique. Geni dispose d'une API, mais l'OAuth échouait systématiquement quand je l'essayais, et j'avais besoin de quelque chose qui fonctionne *immédiatement*.

J'ai donc pris un raccourci. De temps à autre, j'exporte mes données depuis Geni au format GEDCOM (le format standard en généalogie), avec environ 25 000 individus dans mon export. J'ai utilisé le MCP GEDCOM d'airy10 pour le rendre interrogeable en local.

[https://github.com/airy10/GedcomMCP](https://github.com/airy10/GedcomMCP)

Ça fonctionnait. Claude pouvait désormais :

- Chercher des individus par nom
- Vérifier des liens de parenté (« X est-il lié à Y ? »)
- Contrôler les dates de naissance et de décès
- Retracer les chemins de filiation

Plus d'inventions familiales. Le GEDCOM devenait une **base d'hypothèses**, et les affirmations contenues dans les documents pouvaient être vérifiées contre la structure familiale connue.

> **Pourquoi Geni comme base de données principale ?**
>
> J'utilise Geni plutôt que de maintenir un arbre privé parce que la généalogie est une recherche collaborative. Plusieurs personnes contribuent des informations, les sources font l'objet d'une relecture par les pairs, les doublons sont fusionnés. Un arbre sur Geni est une base de connaissance *partagée*, non des données isolées qui risquent d'être dupliquées — et erronées — dans les fichiers de dizaines de chercheurs différents.

Mais l'approche GEDCOM avait ses limites :

- Elle ne fonctionne que dans Claude Desktop (MCP local)
- Elle exige de réexporter manuellement le GEDCOM à chaque mise à jour de l'arbre
- Elle n'est pas accessible depuis [claude.ai](http://claude.ai) en version web (ni depuis le téléphone)

Il me fallait la vraie API.


# Retour à Geni : résoudre l'OAuth

Je suis donc revenu à l'API Geni. Quelques heures d'itération supplémentaires avec Claude Code, et j'avais :

- Une implémentation OAuth complète (jetons d'accès, flux de rafraîchissement)
- 13 outils : CRUD de profils, recherche de chemins relationnels, détection de candidats à la fusion, parcours de l'arbre familial
- Recherche par nom, vérification de liens de parenté, reconstruction programmatique des lignes de filiation

[https://github.com/raphink/geni-mcp](https://github.com/raphink/geni-mcp)

Je pouvais désormais demander en pleine conversation : « Samuel Léon est-il lié à Élie Moïse Léon ? » et obtenir le chemin relationnel instantanément, que je sois dans Claude Desktop ou sur [claude.ai](http://claude.ai).

L'arbre devenait un **contexte interrogeable** accessible depuis n'importe où, non plus seulement sur ma machine locale avec un fichier GEDCOM à jour.


# Troisième serveur : le MCP journaux historiques

Edison Papers et Geni fonctionnant, je pouvais retracer les connexions commerciales et vérifier les liens familiaux. Mais il me manquait encore le contexte contemporain : comment le *public* percevait-il ces personnages ? Que disaient les journaux des opérations de la CCE ? Y avait-il des annonces, des nécrologies, des mentions mondaines ?

Les journaux historiques sont numérisés dans des dizaines d'archives nationales. Chacune a sa propre interface. Les chercher manuellement signifiait ouvrir plusieurs sites, lancer la même requête dans des systèmes différents, télécharger les résultats un par un.

J'ai donc construit un MCP journaux qui :

- Agrège plusieurs archives nationales de presse
- Effectue des recherches simultanées à travers les collections
- Retourne les extraits sous forme d'images encodées en base64 (la qualité de l'OCR variant d'une source à l'autre)

[https://github.com/raphink/newspapers-mcp](https://github.com/raphink/newspapers-mcp)

**Voici un exemple concret :**

J'ai demandé à Claude de chercher « Joseph Dreyfus grain Paris 1895 » (un négociant en grains de la famille qui avait connu une faillite). Le MCP a retrouvé l'annonce de liquidation concordataire dans des journaux commerciaux français. Cette seule recherche a conduit à la découverte d'un dossier de 90 pages aux Archives de Paris (D14U³/89) que j'analyse encore.

Une recherche. Dix minutes. Ce qui aurait représenté des journées de navigation dans des interfaces d'archives.


# Comment ils fonctionnent ensemble : retrouver Solomon Rau à Munich

Voici un exemple récent montrant comment les MCP s'articulent entre eux.

J'ai demandé à Claude de chercher l'activité de Solomon Rau dans les journaux munichois. Le MCP journaux a retourné plusieurs résultats, dont cette annonce :


![DDSG Announcement](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3ch2earn53443pwxiifw.png)


Cette annonce montrait Solomon Rau publiant le remboursement d'actions de la DDSG (Compagnie de navigation à vapeur du Danube) — une découverte qui :

- Révélait son activité professionnelle (négoce financier et boursier)
- Le reliait à la DDSG, une compagnie maritime majeure
- Fournissait une date et un lieu précis (Munich)
- Ouvrait la voie à de nouvelles découvertes sur l'activité d'autres membres de la famille

Claude a ensuite recoupé cette information avec l'arbre Geni pour vérifier l'identité de Solomon et ses liens de parenté, puis documenté la trouvaille dans Notion avec l'extrait de journal comme source.

Il a également établi un lien avec les actions DDSG qu'Adolphe Grünberg, le gendre de Solomon, détenait dans son inventaire après décès l'année suivante, en 1878, et a ajouté une note en conséquence.


Avez-vous vous-même construit des intégrations d'IA pour vos recherches ? Quelles ont été vos meilleures trouvailles ?
