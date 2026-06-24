---
template: post
lang: fr
title: "L'IA n'hallucine pas. C'est votre architecture qui hallucine."
date: "2026-06-15T08:30:00Z"
excerpt: "L'hallucination n'est pas un bug des LLM — c'est leur mécanisme même. Le vrai problème est une mauvaise allocation du non-déterminisme, et pourquoi « SKILLS.md suffit » est précisément le mauvais diagnostic."
translation: /posts/20260615-ai-doesnt-hallucinate-your-architecture-does-32pe
thumb_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0jn7tqw1rv0zxb25aq2g.png"
content_img_path: "https://media2.dev.to/dynamic/image/width=1000,height=420,fit=cover,gravity=auto,format=auto/https%3A%2F%2Fdev-to-uploads.s3.amazonaws.com%2Fuploads%2Farticles%2F0jn7tqw1rv0zxb25aq2g.png"
---
Tout le monde parle d'hallucination. C'est le mauvais diagnostic.

L'hallucination n'est pas un bug. C'est le mécanisme. Baissez suffisamment la température et le modèle cesse de confabuler — mais il cesse aussi d'être utile. Ce que l'on appelle hallucination, c'est ce que font les LLM quand leur créativité échoue dans un contexte qui appelait de la précision. Mais toute sortie de LLM est, d'une certaine façon, une hallucination : générée token par token, de manière probabiliste, sans vérité de référence — simplement avec assez de structure et de contraintes pour que le résultat soit la plupart du temps acceptable.

La créativité et la confabulation sont la même chose. Une température différente, un contexte différent, des contraintes différentes.

Ce qui signifie que « réduire l'hallucination » est le mauvais objectif. On ne peut pas la réduire sans amputer le modèle. Le bon objectif, c'est le routage : ne confier aux LLM que les problèmes où ce processus génératif et probabiliste est précisément ce dont on a besoin.

Utiliser un outil non déterministe là où un outil déterministe ferait le travail parfaitement — voilà ce qui brise les systèmes agentiques.

Un appel d'API déterministe coûte quelques microsecondes et une fraction de centime. Il est correct à 100 %, par définition. Un LLM accomplissant la même tâche est plus lent, plus coûteux, et introduit un taux d'échec qu'il faut désormais modéliser — non pas parce que le modèle est défaillant, mais parce qu'on a demandé à un moteur de créativité de se comporter comme une table de correspondance. Enchaînez trois de ces étapes et vous n'obtenez pas un taux d'échec de 10 % : vous obtenez 27 %. Cinq étapes et vous dépassez 40 %. Les erreurs sont difficiles à reproduire et encore plus difficiles à attribuer.

Je construis en ce moment un système agentique de recherche généalogique. Deux tâches, de natures radicalement différentes.

Récupérer des archives de journaux pour un nom donné et une plage de dates : déterministe. L'API retourne des résultats ou elle n'en retourne pas. Il n'y a aucun jugement à exercer, aucune ambiguïté à résoudre. Un LLM ici n'est qu'une façon coûteuse d'appeler curl — et une façon qui, par-dessus le marché, inventera occasionnellement des archives inexistantes, parce que c'est précisément ce qu'il fait.

Décider si la personne mentionnée dans cette archive de journal est la même que celle figurant dans le registre de naissance — compte tenu d'une orthographe différente du patronyme, d'un écart d'âge de deux ans, et d'une convention de prénom qui a changé à la frontière : LLM. C'est exactement le genre de corrélation mal définie entre des indices incertains où l'on *veut* un raisonnement probabiliste. L'hallucination, correctement contrainte, est ici la fonctionnalité.

C'est aussi pourquoi la vague actuelle du « on n'a plus besoin de MCP — SKILLS.md suffit » est précisément à rebours.

SKILLS.md est une couche de routage. Elle indique au LLM quel outil utiliser pour quelle classe de problème, orientant le jugement vers les problèmes genuinement difficiles plutôt que l'éliminant. C'est utile. Mais SKILLS.md reste du langage naturel traité par un modèle probabiliste. MCP donne au modèle de vrais outils déterministes : des API au comportement garanti, aux entrées typées, aux sorties fiables. Remplacer MCP par SKILLS.md ne simplifie pas votre architecture — cela substitue à un appel de fonction déterministe une description probabiliste de ce même appel. Vous avez conservé la complexité et supprimé la fiabilité.

La couche de routage est là où la plupart des architectures agentiques échouent en silence. Les ingénieurs se tournent vers le LLM parce que le prototypage est plus rapide, parce que cela évite de maintenir des services séparés, parce que décrire un outil en langage naturel paraît plus simple que de le construire. Ce qu'ils obtiennent en échange, c'est de l'entropie inutile à chaque étape, et des modes de défaillance qui ressemblent à des problèmes de modèle mais sont en réalité des problèmes d'architecture.

La question à poser à chaque étape de votre pipeline n'est pas « le LLM peut-il faire cela ». Il peut, après suffisamment d'essais. La question est : ce problème est-il réellement non déterministe ? Y a-t-il ici une ambiguïté genuine qui requiert un jugement ? Si ce n'est pas le cas — si une fonction pourrait retourner fiablement la bonne réponse —, vous avez confié à un moteur de créativité un travail qui n'a pas besoin de créativité. Et vous le paierez à chaque exécution.

La bonne nouvelle : les serveurs MCP sont assez faciles à construire. Avec des LLM.
