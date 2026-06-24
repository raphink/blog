---
template: post
lang: fr
title: "Quatre ans à courir après une eBee cohérente — et ce que j'ai construit le jour où j'ai fini par l'attraper"
date: "2026-06-23T08:10:00Z"
excerpt: "Quatre ans de génération d'images par IA, trois plateformes, une abeille cartoon obstinée, et le pipeline déclaratif que j'ai construit pour en finir avec la dérive."
translation: /posts/20260623-four-years-chasing-a-consistent-ebee-and-what-i-built-when-i-finally-caught-one-
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fm6bajk4hqkix8ssaegkz.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.us-east-2.amazonaws.com%2Fuploads%2Farticles%2Fm6bajk4hqkix8ssaegkz.png"
---
Ça fait quatre ans que j'essaie de générer une abeille cartoon cohérente avec de l'IA.

Pas n'importe quelle abeille. Une en particulier : eBee, la mascotte d'Isovalent. Tête noire et arrondie, grands yeux ovales sarcelle, ailes semi-transparentes, corps jaune et noir rayé. Simple en théorie. Étonnamment difficile en pratique.

Voici l'histoire de cette chasse — et de ce qu'elle m'a finalement amené à construire.

## Les années Midjourney (2021–2024)

J'ai commencé avec Midjourney v3 peu après son lancement. Les résultats étaient immédiatement intéressants, mais inexploitables : des masses floues vaguement abeille-adjacentes, sans aucun rapport avec le personnage que je cherchais.

