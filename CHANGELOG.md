# Journal des modifications

## 1.39.1 · 26/11/2026 · Globe · Place pour l'heure de macOS, fond entier

- Avec « Place pour l'heure de macOS », le globe en plein écran descend et rapetisse pour tenir sous la place réservée, mais le ciel étoilé garde tout l'écran. Les points, les étiquettes et l'horloge du globe suivent.

## 1.39.0 · 26/11/2026 · Carte et globe · Place pour l'heure de macOS

- Options de la carte : « Place pour l'heure de macOS (plein écran) ». En plein écran seulement, le haut de l'écran (22 % de la hauteur) reste libre pour la grande heure que macOS affiche sur les économiseurs d'écran ; la carte ou le globe, et l'horloge du globe, se logent dessous. Hors plein écran, rien ne change.

## 1.38.0 · 26/11/2026 · Globe · Horloge en plein écran

- Globe en plein écran : une horloge de lieu (la même carte que sous la carte) peut s'afficher dans un coin. Options de la carte, ligne « Horloge (globe plein écran) » : le lieu (aucun par défaut) et le coin (↖ ↗ ↙ ↘). Elle reste quand les contrôles sont masqués ; un appui dessus ouvre le lieu.

## 1.37.0 · 26/11/2026 · Vues · Carte et globe séparés

- Quatre vues dans l'en-tête : ville, mosaïque, carte (nouvelle icône de carte pliée) et globe. Le choix carte ou globe disparaît des options de la carte. Sur téléphone, les boutons de la carte sont un peu plus petits pour tenir sur une ligne.
- Globe : les points des lieux ne passent plus par-dessus les étiquettes des autres lieux ; ils sont dessinés dans un calque à eux, sous toutes les étiquettes.

## 1.36.2 · 26/11/2026 · Carte · Plein écran sur toute la hauteur

- Carte plate en plein écran : elle prend toute la hauteur libre, avec plus de nord puis plus de sud (jusqu'à 85° N et 80° S) ; contrôles masqués, l'en-tête libère aussi sa place.
- Le menu des options de la carte passe au-dessus du liseré de la carte, qui le traversait.

## 1.36.1 · 26/11/2026 · App · Nouveau nom : Weather Hub

- L'app s'appelle Weather Hub partout : titre de la page, nom sous l'icône de l'écran d'accueil (manifeste et réglage iOS), bannière « Installer Weather Hub » dans Safari, en-tête du journal, fichier de sauvegarde (les sauvegardes d'avant restent lisibles), page de test. Une icône déjà posée sur l'écran d'accueil garde l'ancien nom jusqu'à ce qu'on la réinstalle.

## 1.36.0 · 26/11/2026 · Lieux · Tri rapide par vue

- Feuille Lieux, sous les onglets : « Trier par fuseau horaire » range les lieux de la vue choisie d'ouest en est (décalage horaire du moment, puis longitude), et deux boutons « Copier l'ordre » reprennent l'ordre de l'une des deux autres vues. Seule la vue de l'onglet change.

## 1.35.5 · 26/11/2026 · Vues · Masquer les boutons d'un appui partout

- Ville et mosaïque aussi : un appui ou un clic sur un endroit vide masque les boutons de l'en-tête (le nom du lieu ou le titre restent) ; l'appui suivant les remontre. Les éléments qui font déjà quelque chose gardent leur action : boutons, cartes de lieux, blocs qui ouvrent un détail, heure par heure, jours, points des lieux, mode édition.

## 1.35.4 · 26/11/2026 · En-tête · Plein écran avant les options

- Sur la carte et le globe, le bouton plein écran passe avant celui des options de la carte.

## 1.35.3 · 26/11/2026 · En-tête · Vues à gauche, réglages et lieux à droite

- Barre du haut réorganisée : à gauche, les trois vues (ville, mosaïque, carte) ; à droite, les réglages puis les lieux, précédés sur la carte et le globe des options de la carte et du plein écran. Même écart entre tous les boutons.

## 1.35.2 · 26/11/2026 · En-tête · Outils de la carte détachés des vues

- Sur la carte, même espace entre les deux outils de la carte (options, plein écran) et les trois boutons de vue qu'entre ces boutons et les réglages.

## 1.35.1 · 26/11/2026 · En-tête · Réglages détachés des vues

- Un peu plus d'espace entre les trois boutons de vue (ville, mosaïque, carte) et le bouton des réglages : environ le double de l'écart entre les autres boutons.

## 1.35.0 · 26/11/2026 · Lieux · Un ordre par vue

- Feuille Lieux : trois onglets, Villes, Mosaïque, Carte et globe. Chaque vue a son propre ordre des lieux, réglé en glissant les lignes par leur poignée ; changer l'un ne touche pas aux autres. La feuille s'ouvre sur l'onglet de la vue affichée. Tant qu'une vue n'a pas été réordonnée, elle suit l'ordre des villes. Étoile, corbeille et ajout valent pour toutes les vues.
- Le bouton de la mosaïque porte une icône de mosaïque (quatre tuiles) au lieu de trois lignes à puces, qui se lisaient comme une liste.

## 1.34.8 · 26/11/2026 · Affichage · Une seule couleur de bordure grise

- Toutes les bordures grises de l'app ont la même couleur, pleine (#3a4152, celle des étiquettes de la carte) : carte du monde, cartes de villes, étiquettes, boutons, panneaux, cadran, listes, menus. Avant, elles étaient plus ou moins transparentes selon l'élément, donc de teintes différentes. Les bordures de couleur (alertes) et celles des états (choisi, déplacé) ne changent pas.

## 1.34.7 · 26/11/2026 · Carte · Marge du haut sur ordinateur

- Sur ordinateur et dans un navigateur, la page gardait en haut une bande de 20 points prévue pour la barre d'état de l'iPad. Contrôles masqués, elle s'ajoutait à la marge du haut. Elle disparaît hors de l'app de l'écran d'accueil : la marge du haut est égale aux autres. Sur l'iPad (écran d'accueil), la marge part de sous la barre d'état.

## 1.34.6 · 26/11/2026 · Carte · Marge du haut égale aux autres

- La marge du haut se mesure maintenant jusqu'aux chiffres des heures, et plus jusqu'au haut de leur bande (les chiffres sont en bas de la bande, d'où une marge visible trop grande). Elle est égale aux marges de gauche, de droite et du bas, contrôles affichés ou masqués.

## 1.34.5 · 26/11/2026 · Carte · Coupée au détroit de Béring

- La carte plate est coupée au détroit de Béring (169° O) au lieu de 172,5° O : la pointe de la Russie (Tchoukotka) n'apparaît plus au bord gauche, toute l'Asie est à droite. La règle des heures suit la coupure : le fuseau UTC−11 est un peu coupé à gauche et son reste revient au bord droit.

## 1.34.4 · 26/11/2026 · Carte · Marges égales, toute la hauteur

- En paysage, une seule marge partout autour de la carte : à gauche, à droite, sous les boutons, entre la carte et les cartes de villes, et sous les cartes de villes (elle était plus grande en bas).
- Contrôles masqués : l'en-tête libère sa place, la carte monte jusqu'à une marge sous la barre d'état et prend toute la hauteur libre. La carte plate montre alors plus de nord (jusqu'à 84°) puis plus de sud (jusqu'à 72° S) ; le globe grandit.

## 1.34.3 · 26/11/2026 · Carte · Masquer les contrôles depuis n'importe quel endroit vide

- Page de la carte et du globe : un appui ou un clic sur n'importe quel endroit vide (la carte, l'en-tête entre les boutons, les marges, le bas de page) masque les contrôles ; le suivant les remontre. Les boutons, lieux, étiquettes et cartes de villes gardent leur action.

## 1.34.2 · 26/11/2026 · Carte · Masquer les contrôles d'un appui

- Carte et globe, en plein écran ou non : un appui (ou un clic) sur un endroit vide masque les boutons de l'en-tête, la pastille lecture/pause et les crédits ; l'appui suivant les remontre. Quitter la carte les remontre aussi.

## 1.34.1 · 26/11/2026 · Carte · Alignée sur les boutons

- En paysage, la carte, le globe et la rangée de cartes du bas commencent et finissent exactement au bord des boutons de l'en-tête. Quand la hauteur manque, la carte plate rogne un peu le sud (au plus jusqu'à 45° S, sous l'Australie et Tahiti) au lieu de se rétrécir.

## 1.34.0 · 26/11/2026 · Globe · Vrai plein écran

- Globe en plein écran : il occupe maintenant tout l'écran, en-tête compris. Les boutons restent à leur place, par-dessus.
- Dans ce plein écran, un appui sur un endroit vide (ni lieu, ni étiquette, ni bouton) masque tous les contrôles ; l'appui suivant les remontre. Faire tourner le globe ne les masque pas.

## 1.33.4 · 26/11/2026 · Réglages · Clignotement, halo et couleur des points

- Les trois réglages des points de la carte (clignotement, halo, couleur) quittent les options de la carte et rejoignent les Réglages, sous le curseur de taille des points.

## 1.33.3 · 26/11/2026 · Ciel · Retour au ciel de la 1.32.8

- Le ciel et la lune reprennent exactement le code de la 1.32.8 (étoiles, soleil, lune, gouttes, éclair, flash allégés). Les 1.32.9 et 1.33.1 les avaient modifiés à tort : le carré dans un cercle venait de la pastille de couleur des options de la carte, corrigée en 1.33.2. Le curseur de taille des points reste.

## 1.33.2 · 26/11/2026 · Carte · Pastille « couleur selon la température » sans carré