![Midjourney v3 — abeilles autour d'un château de pierre](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/c1np24hmt8p41ikdmvn3.png)

V4 puis v5 ont marqué un saut qualitatif. Je commençais à obtenir des images réellement utilisables : des arrière-plans atmosphériques pour des présentations, des scènes dramatiques, une carte réseau Cilium que j'utilise encore aujourd'hui. Mais pour le travail de personnage — une eBee précise, reconnaissable, reproductible — les modèles rataient systématiquement leur cible. Trop photoréaliste. Trop générique. Trop *abeille* et pas assez *eBee*.

  ![Midjourney v5 — abeille mécanique steampunk](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/zf2e5olzkgmstlpgweqd.png)
  ![Midjourney v5 — abeille réaliste sur du matériel serveur](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/v3pskgikj18c7ynlx9go.png)
  ![Midjourney v5 — carte sur île flottante](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/d6j7z2loxma9uxbd0oz1.png)

V6 s'est approché du style recherché, et v6.1 encore davantage. Une abeille aquarelle en blouse de laboratoire. Une abeille astronaute en cartoon. Une abeille devant un cottage. Chacune charmante. Aucune tout à fait juste.

J'ai essayé les références de style, les tableaux de style, les références de personnage — les outils mêmes que Midjourney avait conçus pour ce type de problème. Aucun ne m'a donné la cohérence dont j'avais besoin d'une scène à l'autre.

  ![Midjourney v6.1 — abeille scientifique aquarelle](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/x1svqqy2s1qwjxcse3xq.png)
  ![Midjourney v6.1 — abeille astronaute en orbite](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/kazvqjdvok15xuj5p0ak.png)
  ![Midjourney v6.1 — abeille cartoon à la porte d'un cottage](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/8qpibnkpivum3q96ux9w.png)

Fin 2024, le meilleur que je pouvais produire, c'était une eBee alpiniste, une eBee aviatrice, une eBee de Noël. Reconnaissables comme le même personnage d'une scène à l'autre. Assez proches pour être utilisables. Mais nécessitant encore des retouches manuelles, avec toujours cette légère bizarrerie que je n'arrivais pas à chasser par le seul travail du prompt.

  ![Fin 2024 Midjourney — eBee alpiniste](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/d88nqa7nxdyai88l1r9v.png)
  ![Fin 2024 Midjourney — eBee aviatrice dans un biplan](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/kp59dgdcha7dy5sfh7js.png)
  ![Fin 2024 Midjourney — eBee de Noël sur un traîneau](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/xl4ncwttjm1wpk0szsfe.png)

## La percée (début 2025)

Puis OpenAI a sorti gpt-image-1, et du jour au lendemain, tout a changé.

Je lui ai fourni quelques images de référence, et il m'a rendu ça :

  ![gpt-image-1 — eBee baseball](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/pmtc0lr4gdgi4x5dx4wd.png)
  ![gpt-image-1 — eBee Starfleet](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/g4xp3imr0w5l5auz130m.png)
  ![gpt-image-1 — eBee basketball](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/n9ggia93wuv1zc05zlic.png)
  ![gpt-image-1 — eBee aviatrice avec avion jouet](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/j1h3pyk84g6aw00e67vg.png)
  ![gpt-image-1 — eBee samouraï](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/awvd142kk1pnc0cozuhu.png)

Le même personnage. Cinq costumes et scénarios entièrement différents. Indubitablement la même eBee.

L'écart restant était concret et fini : les eBees développaient occasionnellement une bouche, des abdomens apparaissaient là où ils n'auraient pas dû, quelques bizarreries anatomiques s'invitaient çà et là. Corrigeable dans GIMP en quelques minutes. Ma règle est simple : je ne publie pas quelque chose fait avec de l'IA générative que je ne publierais pas si je l'avais fait sans. Pas de mains à six doigts. Pas d'eBees avec une bouche. Si ça risque de faire tiquer un lecteur pour les mauvaises raisons, ça ne sort pas. Avec gpt-image-1, les corrections nécessaires pour atteindre ce seuil relevaient enfin d'une exigence raisonnable — et non plus d'un redessin complet.

J'ai rédigé un prompt détaillé de personnage que mes collègues pouvaient copier-coller dans ChatGPT. J'ai même créé un GPT personnalisé appelé eBee Creator. Mais il subsistait une étape manuelle dont personne ne pouvait s'affranchir : les images de référence devaient être jointes à la main, à chaque fois. La plateforme n'offrait aucun moyen de regrouper prompt et images en un seul bloc. Il fallait savoir où trouver les références et les attacher au fil de discussion — à chaque fois.

## Le problème des bandes dessinées

J'ai alors décidé de réaliser des bandes dessinées pour expliquer les concepts de réseau Kubernetes. Soixante-quatre cases, trois types de personnages, plusieurs scènes récurrentes.

La dérive a commencé immédiatement.

Les fils de discussion ChatGPT sont à la fois votre contexte et votre handicap. Plus un fil s'allonge, plus il dérive — davantage d'étoiles dans le ciel d'une page à l'autre, des personnages qui changent subtilement, des décors qui glissent. Il n'existe pas de remède chirurgical. On ne peut pas défaire la dérive sans perdre tout le contexte utile qui l'a précédée.

  ![de plus en plus d'étoiles](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/e8et5n7x4r5no33mrbfc.png)
  ![de plus en plus d'étoiles](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/gup3bjocub77zw68dpnb.png)
  ![de plus en plus d'étoiles](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/iayv25rn3cplb2zedlc4.png)
  ![de plus en plus d'étoiles](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/0m9kffl8sl3csw9i6obq.png)

Je me suis retrouvé avec une architecture multi-fils : un fil pour le scénario, des fils séparés pour chaque type de scène, avec des copier-coller manuels entre eux pour éviter la contamination croisée. Ça fonctionnait, mais c'était fragile. La moindre dérive dans un fil se propageait vers l'avant. Le seul remède était de tout recommencer à zéro en perdant l'intégralité du travail.

Lorsque j'ai résilié ChatGPT pour des raisons sans rapport, j'ai transposé le même flux de travail sur Microsoft Copilot. Résultats similaires, avec la frustration supplémentaire de fonctionnalités d'édition qui faisaient régulièrement disparaître des images dans le vide.

## Construire l'outil dont j'avais besoin

Quand gpt-image-2 est sorti, je voulais le tester. Copilot ne le proposait pas encore. Je l'ai donc déployé moi-même sur Azure AI Foundry et j'ai écrit la première version de panelgen en Python.

J'ai su immédiatement ce que ça devait être : déclaratif et idempotent. Chaque point de douleur accumulé sur quatre ans pointait vers la même cause profonde — il n'existait pas de source de vérité persistante. Le fil de discussion faisait le travail qu'un fichier de spécification aurait dû faire.

Et chose importante : panelgen n'est pas de l'IA. C'est de la colle déterministe — il lit une spec, construit un prompt, appelle l'API, et enregistre une sortie versionnée. Aucun modèle ne prend de décision en son sein. L'intelligence est dans la spec que vous écrivez ; la créativité est dans les prompts que vous concevez. panelgen s'assure simplement que les deux voyagent de façon fiable jusqu'à l'API à chaque génération, sans dérive.

Cela dit, rien n'empêche d'utiliser un LLM pour générer le YAML lui-même — je l'ai fait. La spec n'est que du texte. Écrivez-la à la main, générez-la, ou laissez un agent la produire panneau par panneau. panelgen s'en moque.

L'intuition était simple : remplacer la mémoire implicite du fil de discussion par une configuration explicite.

```yaml
characters:
  astronaut:
    description: "Astronaut eBee — white space suit, glass helmet, orange 'eBPF' badge"
    refs:
      - characters/astronaut-bee.png
  engineer:
    description: "Engineer eBee — hard yellow hat, safety jacket"

scenes:
  space-conversation:
    prompt_prefix: >
      Comic panel in outer space with deep purple/blue starry background.
      Two eBee characters facing each other. Square panel with rounded corners.
    characters: [astronaut, engineer]

panels:
  - page: 10
    scene: space-conversation
    prompt: >
      Engineer eBee pointing upward while explaining to astronaut eBee.
      Speech bubble: "You need to go through a Kubernetes Service!"
```

Les personnages sont définis une seule fois. Les images de référence voyagent avec la configuration. Les scènes ne se contaminent pas mutuellement. Le guide de style est automatiquement ajouté en tête de chaque prompt. Et surtout : rejouer une génération est sans risque. Chaque sortie est versionnée (`page_10_low-1.png`) ; les versions existantes sont ignorées à moins de demander explicitement un nouvel incrément.

![Scène générée](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/hhrclo00nnevlf7417k2.png)

Le problème de dérive disparaît parce qu'il n'y a plus de fil de discussion. Chaque génération repart de la même spec — et la configuration peut elle-même être versionnée.

## Au-delà de la bande dessinée

Une fois le flux de travail stabilisé, d'autres cas d'usage ont émergé naturellement.

Une démo de boutique en ligne eBee : des images de produits générées sous forme de panneaux, puis des photos de mise en situation montrant des eBees utilisant chaque produit — chaque panneau de mise en situation référençant l'image du produit correspondant, pour que ce dernier reste cohérent d'un plan à l'autre.

![eBee Shop : lampe](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/f6vvdhkqa5yy9mdqgn8h.png)

Des diagrammes cohérents pour des ateliers pratiques : la même abstraction scène/panneau fonctionne pour les illustrations techniques. On définit le style du diagramme comme une scène, on génère des variantes comme des panneaux. Un langage visuel uniforme sur l'ensemble d'une série d'ateliers, sans avoir à copier-coller les descriptions de style entre les prompts.

L'approche spec-first s'avère utile partout où l'on a besoin d'une série d'images partageant un ADN visuel commun — et pas seulement pour les bandes dessinées.

## La dimension agentique

Dès lors que la génération d'images est pilotée par un fichier YAML et un champ prompt, n'importe quelle étape en amont peut écrire dans ce champ — y compris un LLM. L'option `-prompt-file` existe précisément pour cela : un agent génère ou affine le prompt du panneau, l'écrit dans un fichier, et panelgen le consomme.

```bash
# L'agent écrit le prompt
echo "Astronaut eBee looking shocked. Pod is exploding." > prompt.txt

# panelgen le consomme
panelgen generate -prompt-file prompt.txt -scene space-solo output.png
```

Mieux encore, il peut désormais générer une configuration YAML complète avec plusieurs scènes et panneaux, la valider dans Git, et générer toutes les images à partir d'elle.

L'agent n'a pas besoin de connaître l'API Azure, le guide de style, ni les images de référence. Il écrit simplement un prompt. L'outil s'occupe du reste. C'est la composabilité Unix avec un LLM en amont — et c'est précisément pourquoi j'ai réécrit l'outil en Go : un binaire statique simple, sans dépendance à l'exécution, qui s'intègre dans n'importe quel pipeline sans gestion de dépendances.

J'approfondirai l'approche agentique pour la conception et l'illustration d'ateliers dans un prochain billet.

## panelgen

Panelgen est open-source et disponible sur GitHub :

[GitHub — raphink/panelgen](https://github.com/raphink/panelgen)

Vous pouvez l'installer via brew :

```bash
brew tap raphink/tap
brew install panelgen
```

Le format de configuration complet, les options de génération par lot, la génération parallèle et les modes d'utilisation agentique sont documentés dans le [dépôt GitHub](https://github.com/raphink/panelgen).

## Ce que quatre ans m'ont appris

Les modèles se sont améliorés — considérablement. Mais le goulot d'étranglement du flux de travail n'était pas le modèle. C'était l'absence de spec.

Chaque fois que je compensais manuellement la dérive, que je copiais des prompts entre des fils, que j'attachais des images de référence à la main, je suppléais par l'effort humain à ce qu'une configuration déclarative aurait dû faire automatiquement. L'outil que j'ai construit n'a rien de brillant. C'est simplement l'infrastructure manquante qui aurait dû exister dès le départ.

Si vous générez plus d'une poignée d'images avec un personnage ou un style cohérent, vous avez probablement besoin d'une spec, vous aussi.

Pour la génération d'images par IA, le fil de discussion n'est pas votre ami.