- Options de la carte : la pastille multicolore (couleur des points selon la température) montrait un carré dans un cercle. Son dégradé s'arrêtait avant la bordure et se répétait dessous ; il couvre maintenant toute la pastille.

## 1.33.1 · 26/11/2026 · Ciel · Retour au ciel de la 1.32.7

- Depuis la 1.32.8, un bouton rond de l'en-tête s'affichait sur l'iPad avec un carré de couleurs arc-en-ciel à l'intérieur (photos de Matt du 26/11). La 1.32.9 avait visé la lune, à tort. Le ciel reprend exactement le code de la 1.32.7 : étoiles, soleil, lune, gouttes, éclair et flash comme avant la 1.32.8. Le curseur de taille des points de la carte (1.33.0) reste.

## 1.33.0 · 26/11/2026 · Carte · Taille des points réglable

- Réglages : nouveau curseur « Taille des points de la carte », de 0,4 à 3 fois la taille actuelle (de 5 à 36 points sur l'iPad au lieu de 12). L'anneau qui clignote et le halo de nuit suivent. Le réglage est propre à chaque appareil : il ne part pas dans la sauvegarde et n'est pas remplacé par un import. Sans réglage, rien ne change.

## 1.32.9 · 26/11/2026 · Ciel · Halo de la lune et du soleil rétabli

- La 1.32.8 peignait le halo de la lune et du soleil dans la couche de l'astre : sur l'iPad (iOS 12), il s'affichait en carré de couleurs arc-en-ciel. Le halo reprend sa forme de la 1.32.7 (peint au quart de sa taille, agrandi par la carte graphique dans sa propre couche). Les autres allègements de la 1.32.8 (étoiles, gouttes, éclair, flash) restent.

## 1.32.8 · 26/11/2026 · Ciel · Moins de travail pour la carte graphique, par tous les temps

- Prévention, à image égale : relevé de tout le ciel (18 scènes, de jour et de nuit) pour retirer ce que la carte graphique et la page faisaient sans que cela se voie. Aucun de ces points n'est une cause prouvée de gel, et la charge de la carte graphique de l'iPad ne se mesure pas à distance.
- Étoiles : leur transparence est réglée image par image, comme la brume depuis la 1.32.7, et plus sur le calque qui contient les deux images. Dès qu'il y a des nuages la nuit (bruine, pluie, neige, couvert, brouillard), la carte graphique devait composer ces deux images plein écran à part à chaque image, avant de les fondre dans le ciel. Même ciel : les deux images n'ont aucun point commun (calculé sur leurs 153 088 points) ; l'opacité des 28 étoiles qui clignotent est arrondie à 0,5 % près, soit moins de 1 sur 255.
- Soleil et lune : halo et disque sont peints dans une seule couche, au lieu d'un halo agrandi quatre fois par la carte graphique plus un disque. Dès que l'astre était voilé par des nuages, les deux couches étaient composées à part à chaque image. Même dégradé, même taille à l'écran (écart calculé : moins de 1 sur 255) ; environ 3 Mo de mémoire en plus pour les deux.
- Pluie et bruine : quand le vent ou la lumière changent, les gouttes en place sont retouchées par paquets de 60, comme à leur création, et seulement si leur teinte change ou si la pointe du trait se déplace d'au moins un quart de point. Avant, le moindre écart de vent faisait redessiner toutes les gouttes dans la même tâche (147 en bruine, jusqu'à 266 sous l'orage). La pente de la chute, elle, reste exacte et immédiate.
- Éclair : sa lueur est calculée sur le cadre de l'éclair (environ 7 % de l'écran) et plus sur tout l'écran. Même trait, même lueur.
- Flash d'orage : son calque, plein écran et invisible, sort de l'affichage hors orage et grêle. Au journal, « sky layers » compte donc une couche de moins par tous les temps : la bruine de nuit se lit 9, et plus 10.

## 1.32.7 · 25/11/2026 · Ciel · Brume plus légère à composer

- La transparence de la brume (bruine, brouillard) est maintenant portée par chacune de ses deux nappes et non plus par le calque qui les contient. Un calque transparent contenant deux couches animées oblige la carte graphique à les composer à part à chaque image, puis à fondre le résultat : une passe plein écran de plus, en continu. Or tous les gels relevés depuis la 1.32.4 ont eu lieu dans le ciel de bruine, le seul qui ajoute cette brume aux gouttes (nuit du 24 au 25/11 en 1.32.6 : trois arrêts de 7 à 10 s pendant que Safari redessinait l'écran). Essai sur la piste la plus probable, sans mesure possible de la carte graphique à distance. Même brume, mêmes mouvements : écart calculé d'au plus 3 sur 255 là où les deux nappes se recouvrent. Les gouttes ne changent pas : les regrouper en grandes nappes transparentes aurait ajouté plusieurs couches plein écran à composer, donc de la charge.

## 1.32.6 · 24/11/2026 · Ciel · Plus aucun canevas

- Pluie, bruine, neige, grêle, éclairs et étoiles ne sont plus dessinés dans des canevas. Relevé du 23/11 sur l'iPad pendant un gel : pour afficher un canevas, Safari 12 attend que la carte graphique ait fini de le dessiner, et quand elle tarde toute la page s'arrête. Depuis le retrait des canevas des nuages (1.32.4), les gels n'arrivaient plus que sous la pluie, dernier canevas redessiné trente fois par seconde (24/11 : 20 gels sous la bruine, aucun en dix heures de temps sec). Chaque goutte, flocon ou grêlon est maintenant un petit élément que la carte graphique déplace seule : la page n'a plus rien à dessiner à chaque image. Rendu égal : même nombre, mêmes longueurs, épaisseurs, couleurs et vitesses, même pente selon le vent, même balancement des flocons, mêmes étoiles aux mêmes places.

## 1.32.5 · 24/11/2026 · Journal · Dernières étapes avant un gel

- Après un gel, le journal ajoute une ligne « steps » sous la ligne FROZEN : les dernières étapes de l'app avant l'arrêt (ciel, rendu, nuages, pluie, enregistrements), leur durée, le délai entre leur fin et l'arrêt, ce qu'elles ont changé à l'écran (fond, couches montrées ou retirées, nuages repeints, pluie), l'étape en cours si l'arrêt tombe au milieu d'une étape, et les premières à la reprise. Les repères restent en mémoire : rien de plus n'est écrit dans l'iPad tant que tout va bien. Aucun changement d'affichage ni de rythme.

## 1.32.4 · 23/11/2026 · Ciel · Nuages sans attente de la carte graphique

- Les nuages sont maintenant des images calculées par l'app, et plus des canevas à dégradés. Relevé du 23/11 sur l'iPad pendant un gel : Safari 12 fait dessiner ces dégradés par la carte graphique et bloque toute la page tant qu'elle n'a pas fini, de quelques secondes à plusieurs dizaines de minutes. Rendu identique (écart mesuré : 4 sur 255 au pire), animations inchangées.
- Pluie, neige et grêle couvrent toute la largeur en paysage : le ciel prend sa taille de la mise en page, et se recale dans la minute si iOS 12 change la taille de l'écran sans prévenir (ligne « sky size » au journal).

## 1.32.3 · 23/11/2026 · Réglages · Tags à largeur fixe

- Sélecteurs à tags (réglages, démonstration, calibration, carte) : le tag choisi garde exactement sa largeur. Son gras l'élargissait et faisait passer les tags suivants à la ligne selon le choix ; le gras est maintenant rendu sans changer la place du texte.

## 1.32.2 · 22/11/2026 · Lieu · Mise à jour sur place

- Quand la météo du lieu affiché arrive (un quart d'heure) ou que l'heure change, l'écran n'est plus remplacé en entier : seuls les textes et valeurs qui ont changé sont réécrits, le reste est gardé tel quel. Le remplacement complet précédait tous les gels du journal de l'iPad du 22/11 (18:56, 19:27, 19:58, 20:28, 20:59, 21:00) et le blocage de l'affichage de 21:29.
- Journal : chaque construction de l'écran d'un lieu est notée, avec son type (move, full ou update avec le nombre de changements) et sa durée.

## 1.32.1 · 20/11/2026 · Lieu · Alertes à la taille du résumé

- Les alertes prennent la taille du résumé (texte, pictogramme, marges, coins) ; résumé, alertes et Conditions sont espacés pareil.

## 1.32.0 · 20/11/2026

- Bannière « Installer Station Météo » dans Safari (la même que dans les autres apps) : la marche à suivre pour l'ajouter à l'écran d'accueil.

## 1.31.5 · 19/11/2026

- Barre d'état colorée comme le haut du ciel sur tout iOS récent, iPad compris (elle restait noire sur un iPad sous iOS 27). La règle ne dépend plus de la taille de l'écran mais de la version d'iOS : seul iOS 12 et avant (l'iPad mini de la station) garde la barre translucide et la hauteur de l'écran. Sur un iPad récent, l'icône doit être refaite une fois (réglage figé par iOS à l'ajout).
- Limite mesurée au simulateur d'iPad (iOS 27, app installée) : iOS y fixe la couleur de la barre au lancement de l'app et ne la change plus ensuite, ni en changeant de lieu ni en tournant l'iPad. La barre prend donc le ciel du lieu affiché au lancement. Sur iPhone, elle suit en direct.

## 1.31.4 · 19/11/2026

- Téléphone, app installée : le bas de l'écran était coupé (boutons « Forcer la mise à jour » et « Diagnostic » sous la barre d'accueil, fin des feuilles et des listes). Depuis la barre d'état opaque (1.31), la page commence sous la barre, mais l'app prenait encore la hauteur totale de l'écran : elle dépassait d'autant en bas. Sur téléphone, elle prend maintenant la hauteur réelle de la page ; l'iPad (barre translucide) garde la hauteur de l'écran.
- Marge de bas au-dessus de la barre d'accueil d'iOS pour tout ce qui défile : feuilles, écran d'un lieu, liste, cartes de la vue carte.
- Barre d'état : la bande de 2 px de la 1.31.3 est retirée. Mesuré au simulateur iOS 27 : iOS l'ignore et prend la couleur du fond de body (fixe), que l'app règle déjà. Reste ouvert : avec une feuille ouverte (Réglages, Lieux…), la barre garde la couleur du ciel ; aucun réglage essayé au simulateur ne la fait changer.

## 1.31.3 · 19/11/2026

- Téléphone, barre d'état : la couleur n'était pas appliquée. Mesuré au simulateur iOS 27 avec une page d'essai : iOS teinte la barre avec la couleur unie d'un élément fixe collé en haut de la page, sinon avec le fond de body, et seulement en dernier avec celui de html (le seul que les 1.31.1 et 1.31.2 réglaient). L'app pose maintenant une fine bande fixe en haut, à la couleur du haut du ciel, et règle aussi body ; la barre suit en direct les changements de lieu et de vue.
- Vérifié au simulateur iOS 27, dans Safari (8 scènes, écart de 1 sur 255 entre la barre et le ciel) puis en app installée sur l'écran d'accueil : Lisbonne de jour, barre #4373b3, ciel #4373b2 ; liste et nuit sans cassure.

## 1.31.2 · 19/11/2026

- Téléphone, barre d'état : couleur mesurée sur le rendu réel. 64 scènes capturées (nuit, aube, lever, matin, midi, soir, coucher, crépuscule × clair, voilé, nuageux, couvert, brouillard, pluie, neige, orage) et comparées à la couleur donnée à la barre. Ciels clairs, voilés et nuageux : exacts. Couvert, brouillard, pluie, neige, orage : la 1.31.1 oubliait le voile nuageux du haut de l'écran (écart jusqu'à 21 sur 255) ; il est maintenant compté, écart de 3 sur 255 au plus. Liste, carte et feuilles : couleur de leur fond réel.

## 1.31.1 · 19/11/2026

- Téléphone, barre d'état : en 1.31.0 elle restait bleu nuit (#0b1226, le fond de la page) au lieu de la couleur du ciel. iOS 26 et suivants teintent la barre avec le fond de la page et ignorent la couleur indiquée à part. Le fond de la page prend maintenant la couleur mesurée du haut du ciel (ou de la liste, de la carte, d'une feuille), dès la première image grâce à la dernière couleur connue. Pas besoin de refaire l'icône.

## 1.31.0 · 19/11/2026

- Téléphone : la barre d'état n'est plus une bande noire. Elle reste opaque (pas de flou), mais prend la couleur de ce qui est juste dessous : le haut du ciel en vue d'un lieu (elle suit les changements de ciel et de lieu), le fond de la liste ou de la carte, le fond d'une feuille ouverte, et elle s'assombrit avec le voile de nuit. Réglage figé par iOS à l'ajout de l'icône : supprimer l'icône du téléphone, recharger le site dans Safari jusqu'à voir 1.31.0 dans les Réglages, puis la rajouter.
- iPad : barre d'état translucide comme à l'origine (iOS 12 ne sait pas colorer une barre opaque). Rien ne change pour une icône déjà installée.

## 1.30.8 · 19/11/2026

- Version de test, sans autre changement : première mise à jour qui passe par le nouveau mécanisme (rechargement sans effacement), pour vérifier sur l'iPad qu'elle ne gèle plus. Le journal doit montrer « update: reloading, nothing cleared », puis un démarrage normal.

## 1.30.7 · 19/11/2026

- Mise à jour sans effacement : l'app recharge simplement la page, qu'elle se mette à jour seule ou par le bouton. Jusqu'ici elle effaçait d'abord ses fichiers en réserve et désinscrivait son service worker. Sur l'iPad (iOS 12), la page repartait alors gelée dès la première seconde, par blocs d'une à deux minutes pendant cinq à six minutes : toucher, boutons et défilement morts, seules les animations continuaient (journal de l'iPad du 19/11 : FROZEN 64 s, 89 s puis 126 s juste après le forçage). Cause exacte dans iOS non établie. La page vient déjà du réseau à chaque ouverture et le nouveau service worker remplace l'ancien cache de lui-même : l'effacement n'était plus nécessaire depuis la 1.5.0. Le passage de la 1.30.6 à cette version utilise encore l'ancien mécanisme une dernière fois.

## 1.30.6 · 19/11/2026

- Fermer une feuille (Réglages, Lieux, Diagnostic, Calibration) sans rien changer ne reconstruit plus la vue ni le ciel : l'iPad se figeait 2 s à chaque fermeture (défaut ancien, déjà présent en 1.28.2). La vue et le ciel ne sont reconstruits que si un réglage, un lieu ou la démo a changé ; une météo arrivée entre-temps est affichée sans toucher au ciel. Le journal note chaque fermeture (« sheet closed · settings · unchanged · 0 ms »).

## 1.30.5 · 18/11/2026

- Réglages, « Forcer la mise à jour » : le bouton n'est actif que si une autre version est en ligne. Il est grisé pendant la vérification, hors connexion et quand l'app est à jour ; le texte au-dessus dit l'état (« Recherche de la version en ligne… », « C'est la dernière version. », « Version x disponible. »). Le code refuse aussi le forçage dans ces cas, même sans passer par le bouton. La mise à jour automatique au démarrage ne change pas.
- Limite voulue : le bouton ne peut plus « réparer » une app à jour dont les fichiers en réserve seraient abîmés.

## 1.30.4 · 18/11/2026

- Téléphone, Détails : les blocs Bien-être et « Pourquoi cette note » prennent vraiment toute la largeur (la règle ne visait que le mode édition) ; la pastille du libellé ne déborde plus sur le bloc voisin. La boussole du vent tient dans son bloc à toutes les largeurs, lettres à 13 px à l'écran. Bloc Lune : plus de débordement sur un iPhone de 375 px.

## 1.30.3 · 18/11/2026

- Téléphone, écran d'un lieu : en faisant défiler, le contenu n'est plus coupé net contre les points des lieux. Un espace sous les points, puis un fondu en haut de la zone qui défile.

## 1.30.2 · 18/11/2026

- Téléphone en portrait, vue de la carte : un message en haut, « Tournez le téléphone pour afficher la carte. »

## 1.30.1 · 18/11/2026

- Téléphone en portrait : la carte du monde (et le globe) n'est plus affichée, trop petite pour servir. La vue garde les cartes des lieux (horloges ou météo), une par ligne sur toute la largeur, et ses réglages ; le bouton plein écran est masqué. La carte revient en tournant le téléphone. Le globe ne tourne pas pendant qu'il est masqué.

## 1.30.0 · 18/11/2026

Téléphone : toutes les tailles revues (plan de la session de conception). Rien ne change sur l'iPad : les nouvelles règles ne s'appliquent que si le plus petit côté de l'écran fait moins de 500 px (classe `phone`).

- Taille de base fixe de 16 px sur téléphone, au lieu de 11 px (l'app était un iPad réduit à 69 %). Chaque taille de texte de l'iPad a sa version téléphone, rangée dans l'échelle d'iOS : 17 px pour le texte courant, 15 px pour le secondaire, 13 px pour les légendes. Plus aucun texte sous 13 px, sauf les unités dans un dessin (« km/h » de la boussole, chiffres des horloges, 11 px).
- Zones tactiles de 44 px au moins : boutons de l'en-tête, choix Conditions / Précipitations / Vent, « Modifier », boutons et choix des feuilles, lignes de la feuille des lieux, curseurs (pouce de 28 px), pastilles de couleur de la carte.
- En-tête sur deux lignes en portrait : les boutons en haut, le nom du lieu dessous sur toute la largeur. Les points des lieux ne sont plus touchables (on change de lieu en glissant). Espace sous les points avant l'horloge.
- 10 jours : jour, pictogramme, probabilité, min, barre, max ; les millimètres restent dans le détail du jour.
- Détails : deux colonnes ; Bien-être et « Pourquoi cette note » sur toute la largeur ; boussole agrandie.
- Feuilles (Lieux, Réglages, Diagnostic, Calibration du ressenti) en plein écran. Calibration : seule la note reste collée en haut, le détail des critères défile avec la feuille.
- Mode liste : une carte par ligne en portrait, deux en paysage, à leur hauteur naturelle.
- Carte du monde : une heure sur deux dans la bande des fuseaux, crédit des images retiré de la carte (il reste dans les Réglages, À propos), panneau des réglages de la carte sur la largeur de l'écran.
- Paysage sur téléphone : en-tête sur une ligne, contenu sur une seule colonne centrée qui défile (le cadran ne tient pas en deux colonnes sur 393 px de haut).
- Zoom à deux doigts rendu possible sur téléphone ; toujours bloqué sur l'iPad.
- Calibration (iPad aussi) : les noms des cas types passent à la ligne au lieu de déborder sur les notes.

## 1.29.5 · 18/11/2026

- Haut de la web app flou sous iOS 27 : la barre d'état était déclarée translucide (`black-translucent`), la page passait dessous et iOS la floutait (même cause que Travel Hub 2.32.4). Barre d'état opaque noire (`black`). iOS fige ce réglage à l'ajout de l'icône : supprimer l'icône, recharger le site dans Safari jusqu'à voir 1.29.5 dans les Réglages, puis la rajouter à l'écran d'accueil.

## 1.29.4 · 18/11/2026

- Écran d'un lieu en paysage : la colonne de droite descend nettement plus (marge du haut doublée), loin des points des lieux.

## 1.29.3 · 18/11/2026

- Écran d'un lieu en paysage : la colonne de droite descend un peu, elle ne touche plus les points des lieux.

## 1.29.2 · 18/11/2026

- Bouton de la vue d'un lieu : une carte (rectangle aux coins légèrement arrondis) à la place du soleil, en paysage, ou en portrait quand l'iPad est en portrait.

## 1.29.1 · 18/11/2026

- Bien-être : la note affichée est celle au soleil. De jour, quand l'ombre fait gagner un demi-point ou plus, une ligne « À l'ombre » donne la note à l'ombre et son libellé. C'est rare : il faut un soleil fort (UV élevé) ou une forte chaleur.

## 1.29.0 · 18/11/2026

- Indice de bien-être : nouvelle formule, sans palier. Chaque critère est noté de façon continue, une petite variation de la météo ne fait plus sauter la note. Froid humide moins bien noté que froid sec, chaleur sèche limitée au-dessus de 28 °C d'air, une gêne forte limite la note à elle seule (air mauvais, pluie fine), quatre plafonds de danger (orage, grêle, verglas, brouillard dense). Pluie ou bruine annoncée par le code météo sans quantité mesurée : note de pluie de 7 au plus.
- Réglages, rubrique « Bien-être » : feuille « Calibration du ressenti », ouverte comme le Diagnostic. La note du lieu affiché (ou d'un cas type, ou d'une situation réglée aux curseurs), au soleil et à l'ombre, avec le détail de chaque critère, reste en haut ; dessous, toutes les valeurs de la formule, appliquées partout dans l'app au lâcher du curseur, « Revenir aux valeurs proposées », « Copier », et les 30 cas types recalculés en direct. Les valeurs réglées font partie de la sauvegarde.

## 1.28.2 · 18/11/2026

- Cadran d'un lieu : la pastille de bien-être montre le libellé et la note ensemble (« Correct 5,4 »), fixe. L'alternance entre la note et le libellé et ses trois réglages (intervalle, effet, durée) sont supprimés.

## 1.28.1 · 18/11/2026

- Réglages de la pastille de bien-être du cadran : effet du passage entre la note et le libellé (apparaître comme avant, vers le haut, vers le bas) et durée du passage, de 0 à 2 s par pas de 0,1 s (0,5 s par défaut). Les deux réglages n'apparaissent que si l'alternance est active.

## 1.28.0 · 18/11/2026

- Cadran d'un lieu : la pastille de bien-être alterne en boucle entre la note (« Comfort 6,9 ») et son libellé (« Correct »), avec un fondu, sans changer de taille. Fondu joué par la carte graphique, sans minuterie.
- Réglages : intervalle de l'alternance, 3, 5 (par défaut), 10 ou 20 s, ou « Note seule ». Animations coupées : la note seule.

## 1.27.2 · 18/11/2026

- Cadran d'un lieu : la note de bien-être en pastille colorée sur la ligne du ressenti (« Feels like 19° · Comfort 6,9 »), sans icône et sans agrandir le cadran.

## 1.27.1 · 18/11/2026

- Écran d'un lieu : nouveau bloc « Pourquoi cette note », à côté du bloc « Bien-être », comme sur la maquette : chaque critère noté sur 10 avec sa jauge (température, humidité, pluie et neige, ciel, vent, UV, air ; vert bon, orange moyen, rouge mauvais). Le bloc « Bien-être » prend une seule colonne et garde la note, le libellé, la jauge, la base thermique et les retraits.

## 1.27.0 · 18/11/2026

Indice de bien-être, d'après le document de conception validé par Matt (`docs-conception/indice-bien-etre.md`).

- Note de bien-être sur 10 pour chaque lieu, calculée pour l'instant présent avec les données déjà reçues (aucune requête de plus). Base : le confort thermique d'après la température ressentie, 10 de 22 à 27 °C. Chaque gêne retire ensuite une part : pluie et neige jusqu'à 60 %, vent 40 %, qualité de l'air 40 %, ciel 20 %, moiteur 10 %, UV 10 %. Un danger (orage, grêle, tempête, canicule, air très pollué, brouillard dense…) plafonne la note. Six libellés, d'Idéal à Extrême.
- Écran d'un lieu : nouveau bloc « Bien-être » en tête des détails, avec la note, son libellé, une jauge, la base thermique et ce que chaque gêne retire, et le plafond s'il y en a un. Il se déplace ou se masque en mode édition comme les autres blocs.
- Mode liste : la note de chaque lieu en pastille colorée devant le temps qu'il fait.
- Calcul vérifié sur les 20 cas du document : mêmes notes.

## 1.26.0 · 18/11/2026

Demande de Matt.

- Réglages, nouvelle rubrique « Sauvegarde » : Exporter montre en plein écran le texte de la sauvegarde, à copier (ou à télécharger en fichier sur un ordinateur) ; Importer offre une zone où le coller, puis Appliquer remplace, après confirmation, les lieux et réglages de l'appareil et recharge l'app.
- Contenu : lieux et leur ordre, lieu de démarrage, réglages, blocs de détails, dernière vue, réglages de la carte et du globe (style, vue, cartes du bas, plein écran, rotation, points), étiquettes placées à la main. Laissé de côté : la météo en mémoire, le journal et la taille de la carte propre à l'appareil.

## 1.25.2 · 18/11/2026

Demande de Matt.

- Écran d'un lieu : toucher « Mis à jour à … » relance tout de suite la météo du lieu affiché. « Chargement… » s'affiche pendant la requête, puis la nouvelle heure (ou « Météo injoignable, nouvel essai » en cas d'échec). Une requête manuelle toutes les 10 s au plus ; la zone à toucher déborde un peu du texte. Si le service n'a rien de plus récent, les chiffres restent les mêmes et seule l'heure avance.

## 1.25.1 · 17/11/2026

- Mode liste, en paysage : les cartes sont plus hautes et occupent toute la hauteur de l'écran en 5 rangées (4 × 5 pour 20 lieux), sans vide en bas. Jamais plus de 5 cartes par colonne : au-delà de 20 lieux, une colonne de plus.

## 1.25.0 · 17/11/2026

Demande de Matt : la carte doit s'afficher aussitôt au clic, préparée pendant que l'app est au repos en vue ville ou liste.

- Carte préparée au repos : quand la ville ou la liste est affichée et que personne n'a touché l'écran depuis 8 s, les fonds de la carte sont dessinés en avance, à la taille où elle s'affichera, en petites étapes (jamais pendant un geste ou une transition). À l'ouverture, ils sont réutilisés. Refait seulement si le style, l'orientation ou le plein écran changent.
- Une seule construction à l'ouverture : la carte n'est plus dessinée d'abord à une taille provisoire puis à la bonne.
- Rafraîchissement de fond : au repos, un lieu dont la météo a plus d'un quart d'heure est rechargé toutes les 20 s, pour que carte et liste soient à jour à l'ouverture.
- Journal : une ligne « map prewarm … » quand la préparation se fait (durée totale, nombre d'étapes).
- Non préparé : la vue Globe, qui reconstruit encore ses textures à l'ouverture.

## 1.24.5 · 17/11/2026

Signalé par Matt : passer de la ville à la carte reste lent, même deux fois de suite. Le journal de l'iPad montrait 4,6 à 4,8 s de construction à chaque ouverture, sans requête en cours.

- Carte du monde : les fonds de jour et de nuit (images satellite ou tracé des terres) sont gardés d'une ouverture à l'autre et ne sont redessinés que si le style, la taille ou la projection changent. Coût : deux jeux de fonds gardés (la carte est dimensionnée deux fois à chaque ouverture), environ 14 Mo sur l'iPad.
- Journal : la ligne d'ouverture de la carte dit si les fonds ont été redessinés (avec leur durée) ou réutilisés.

## 1.24.4 · 17/11/2026

- Icône de sortie du plein écran : exactement le dessin de l'icône d'entrée (mêmes traits, même taille), pointes retournées vers le centre. Elle était dessinée autrement.

## 1.24.3 · 17/11/2026

- Carte en plein écran : le bouton de l'en-tête montre des flèches vers l'intérieur (sortir du plein écran) ; hors plein écran, des flèches vers l'extérieur comme avant.

## 1.24.2 · 17/11/2026

- Carte et globe : les étiquettes des villes sont opaques (même teinte bleu nuit, sans transparence) ; la carte ne se voit plus au travers.

## 1.24.1 · 17/11/2026

- Carte du monde : la première carte sous la carte est alignée au bord gauche de la carte (elle était décalée de quelques points vers la droite), la dernière au bord droit.

## 1.24.0 · 17/11/2026

- Lieux : Bordeaux retiré, Anchorage (Alaska) ajouté en première position (le plus à l'ouest). Appliqué une fois aux listes déjà enregistrées, sans changer l'ordre des autres lieux.

## 1.23.11 · 17/11/2026

- Carte et globe : la taille des points des lieux suit la largeur de la carte (1,2 %, soit 12 points sur l'iPad en paysage), entre 6 et 14 points, au lieu d'une taille fixe.

## 1.23.10 · 17/11/2026

- Feuille des lieux : le champ « Rechercher une ville » suit la même échelle que le reste de l'app. Il était en taille fixe et paraissait énorme sur un écran plus petit que l'iPad. Sur l'iPad, il ne change pas.

## 1.23.9 · 17/11/2026

- Feuille des lieux : le nombre de lieux est affiché à côté du titre, et suit les ajouts et les retraits.

## 1.23.8 · 17/11/2026

- En-tête : trois boutons, un par vue (ville, liste de tous les lieux, carte du monde). Celui de la vue affichée est allumé ; toucher un bouton ouvre sa vue, sans aller-retour. Avant, la liste et la carte se refermaient en touchant de nouveau leur bouton, et la ville n'avait pas le sien.

## 1.23.7 · 17/11/2026

Signalé par Matt : en mode carte + météo, certaines cartes avaient une ligne colorée en haut (New York).

- Cartes météo sous la carte du monde : le dégradé du ciel ne se répète plus sous la bordure. La bordure haute laissait voir le bas du dégradé (l'orange d'un coucher de soleil), comme une ligne colorée.

## 1.23.6 · 17/11/2026

Signalé par Matt : coins de la carte mal faits, liseré manquant ou invisible.

- Carte du monde : le contenu (carte, points) est découpé aux coins arrondis, et le liseré est dessiné à l'intérieur, par-dessus, sur tout le tour. Avant, le liseré était à l'extérieur et le canevas débordait en angles droits aux coins sur l'iPad.

## 1.23.5 · 17/11/2026

Signalé par Matt : les lieux étaient décalés selon que la carte s'affichait en normal ou en plein écran.

- Carte du monde : en passant au plein écran (qui montre plus de nord depuis la 1.23.0) ou en en sortant, les points des lieux sont replacés selon la nouvelle projection. Ils gardaient leur hauteur d'avant et ne tombaient plus sur leur ville.

## 1.23.4 · 17/11/2026

- Options de la carte : bouton « Halo » pour afficher ou non la lueur orangée autour des lieux où il fait nuit (carte et globe). Affiché par défaut, comme avant.

## 1.23.3 · 17/11/2026

- Options de la carte : les pastilles de couleur des points sont rondes (elles étaient étirées en ovales dans le panneau d'options).

## 1.23.2 · 17/11/2026

- Carte et globe : les points des lieux font 12 points de diamètre, quelle que soit la taille de l'écran (environ 13 avant sur l'iPad en paysage).

## 1.23.1 · 17/11/2026

Signalé par Matt : après quelques minutes sur une ville, toucher le globe mettait plusieurs secondes à afficher la carte du monde.

- Carte du monde et liste : elles sont peintes d'abord avec les données en mémoire, puis les lieux dont la météo a plus d'un quart d'heure se rafraîchissent un par un, avec une pause après chaque requête. Avant, jusqu'à 17 lieux étaient rechargés d'un coup au moment même de l'ouverture, et la carte était redessinée dès la première réponse.
- Journal : à l'ouverture de la carte ou de la liste, une ligne donne le temps de construction, le délai jusqu'à l'affichage et le nombre de lieux à rafraîchir.

## 1.23.0 · 17/11/2026

- Carte et globe, points des lieux : deux nouveaux réglages dans le panneau d'options de la carte. Le clignotement (l'onde autour du point) peut être coupé ; la couleur se choisit parmi la couleur de la température (comme avant) et sept couleurs fixes. Le contour blanc des points est supprimé ; l'onde prend la couleur du point.
- Carte en plein écran : elle montre davantage le nord (jusqu'à 84° N au lieu de 75° N) en prenant la hauteur libre ; le sud et la largeur ne changent pas, les étiquettes placées à la main restent à la même distance de leur point. Hors plein écran, rien ne change.
- Cartes sous la carte du monde : le bas des lettres à jambage (g, p, y, comme dans « Bogota » ou « Aigre ») n'est plus coupé.

## 1.22.7 · 17/11/2026

D'après l'essai « ?passive=1 » de la 1.22.6, validé par Matt sur l'iPad (« le scroll est beaucoup plus responsif, il lag beaucoup moins »).

- Touchers : tous les écouteurs tactiles sont passifs, sauf là où il faut empêcher la page de défiler, et seulement là : les poignées de la feuille des lieux, les blocs en mode édition (pendant l'édition seulement), la carte du monde. Avant, plusieurs écouteurs posés sur toute la page obligeaient Safari à attendre la page à chaque toucher, jusqu'à une seconde sans redessiner l'écran.
- Le réglage d'essai « ?passive=1 » est retiré.

## 1.22.6 · 17/11/2026

- Réglage d'essai, sans effet par défaut : avec « ?passive=1 » dans l'adresse, tous les écouteurs tactiles deviennent passifs, pour mesurer sur l'iPad si l'attente de Safari à chaque toucher (jusqu'à une seconde, sans image) explique les changements de lieu encore lents. Le journal note l'essai.

## 1.22.5 · 17/11/2026

Suite de la 1.22.4, accord de Matt sur le correctif du ciel.

- Après un changement de lieu, le ciel change par morceaux, une petite tâche chacun : fond, puis soleil, lune et étoiles, puis nuages, puis brouillard, relief et pluie. D'un bloc, il occupait la page une demi-seconde. Le ciel final est le même.
- Nuages en trop : cachés et arrêtés au lieu d'être retirés de l'affichage, ce qui détruisait puis recréait leur couche à chaque passage d'un ciel nuageux à un ciel clair. Leur teinte n'est toujours repeinte que si elle change.

## 1.22.4 · 17/11/2026

Trouvé par mesure sur l'iPad : les changements de lieu lents l'étaient quand le ciel change beaucoup (Lisbonne la nuit vers New York le jour : 0,8 à 1,8 s à chaque fois, le retour restant rapide).

- Le nouvel écran est construit d'abord, le ciel du lieu d'arrivée change ensuite, une fois l'entrée de l'écran jouée. Les deux tombaient dans la même image : 300 ms pour l'écran plus 500 ms pour passer d'un ciel de nuit à un ciel de jour (étoiles, soleil, nuages).
- La teinte des cartes du lieu d'arrivée est posée avant la construction de son écran ; l'écran qui s'en va garde la sienne pendant sa sortie. Ni l'un ni l'autre n'est repeint en cours de route.

## 1.22.3 · 17/11/2026

D'après les mesures du mode liste sur l'iPad.

- Fond de l'app (et ceux du mode liste et de la carte du monde) : porté par la page elle-même et non plus par le conteneur de l'app, qui recevait sinon une couche plein écran de 10,9 Mo en double (même défaut que celui corrigé en 1.21.1).
- Mode liste : la mise à jour de chaque minute ne reconstruit plus toute la liste (275 ms de blocage mesurés) ; seuls le ciel des cartes et les valeurs qui ont changé sont réécrits.

## 1.22.2 · 17/11/2026

Signalé par Matt sur l'iPad : au glissement, l'écran se fige parfois après un demi-centimètre puis repart.

- Cause mesurée sur l'iPad : chaque fois que l'opacité de l'écran d'un lieu quittait exactement la valeur 1 (début du glissement au doigt, début de la sortie), Safari 12 bloquait la page 170 à 260 ms. L'écran est maintenant au repos à une opacité de 0,999, invisible à l'œil, et n'y revient jamais à 1. Mesuré par simulation sur l'iPad : glissement 171 → 23 ms, sortie 254 → 32 ms au pire.

## 1.22.1 · 17/11/2026

- Blocs de détails : plus de vide à droite de la dernière ligne (la Qualité de l'air laissait une place vide à côté d'elle). Si la dernière ligne n'est pas pleine, son dernier bloc s'élargit jusqu'au bord ; recalculé à chaque mise en page, en paysage, en portrait et en mode édition.

## 1.22.0 · 17/11/2026

- Nouveau mode liste : un bouton dans l'en-tête (icône de liste) affiche tous les lieux en cartes, comme la liste de Météo sur iPhone. Chaque carte porte le ciel du moment au lieu concerné, le nom, l'heure locale (avec « Demain » ou « Hier » si le jour diffère), le temps qu'il fait, la température, le maximum et le minimum du jour. Toucher une carte ouvre le lieu ; le lieu affiché en dernier est entouré.
- Le nombre de colonnes suit le nombre de lieux pour que tout tienne à l'écran quand c'est possible (20 lieux en paysage : 4 colonnes de 5). Le mode est retenu d'une ouverture à l'autre, comme la carte du monde.

## 1.21.7 · 17/11/2026

Signalé par Matt sur l'iPad : la plupart des changements de lieu sont rapides, mais certains mettent jusqu'à une seconde et demie. Le journal montre qu'ils arrivent quand deux glissements s'enchaînent à 1 à 4 secondes d'écart.

- Tant qu'un doigt glisse ou qu'un écran sort ou entre, tout le travail différé de l'écran en place attend : suite des heures, jours restants, détails, teinte des nuages, chargement des lieux voisins, vidage de l'ancien écran, et nouveau rendu à l'arrivée de données. Avant, ce travail pouvait tomber au milieu du geste suivant et le retarder.

## 1.21.6 · 17/11/2026

Signalé par Matt sur l'iPad après la 1.21.5 : le suivi du doigt est bon, mais au lâcher l'écran repasse un instant au centre avant de sortir.

- Sortie au lâcher : elle part maintenant de la position exacte où le doigt a laissé l'écran. Sa cible était en pourcentage alors que la position du doigt est en pixels ; Safari 12 ne sait pas passer de l'un à l'autre et repartait de zéro, c'est-à-dire du centre. La cible est en pixels, et l'état de départ est fixé avant de la poser.
- La classe d'animation d'entrée est retirée une fois l'entrée jouée, au lieu de rester sur l'écran au repos.

## 1.21.5 · 17/11/2026

Signalé par Matt sur l'iPad : au premier mouvement du doigt pour changer de lieu, les deux colonnes disparaissaient (il ne restait que le ciel et l'en-tête), puis réapparaissaient au lâcher.

- Cause, isolée par essais sur l'iPad : depuis la 1.21.4, la colonne de gauche avait sa propre couche. Safari 12 n'affiche plus les deux colonnes quand leur écran bouge ou devient translucide alors que l'une a une couche et que l'autre défile. La couche revient sur l'écran entier, comme en 1.21.3 (5 Mo de plus, essai validé à l'écran).

## 1.21.4 · 17/11/2026

D'après les mesures en paysage de la 1.21.2 (sous la pluie : 264 Mo ramenés à 163 Mo, 99,5 Mo de couches ramenés à 45,5 Mo).

- Écran d'un lieu en paysage : la couche permanente est celle de la colonne de gauche seule ; l'écran entier n'a plus de couche à lui (10 Mo à moitié vides). Le déplacer pendant un changement de lieu ne demande toujours aucune repeinte.
- Halos du soleil et de la lune : couches au quart de la taille, agrandies par la carte graphique (le soleil coûtait 2,6 Mo même presque invisible sous la pluie).
- Réglage d'essai, sans effet par défaut : SM.sky.setFxScale(0.5) dessine la pluie deux fois moins fin, pour mesurer sur l'iPad ce que sa finesse coûte en mémoire avant de décider.

## 1.21.3 · 17/11/2026

D'après la mesure sur l'iPad de 20 rafraîchissements d'une même ville : la mémoire montait de 2,3 Mo à chaque rafraîchissement, jusqu'à 46 Mo d'avance.

- Mémoire : un écran remplacé (rafraîchissement toutes les 15 min, changement de lieu, passage à la carte) est maintenant vidé tout de suite. Avant, il restait entier en mémoire tant que le code gardait une référence sur un de ses nœuds, ce que Safari ne lâche qu'à son ramasse-miettes suivant, parfois vingt rendus plus tard. Même traitement pour l'ancienne bande d'heures, et pour les points et les cartes de la carte du monde à chaque rafraîchissement.
- Carte du monde reconstruite alors qu'elle est affichée : l'ancien canevas et ses calques sont rendus tout de suite.

## 1.21.2 · 17/11/2026

D'après les mesures en paysage sur l'iPad : 264 Mo et 48 couches sous la pluie, contre 118 Mo par ciel clair.

- Mémoire des couches du ciel : la mémoire d'une couche suit sa taille affichée, pas celle de son canevas (mesuré : un nuage de 320 × 160 px affiché en 580 × 290 coûtait 2,7 Mo au lieu de 0,2 ; les deux canevas d'étoiles 8,7 Mo chacun ; la pluie 11 Mo). Chaque canevas a maintenant une couche à sa taille exacte en pixels d'écran, agrandie par la carte graphique : nuages (dans leur animation), étoiles, pluie. Même image à l'écran, puisqu'elle était déjà agrandie.
- Brouillard (aussi affiché par temps de bruine) : ses deux couches animées sont au quart de la taille et agrandies quatre fois dans leur animation (environ 24 Mo de moins).
- Changement de lieu : la pluie garde son image pendant que le nouvel écran se construit, et reprend quand il entre ; les deux lieux voisins se préchargent 3,5 s après l'arrivée au lieu de 2,5 s.

## 1.21.1 · 17/11/2026

D'après la deuxième série de mesures sur l'iPad (40 changements de ville enchaînés).

- Mémoire : une couche plein écran de 11 Mo en moins. body, en position fixe, peignait lui-même un fond et le dessin partagé des icônes, ce qui lui donnait une couche en double de la racine ; le fond est maintenant porté par html seul et le dessin des icônes vit dans #app (essai fait en direct sur l'iPad : la couche tombe à 0).
- Changement de lieu : le premier temps ne construit plus que ce qu'on voit à l'arrivée, soit 336 éléments au lieu de 820 (8 heures en paysage ou 11 en portrait, 4 jours) ; la suite arrive par tranches (heures, puis jours restants, puis détails, à 250 ms d'écart) au lieu d'un seul bloc de 180 à 200 ms.
- Pas de fuite mémoire : sur deux tours des 20 lieux, la mémoire plafonne dès la fin du premier tour (mesuré).

## 1.21.0 · 17/11/2026

D'après les mesures prises sur l'iPad (retour de Matt : l'animation de changement de ville commence, se fige une demi-seconde à une seconde, puis l'autre ville apparaît).

- Changement de lieu en trois temps : l'écran actuel s'en va tout de suite (glissement et fondu de 0,22 s faits par la carte graphique, fluides même pendant que la page travaille) ; le nouvel écran est construit, posé et peint, presque invisible ; il n'entre qu'une fois prêt. Avant, tout était construit au lâcher du doigt, l'ancien écran figé à mi-course.
- Les données météo qui arrivent pendant le changement n'interrompent plus l'animation : le rafraîchissement attend sa fin.
- La suite de l'écran (heures 13 à 48, détails) est construite après l'entrée, plus pendant.
- Plus de règle universelle sur ::before et ::after : elle faisait calculer deux pseudo-éléments pour chacun des 1 700 éléments à chaque construction d'écran (plus de 10 000 créés et détruits en quelques changements de ville, mesuré sur l'iPad). Seuls les pseudo-éléments réellement utilisés la reçoivent.
- Le ciel est réglé avant la construction de l'écran : la teinte des cartes n'est plus calculée deux fois.
- La teinte des nuages se repeint après le changement de lieu, un nuage à la fois.
- Journal : la ligne « show » donne l'attente avant construction, le ciel, l'écran et le délai jusqu'à l'affichage.

## 1.20.2 · 17/11/2026

- Diagnostic à distance : le rapport (état de l'appareil et journal) est aussi rangé dans le cache du site (« sm-diag / diag-report »), 10 s après l'ouverture, toutes les 5 min et quelques secondes après un gel. L'outil de diagnostic branché en USB peut le lire à travers le service worker, sans copie à la main. Rien ne sort de l'appareil.
- Journal : chaque point de situation donne aussi le nombre de canevas et leur surface totale, et le nombre de couches du ciel et de nuages montrés.

## 1.20.1 · 17/11/2026

- Journal : la ligne « FROZEN » dit maintenant si l'iPad lui-même dormait ou si seule la page était arrêtée (comparaison de l'heure murale et de l'horloge monotone, qui s'arrête quand l'appareil dort), et note si la page avait le focus et le réseau.
- Après un gel de plus d'une minute, l'heure, le voile de nuit et la météo repartent tout de suite ; pendant trois minutes, la requête météo n'attend que 7 s et réessaie 4 s plus tard (avant : 20 s d'attente puis 30 s, d'où « hors connexion » pendant près d'une minute au réveil).

## 1.20.0 · 17/11/2026

Passe complète sur la rapidité, sans toucher à l'apparence ni aux animations.

- Changement de lieu : les nuages ne sont plus recréés (13 canevas et leurs règles d'animation créés une fois par taille d'écran, puis seulement réglés : nombre, hauteur, vitesse, sens) ; la feuille de style n'est plus réécrite (cela faisait recalculer le style de toute la page) ; l'écran d'un lieu garde sa propre couche (plus de repeinte entière au début du glissement ni à la fin de l'animation d'arrivée) ; les détails sont construits au second temps, avec les heures 13 à 48 ; une seule mise en page forcée au lieu de deux.
- Ciel : les couches invisibles sortent de l'affichage après leur fondu (brouillard et ses deux animations permanentes, étoiles et leur scintillement, voile nuageux, soleil, lune, canevas de pluie) ; le dégradé du ciel et le voile nuageux sont peints au quart de la taille puis agrandis par la carte graphique (seize fois moins à peindre, environ 25 Mo de moins) ; même ciel qu'au dernier passage (la nuit, pendant des heures) : ni repeinte ni fondu toutes les 30 s ; teinte des nuages repeinte par pas, plus à chaque changement infime du crépuscule.
- Cartes et cadran : leur teinte ne change plus que par pas de 0,01 (chaque changement faisait repeindre toutes les cartes) ; la ligne « Mis à jour à » n'est réécrite que si elle change ; sans les secondes, l'horloge ne travaille qu'une fois par minute.
- Démarrage et réseau : seuls les deux lieux voisins se chargent en arrière-plan (avant : les 20 lieux, soit 40 requêtes pendant qu'on se servait de l'app) ; les autres se chargent en les approchant, ou tous à l'ouverture de la carte du monde.
- Carte du monde : un rafraîchissement au plus toutes les 1,5 s pendant le chargement des lieux (avant : un par lieu) ; entre deux minutes, plus aucun calcul si aucune horloge n'est à l'écran (avant : l'heure des 20 lieux recalculée chaque seconde) ; premier placement des étiquettes 2,5 fois plus court.
- Globe : les points et leurs étiquettes sont déplacés par la carte graphique (avant : 30 mises en page par seconde) ; anticrénelage inutile retiré ; si l'appareil ne tient pas 18 images par seconde, le globe est dessiné moins fin pour rester fluide.
- Les données d'un lieu rendu sur l'écran ne déclenchent plus de second remplissage inutile de la carte horaire.

## 1.19.1 · 17/11/2026

- Changement de lieu allégé : la carte horaire ne construit d'abord que 12 heures au lieu de 48 (840 éléments à l'écran au lieu de 1 900), le reste arrive une seconde plus tard, sans toucher au défilement en cours.
- Journal : chaque changement de lieu est chronométré (calcul de l'écran, ciel, délai jusqu'à l'affichage réel), pour mesurer la lenteur sur l'iPad lui-même.

## 1.19.0 · 17/11/2026

- Vrai journal : gardé 7 jours (4 000 lignes au plus), ouvert en plein écran depuis Diagnostic, avec Copier (tout le journal et l'état de l'appareil dans le presse-papiers), Vider et Fermer ; avertissements en jaune, erreurs en rouge.
- Le journal note maintenant chaque météo reçue ou ratée avec sa durée, la page masquée, montrée, mise en veille ou réveillée par le système, le réseau qui tombe ou revient, le voile de nuit, les changements de lieu et de vue, les recherches de mise à jour, le premier toucher après un long silence, un point de situation par heure, et tout gel de plus de 6 s avec son heure de début et sa durée.

## 1.18.3 · 17/11/2026

- Mémoire : les images des nuages sont rendues tout de suite quand le ciel les recrée (à chaque changement de vent, donc à peu près à chaque rafraîchissement). Piste du blocage nocturne de l'iPad, pas encore prouvée.
- « Hors connexion » ne s'affiche plus que si l'appareil est vraiment hors ligne ; une requête météo ratée affiche « Météo injoignable, nouvel essai ».

## 1.18.2 · 17/11/2026

- Diagnostic : boîte noire pour les blocages. Toutes les 30 s l'app note qu'elle vit (heure, écran affiché, dernière météo reçue) ; au démarrage suivant, si elle s'était arrêtée sans fermeture propre, le journal donne l'heure de l'arrêt et ce qui était affiché. Un blocage de plus de 6 s à l'écran est noté avec sa durée.

## 1.18.1 · 17/11/2026

- Globe : toutes les étiquettes restent affichées (avant, celles qui en recouvraient une autre disparaissaient), et elles se placent à la main comme sur la carte : on les glisse, Maj cale le trait à 45°, la place est retenue par ville, en proportion du rayon du globe, et l'étiquette tourne avec son point. Reposée sur son point, elle revient à droite de lui.

## 1.18.0 · 17/11/2026

- Globe : lecture / pause de la rotation, comme sur la carte de Travel Hub. Pastille en bas à gauche du globe, avec les boutons lecture et pause (celui actif en blanc) ; à la souris, la vitesse 0,5×, 1×, 1,5× ou 2× se déplie au survol. Choix retenus d'une ouverture à l'autre.
- Globe : la rotation ne s'arrête que pendant qu'on le tient, et reprend dès qu'on le lâche (avant : 20 s plus tard).

## 1.17.0 · 17/11/2026

- Lieux : ordre réglé par glisser-déposer. Chaque lieu a une poignée ≡ à droite ; on l'attrape au doigt ou à la souris, la ligne suit, les autres s'écartent, et la liste défile quand on approche du haut ou du bas. Les boutons monter et descendre sont retirés.

## 1.16.4 · 17/11/2026

- Carte en plein écran : centrée sur l'écran entier (145 px au-dessus, 144 px au-dessous sur l'iPad en paysage) au lieu de l'espace sous l'en-tête, qui la faisait paraître trop basse.

## 1.16.3 · 17/11/2026

- Carte en plein écran : les boutons de l'en-tête restent (lieux, réglages de la carte, plein écran en blanc quand il est actif, globe, réglages) ; seules les cartes de villes disparaissent. Le bouton de sortie posé sur la carte est retiré, le bouton de l'en-tête suffit.
- Le plein écran est retenu d'une ouverture de l'app à l'autre.

## 1.16.1 · 17/11/2026

- Carte en plein écran : plus de débord ni de glisser de côté. La carte entière s'adapte à l'écran, bord à bord en largeur, centrée en hauteur ; le reste reste vide.

## 1.16.0 · 17/11/2026

- Carte du monde en plein écran : un bouton dans l'en-tête masque l'en-tête et les cartes de villes ; il reste la règle des fuseaux, la carte et un bouton de sortie posé dessus. La carte prend toute la hauteur de l'écran (sur l'iPad en paysage, 1625 × 722 au lieu de 992 × 441) et se fait glisser de côté ; elle s'ouvre centrée sur le lieu affiché.

## 1.15.1 · 17/11/2026

- Carte du monde : les sélecteurs (style, carte ou globe, horloges ou météo) passent dans un panneau qui s'ouvre et se ferme par un bouton à curseurs dans l'en-tête, posé sur la carte sans lui prendre de place. Il se referme en touchant ailleurs.

## 1.15.0 · 17/11/2026

- Carte du monde : plus de titre « Carte du monde » ; les sélecteurs (style, carte ou globe, horloges ou météo) prennent sa place dans l'en-tête, en plus petit. La carte gagne la hauteur de la rangée de sélecteurs qui était sous elle. En portrait, ils tiennent sur deux lignes.

## 1.14.1 · 17/11/2026

- Réglages : « Intensité » devient « Assombrissement de l’écran la nuit », réglé par un curseur sur toute la largeur, « Plus clair » à gauche, « Plus sombre » à droite (de 20 % à 85 % par pas de 5 %), au lieu de trois boutons 35, 55 et 70 %.

## 1.14.0 · 17/11/2026

- Réglages, voile de nuit : « De » et « À » prennent le champ d'heure de Travel Hub (TimePickerField). Un bouton à horloge ouvre deux colonnes, heures puis minutes, chacune centrée sur la valeur choisie, et « Maintenant ». Choisir l'heure garde les minutes ; choisir les minutes referme. Le voile se règle donc à la minute (23:45 par exemple) ; les horaires enregistrés en heures entières restent valables.

## 1.13.6 · 17/11/2026

- Réglages : listes déroulantes avec un chevron dessiné par l'app, à distance du bord (celui du système collait à la bordure) ; « De » et « À » du voile de nuit côte à côte au lieu de se partager toute la largeur.

## 1.13.5 · 17/11/2026

- Carte du monde, glisser des étiquettes : plus aucun nouveau placement ni reconstruction de la carte tant qu'une étiquette est tenue (données qui arrivent, fenêtre redimensionnée, retour sur l'onglet) ; le trait suit toujours l'étiquette tenue ; position et taille relues au début de chaque geste.

## 1.13.4 · 17/11/2026

- Carte du monde, glisser des étiquettes : le glisser s'arrête net au relâchement (avant, l'étiquette restait accrochée au curseur 0,4 s, et un nouveau glisser commencé dans ce délai était coupé en route) ; l'arrivée de données météo pendant un glisser ne reconstruit plus l'étiquette sous le curseur ; bouton relâché hors de la fenêtre, le glisser se termine.

## 1.13.3 · 17/11/2026

- Globe : les étiquettes ne sautent plus d'un côté à l'autre. Comme sur la carte des trajets de Travel Hub, chacune reste collée à droite de son point et tourne avec lui ; quand deux se recouvrent, la seconde s'efface (son point reste) au lieu de se déplacer. Plus de traits de rappel sur le globe.

## 1.13.2 · 17/11/2026

- Carte du monde : aucune étiquette ne bouge plus d'elle-même. Seule celle que l'on glisse change de place, même si elle en chevauche une autre ou si des traits se croisent.

## 1.13.1 · 17/11/2026

- Carte du monde : déplacer une étiquette ne bouscule plus les autres. Chaque étiquette placée automatiquement garde sa place ; seule celle que l'étiquette déplacée vient gêner se replace. Un rafraîchissement des données ne déplace plus rien non plus.

## 1.13.0 · 17/11/2026

- Carte du monde : les étiquettes de villes se placent à la main. On glisse une étiquette (doigt ou souris) où l'on veut, le trait de rappel suit ; avec Maj enfoncée, le trait se cale à 0°, 45°, 90°… Position retenue par ville et par orientation (paysage, portrait), en proportion de la carte. Reposée sur son point, l'étiquette repasse au placement automatique, qui s'arrange autour des étiquettes placées à la main. Un glisser n'ouvre pas la ville.
- La carte ne peut plus bloquer l'app si son code ne démarre pas : retour aux prévisions avec un message, au lieu de relancer le chargement sans fin.

## 1.12.0 · 17/11/2026

- Carte du monde : nouveau placement des étiquettes de villes. Elles se posent tout autour de leur point, à droite comme à gauche, au-dessus ou au-dessous, plus loin avec un trait de rappel quand la place manque. Jamais l'une sur l'autre, au moins 10 px entre deux étiquettes, jamais sur un point de ville ; les traits évitent de se croiser et de traverser une étiquette, sauf s'il n'y a pas d'autre place.
- Étiquettes de la carte 10 % plus petites (textes, icônes, marges), et encore un peu plus en portrait où la carte est moitié moins haute.
- Globe en rotation : placement rapide des étiquettes pendant le mouvement, placement complet à l'arrêt, pour ne pas ralentir le vieil iPad.

## 1.11.1 · 17/11/2026

- Températures négatives : le signe moins déborde à gauche comme le ° à droite. Le nombre reste centré et le ° ne frôle plus le cercle du cadran.

## 1.11.0 · 17/11/2026

- Singapour et Tokyo rejoignent les lieux d'origine, à leur place d'ouest en est. Sur un appareil déjà installé, ils s'ajoutent une fois à la liste enregistrée.

## 1.10.2 · 17/11/2026

- Températures centrées sur leurs chiffres, le ° en débord à droite, dans le cadran et sur la courbe heure par heure. Avant, le cadran poussait le nombre vers la droite et les étiquettes de la courbe comptaient le ° dans leur centrage.

## 1.10.1 · 17/11/2026

- Un rechargement de l'app (mise à jour, rechargement de 4 h, rechargement manuel) garde le lieu affiché. Seule une vraie ouverture revient au lieu de démarrage, s'il est défini.

## 1.10.0 · 17/11/2026

- 15 lieux d'origine en plus, rangés d'ouest en est : Tahiti, Bogota, New York, Lisbonne, Marrakech, Dublin, Bordeaux, Aigre, Barcelone, Paris, Istanbul, Moscou, Ahvaz, Dubaï, Pattaya, Tiksi, Vladivostok, Sydney. Sur un appareil déjà installé, ils s'ajoutent une fois aux lieux enregistrés et toute la liste est rangée d'ouest en est.

## 1.9.0 · 17/11/2026

Allègement pour le vieil iPad, sans toucher aux animations.

- Réseau : les fichiers de l'app en cache ne sont plus redemandés au réseau à chaque ouverture (25 requêtes et 420 Ko d'images de la Terre en moins par lancement). Les images de la Terre sont reprises de l'ancien cache lors d'une mise à jour.
- Démarrage : la carte du monde (contours, frontières, globe, 155 Ko de code) ne se charge qu'à sa première ouverture. Le code lu au démarrage passe de 300 Ko à 144 Ko.
- Météo : on ne demande plus à Open-Meteo que les grandeurs affichées (3 colonnes horaires et 6 autres valeurs en moins) ; les données rangées par lieu passent de 47 Ko à 39 Ko, écrites une fois par rafraîchissement au lieu de deux. Rafraîchissement toutes les 15 min au lieu de 10, le rythme auquel Open-Meteo renouvelle ses valeurs.
- Tâches répétées : l'heure et la date ne sont réécrites que lorsqu'elles changent (avant : trois réécritures par seconde, donc un recalcul de l'affichage chaque seconde) ; le voile de nuit ne vérifie plus toutes les 2 s, il programme un seul réveil.
- Mémoire de la carte : les canevas sont rendus dès qu'on quitte la carte ou qu'on change de style ; les deux textures du globe (8 Mo chacune) sont rendues après envoi à la carte graphique ; le globe ne crée plus de tableaux à chaque image.

## 1.8.1 · 17/11/2026

- Points de la courbe des températures : la courbe se recale aussi après une rotation, un changement de taille de fenêtre et le chargement des polices, au sous-pixel près. Avant, elle gardait la position du premier affichage.

## 1.8.0 · 17/11/2026

- Conditions, Précipitations, Vent refait d'après Météo d'Apple sur iOS 27 : sélecteur à trois icônes (nuage, goutte, vent), titre et sous-titre selon le mode. Le cadran ne change pas, comme chez Apple.
- Précipitations : une colonne par heure remplie selon l'intensité (pointillés aux seuils modéré et fort), risque de pluie sous la ligne. Vent : vitesse en chiffres, courbe commune dessous avec les rafales en aplat.
- 10 jours selon le mode : pluie heure par heure de chaque jour avec millimètres et risque ; vent en petite courbe avec la plage de vitesse.
- Les points de la courbe des températures sont exactement sur la courbe (ils étaient décalés de quelques pixels).

## 1.7.0 · 17/11/2026

- Heure par heure : choix d'affichage Conditions, Précipitations ou Vent, comme l'app Météo d'Apple. Conditions : la courbe des températures (comme avant). Précipitations : barres de pluie par heure, probabilité et millimètres. Vent : courbe de la vitesse colorée selon la force, direction et rafales. Le choix est gardé et vaut aussi pour les heures d'un jour ouvert dans les 10 jours.

## 1.6.0 · 16/11/2026

- Détails modifiables, comme les tableaux de bord du Socle : bouton Modifier (ou appui long sur un bloc), les blocs tremblent, « − » pour en retirer, « + » sous la grille pour les remettre, glisser au doigt ou à la souris pour les réordonner. Terminé pour sortir. L'ordre et les blocs retirés sont gardés, pour tous les lieux.
- Voile de nuit : il ne tombe qu'après 30 s sans aucune activité (souris, doigt, clavier, molette) ; bouger la souris le lève aussitôt.

## 1.5.2 · 16/11/2026

- Voile de nuit : il ne tombe qu'après 30 s sans aucune activité (souris, doigt, clavier, molette). Bouger la souris ou toucher l'écran le lève aussitôt.

## 1.5.1 · 16/11/2026

- Lune et Qualité de l'air côte à côte sur la même ligne, en paysage comme en portrait. Sans données d'air, la Lune reprend toute la largeur.

## 1.5.0 · 16/11/2026

- Mises à jour : la page se charge d'abord depuis le réseau, le cache ne sert plus qu'hors connexion. Avant, le service worker servait l'ancienne page, qui pointait vers les anciens fichiers.
- À l'ouverture et au retour sur l'app (au plus toutes les 30 min), l'app compare sa version à celle en ligne et se met à jour seule si elle est en retard.
- Réglages, À propos : version en ligne affichée, et bouton « Forcer la mise à jour », qui efface le service worker et les caches puis recharge.

## 1.4.2 · 16/11/2026

- iPad tenu en portrait : l'app se croyait parfois en paysage (iOS 12 garde les dimensions d'avant la rotation). L'orientation vient maintenant de l'appareil. C'était la cause du cadran qui débordait derrière les cartes et hors de l'écran.
- La page descend jusqu'en bas de l'écran : iOS 12 retirait 20 points sous la barre d'état translucide.
- Tableau des 10 jours : quand sa colonne est étroite, il passe en version resserrée (sans la colonne du vent) au lieu de déborder à droite.
- En paysage, le cadran se réduit si sa colonne est trop étroite pour lui.

## 1.4.1 · 16/11/2026

- Carte et globe : le soleil clignotant et la lune ne sont plus affichés, le contraste jour/nuit suffit.

## 1.4.0 · 16/11/2026

- Le style Satellite montre maintenant de vraies images, les mêmes que la carte des trajets de Travel Hub : NASA Blue Marble avec relief et fonds marins le jour, lumières des villes vues par le satellite VIIRS la nuit. Les images sont rangées dans l'app (420 Ko) : elles marchent hors connexion. Plus de relief inventé ni de faux nuages.
- Nouveau sélecteur Carte | Globe : la Terre en 3D (WebGL), éclairée par le soleil à la minute, avec halo d'atmosphère, dans chacun des cinq styles. Elle tourne doucement (selon le réglage Animations) et se fait tourner au doigt ; elle reprend sa rotation 20 s après. Les villes, le soleil et la lune suivent la rotation.

## 1.3.0 · 16/11/2026

- Cinq styles pour la carte du monde, au choix sous la carte et mémorisés :
  - Nature : couleurs des climats, frontières discrètes ;
  - Satellite : océans profonds et plateaux continentaux plus clairs, terres texturées, banquise, voile de nuages avec leur ombre, nuit noire vue de l'espace ;
  - Épuré : mer noire, terres grises unies sans frontières, nuit gris foncé, limite jour/nuit en trait blanc ;
  - Atlas : carte papier claire, la nuit posée comme une ombre bleutée ;
  - Néon : fond noir, côtes lumineuses cyan le jour et violettes la nuit.
- Frontières entre pays : Natural Earth (domaine public).

## 1.2.0 · 16/11/2026

- Nouvelle vue Carte du monde (bouton globe, en haut à droite) :
  - jour, nuit et crépuscule calculés à la minute sur toute la Terre, avec un liseré de crépuscule dégradé ;
  - soleil et lune placés à leur aplomb, lune à sa phase réelle, reflet du soleil sur l'océan ;
  - couleurs des climats sur les terres le jour, océan profond et étoiles la nuit ;
  - règle des 24 fuseaux en haut, avec l'heure de chacun et celle de l'iPad en blanc ;
  - chaque ville marquée de sa météo, sa température et son heure, étiquettes placées sans chevauchement ;
  - sous la carte, au choix : horloges à aiguilles (claires le jour, sombres la nuit) ou cartes météo peintes aux couleurs du ciel de chaque ville, avec écart horaire, lever, coucher et position dans la journée.
- Toucher une ville sur la carte ou sous la carte ouvre sa page. La vue affichée est retenue au redémarrage.
- Tracé des terres : Natural Earth (domaine public).
- Le service worker ne s'installe plus en local, pour que les essais voient toujours les derniers fichiers.

## 1.1.0 · 16/11/2026

- Anglais par défaut, français au choix dans Réglages, Langue (ou langue de l'iPad avec « Automatic »).
- Tout l'affichage est traduit : écran Diagnostic, badge de démonstration, heures des réglages, noms des lieux d'origine (Moscow / Moscou, Ireland / Irlande), journal.
- Changement de lieu au glisser plus tolérant : la page suit le doigt, change au-delà de 60 px ou sur un geste vif, et revient en place sinon. Le défilement vertical n'est plus gêné.
- La page de test `sonde.html` est en anglais.
- `?demo=` accepte aussi les mots anglais (`dusk,clear`, `noon,rain`…).

## 1.0.0 · 16/11/2026

Première version.

- Page web installable sur l'écran d'accueil de l'iPad, plein écran, portrait et paysage.
- Données Open-Meteo : instant présent, pluie par quart d'heure sur 3 h, 48 heures, 10 jours, qualité de l'air, pollens.
- Ciel animé piloté par la hauteur réelle du soleil au lieu affiché : nuit, aube, lever, jour, coucher, crépuscule ; soleil, lune à sa phase, étoiles, nuages, pluie, neige, grêle, éclairs, brouillard, relief propre à chaque lieu.
- Lieux gérés à la main (Dublin, Paris, Moscou au départ), glisser pour passer de l'un à l'autre.
- Avis calculés : gel, rafales, fortes pluies, neige, orage, chaleur, UV, air dégradé.
- Fonctionnement en station : rafraîchissement toutes les 10 min, tenue hors connexion, atténuation la nuit, défilement automatique, rechargement quotidien, écran de diagnostic et démonstration du ciel.
