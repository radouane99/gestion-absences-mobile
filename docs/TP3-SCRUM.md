# TP 3 - Méthodologie Agile / Scrum

## Cadre du dossier

Projet : application mobile de gestion des absences universitaires, React Native, Expo SDK 58, TypeScript et SQLite local.

Ce dossier répond aux questions 1 à 28. Les plans de Sprint, échanges d'équipe et retours du Product Owner ci-dessous constituent des **propositions et simulations pédagogiques**, pas la preuve de réunions réellement tenues ni de deux semaines de travail observées. Les noms des membres, dates réelles et retours de l'enseignant encadrant sont à compléter lors de la présentation. La recette tactile dans Expo Go reste à réaliser selon `TEST-EXPO-GO.md`.

## Partie 1 - Comprendre les méthodes agiles

### Q1. Définition

Une méthode Agile organise le développement par petits incréments, avec des échanges réguliers avec les utilisateurs. Elle vise à livrer rapidement de la valeur, vérifier les besoins, détecter les problèmes tôt et adapter les priorités aux retours reçus.

### Q2. Caractéristiques

- Développement itératif et incrémental.
- Collaboration fréquente avec les parties prenantes.
- Livraisons courtes, utilisables et testées.
- Priorisation par valeur et adaptation au changement.
- Équipe responsabilisée, transparence et amélioration continue.

### Q3. Comparaison

| Critère                 | Waterfall                                     | Incrémental                                  | Agile                                       |
| ----------------------- | --------------------------------------------- | -------------------------------------------- | ------------------------------------------- |
| Organisation            | Phases principalement séquentielles           | Construction par parties successives         | Cycles courts avec inspection et adaptation |
| Gestion des changements | Souvent coûteuse après validation d'une phase | Possible entre incréments                    | Intégrée à la gestion régulière du backlog  |
| Livraison               | Généralement en fin de projet                 | Plusieurs versions partielles                | Incréments utilisables fréquents            |
| Implication du client   | Forte au début et à la réception              | À la définition et validation des incréments | Régulière pendant le développement          |
| Tests                   | Souvent regroupés après l'implémentation      | À chaque incrément                           | Continus, avec critères d'acceptation       |

Une approche incrémentale peut aussi être Agile : ces notions ne sont pas exclusives.

### Q4. Quatre valeurs du Manifeste Agile

1. Individus et interactions : faciliter les échanges, pas seulement appliquer une procédure.
2. Logiciel opérationnel : vérifier concrètement l'utilité du produit, tout en conservant une documentation nécessaire.
3. Collaboration avec le client : ajuster les besoins ensemble, au-delà du seul contrat initial.
4. Adaptation au changement : réviser un plan quand de nouvelles informations le justifient.

Les éléments de droite gardent de la valeur ; ceux de gauche sont privilégiés.

## Partie 2 - Introduction à Scrum

Objectif produit proposé : permettre à l'université de saisir des absences fiables et aux étudiants de comprendre et justifier leur situation.

| Artefact Scrum  | Contenu dans ce projet                                                    | Engagement associé |
| --------------- | ------------------------------------------------------------------------- | ------------------ |
| Product Backlog | Ensemble ordonné des 22 stories ci-dessous                                | Product Goal       |
| Sprint Backlog  | Objectif, stories sélectionnées et plan de tâches du Sprint               | Sprint Goal        |
| Increment       | Fonctionnalités intégrées, utilisables et conformes à la qualité convenue | Definition of Done |

### Q5. Définition

Scrum est un cadre léger pour résoudre des problèmes complexes par une approche empirique : transparence, inspection et adaptation. Une Scrum Team construit de la valeur dans des Sprints de durée fixe, d'un mois maximum.

### Q6-Q7. Responsabilités

| Rôle / responsabilité                               | Application au projet                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------- |
| Product Owner : maximiser la valeur                 | Représenter les besoins de l'université et clarifier l'objectif du produit      |
| Product Owner : ordonner le Product Backlog         | Prioriser connexion, saisie et consultation avant les améliorations secondaires |
| Scrum Master : faciliter les événements             | Faire comprendre Scrum et aider l'équipe à rendre ses échanges utiles           |
| Scrum Master : aider à supprimer les obstacles      | Faire traiter un blocage de dépendance Expo ou de recette Android               |
| Developers : développer les fonctionnalités         | Concevoir, programmer, tester, documenter et maintenir l'application            |
| Developers : collaborer à la réalisation du produit | Décomposer les stories, adapter leur plan et respecter la Definition of Done    |

Proposition d'équipe pour la simulation : un Product Owner représentant la scolarité, un Scrum Master, quatre Developers. Les personnes réelles restent à désigner. L'équipe est collectivement responsable de l'incrément.

## Partie 3 - User Stories (Q8)

Les stories suivantes respectent la structure acteur / besoin / objectif. Elles forment également le Product Backlog de la Q10. Il y a plus de trois stories pour chaque acteur et une story technique supplémentaire.

## Parties 4 à 7 - Critères, Product Backlog, priorités et estimations

### Q9-Q11 et Q14. Backlog du produit

Points autorisés : 1, 2, 3, 5, 8, 13. Estimations pédagogiques relatives à discuter avec l'équipe. Pour chaque ligne : trois critères d'acceptation vérifiables. L'implémentation locale existe pour ces stories ; la validation finale dans Expo Go doit être faite par l'équipe.

| ID   | User Story                                                                                                            | Priorité | Points | Critères d'acceptation                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------------------------- | -------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| US01 | En tant qu'utilisateur, je veux me connecter afin d'accéder à mon espace personnel.                                   | Haute    |      3 | Identifiants valides ouvrent le bon rôle ; identifiants faux sont refusés ; déconnexion ferme l'accès aux routes protégées.                         |
| US02 | En tant qu'enseignant, je veux consulter les étudiants d'un groupe afin de préparer l'appel.                          | Haute    |      3 | Groupes enregistrés visibles ; matricule et nom visibles ; ajout administratif visible après retour à l'écran.                                      |
| US03 | En tant qu'enseignant, je veux enregistrer l'absence d'un étudiant afin de mettre à jour son dossier.                 | Haute    |      5 | Matière, date et heure valides obligatoires ; seuls les inscrits à la séance sont acceptés ; répétition d'une absence n'ajoute aucun doublon.       |
| US04 | En tant qu'enseignant, je veux consulter l'historique afin de suivre mes saisies.                                     | Haute    |      3 | Seules mes absences sont listées ; tri par date et heure décroissantes ; filtre par groupe disponible si plusieurs groupes sont présents.           |
| US05 | En tant qu'étudiant, je veux consulter mes absences afin de suivre mon assiduité.                                     | Haute    |      3 | Seules mes absences sont visibles ; liste vide expliquée ; les données restent présentes après redémarrage.                                         |
| US06 | En tant qu'étudiant, je veux consulter le détail d'une absence afin d'en comprendre le contexte.                      | Haute    |      3 | Matière, date, heure et enseignant visibles ; statut et décision visibles ; identifiant d'une autre personne refusé.                                |
| US07 | En tant qu'enseignant, je veux modifier une absence afin de corriger une erreur.                                      | Haute    |      5 | Correction persistée ; doublon bloqué sans perdre la donnée précédente ; changement de séance réinitialise le justificatif et la lecture.           |
| US08 | En tant qu'enseignant, je veux annuler une absence erronée afin de rétablir la situation de l'étudiant.               | Moyenne  |      2 | Confirmation demandée ; seule une de mes absences peut être supprimée ; justificatif et notification associés retirés.                              |
| US09 | En tant qu'étudiant, je veux consulter mon emploi du temps afin de connaître mes séances.                             | Haute    |      5 | Uniquement mes inscriptions ; date, heure, matière et enseignant affichés ; planning conservé après redémarrage.                                    |
| US10 | En tant qu'étudiant, je veux déposer un justificatif afin d'expliquer mon absence.                                    | Haute    |      8 | Motif et fichier obligatoires ; PDF/PNG/JPEG de 10 Mo maximum ; dépôt conservé localement avec statut En attente.                                   |
| US11 | En tant qu'étudiant, je veux consulter le statut de mon justificatif afin de connaître la décision.                   | Haute    |      3 | En attente/Accepté/Refusé visibles ; commentaire de décision visible ; nouveau dépôt après refus remet En attente, dépôt accepté verrouillé.        |
| US12 | En tant qu'enseignant, je veux justifier une absence afin de traiter la demande de l'étudiant.                        | Haute    |      5 | Pièce consultable si un lecteur est installé ; acceptation ou refus avec commentaire obligatoire ; étudiant retrouve la décision après reconnexion. |
| US13 | En tant qu'enseignant, je veux connaître le taux d'absence d'un étudiant afin de repérer les difficultés d'assiduité. | Moyenne  |      5 | Compter mes séances commencées et inscriptions ; formule affichée ; afficher Non calculable si aucune séance.                                       |
| US14 | En tant qu'administrateur, je veux ajouter un étudiant afin de l'inscrire dans un groupe.                             | Haute    |      5 | Matricule, nom, groupe et compte nécessaires ; matricule/email uniques ; échec de création du compte annule aussi la création de l'étudiant.        |
| US15 | En tant qu'administrateur, je veux modifier les informations d'un étudiant afin de maintenir son dossier.             | Haute    |      3 | Nom et groupe modifiables ; nom de connexion mis à jour ; transfert préserve l'historique et modifie les inscriptions futures.                      |
| US16 | En tant qu'administrateur, je veux ajouter un enseignant afin de lui donner accès à la saisie.                        | Haute    |      3 | Nom/email/mot de passe validés ; email unique ; nouveau compte ouvre l'espace enseignant.                                                           |
| US17 | En tant qu'administrateur, je veux gérer les groupes afin d'organiser les effectifs.                                  | Haute    |      5 | Créer et renommer ; noms uniques ; suppression permise seulement pour un groupe sans étudiant ni séance.                                            |
| US18 | En tant qu'administrateur, je veux planifier les séances afin d'alimenter les emplois du temps.                       | Haute    |      5 | Groupe et enseignant existants ; date et heure valides ; répétition de la même séance ne crée aucun doublon.                                        |
| US19 | En tant qu'administrateur, je veux consulter les statistiques afin de suivre l'assiduité de l'université.             | Moyenne  |      5 | Filtre par groupe ; effectifs, absences, justifications et taux individuels ; taux global pondéré par les inscriptions aux séances.                 |
| US20 | En tant qu'étudiant, je veux repérer les nouvelles absences dans l'application afin d'être informé.                   | Basse    |      3 | Nombre d'absences non lues affiché ; ouverture du détail marque lue ; correction d'une absence la signale de nouveau.                               |
| US21 | En tant qu'étudiant, je veux consulter mon taux d'absence afin d'évaluer mon assiduité.                               | Basse    |      2 | Uniquement mon taux ; détails du numérateur et dénominateur ; absence justifiée identifiée et incluse dans le taux brut.                            |
| US22 | En tant qu'équipe de développement, je veux migrer les données locales afin de préserver les absences déjà saisies.   | Haute    |      5 | Anciennes absences conservées ; migration exécutée une seule fois ; transactions annulées complètement en cas d'échec.                              |

US20 est une notification **dans l'application**, pas un push système. La notification distante éventuelle de la Q25 reste une évolution distincte à négocier ; elle nécessite un service de synchronisation et un environnement de test adapté.

### Q9. Scénarios détaillés pour les trois stories imposées

**Consultation des absences (US05)**

1. Étant connecté comme E001, quand j'ouvre mon espace, alors je vois uniquement les absences de E001.
2. Étant connecté avec un étudiant sans absence, quand j'ouvre la liste, alors un état vide est affiché.
3. Après fermeture complète de l'application, quand je me reconnecte, alors mes absences sont encore présentes.

**Enregistrement d'une absence (US03)**

1. Pour une séance commencée, une matière, une date et une heure valides, quand je sélectionne un inscrit et valide, alors l'absence apparaît dans l'historique.
2. Quand je répète la même saisie, alors aucune ligne supplémentaire n'est créée.
3. Quand une date est impossible, l'heure invalide, ou l'étudiant non inscrit, alors toute l'opération est refusée et les données précédentes restent intactes.

**Dépôt d'un justificatif (US10)**

1. Pour une de mes absences, quand je saisis un motif et joins un PDF autorisé, alors le fichier est copié dans les documents persistants et le statut devient En attente.
2. Sans motif, sans fichier, ou avec un fichier de plus de 10 Mo, alors le dépôt est bloqué.
3. Pour l'absence d'un autre étudiant ou un justificatif déjà accepté, alors le dépôt est refusé.

### Q12. Justification d'au moins cinq priorités

- US01 haute : les rôles doivent accéder à des espaces cohérents.
- US02 haute : l'enseignant doit identifier les bons étudiants avant la saisie.
- US03 haute : l'enregistrement est la fonction centrale du produit.
- US05 haute : le produit doit aussi permettre à l'étudiant de connaître sa situation.
- US10 haute : le circuit de justification évite de laisser des absences expliquées sans traitement.
- US19 moyenne : les statistiques agrègent des données qui doivent d'abord être fiables.
- US20 basse : le signalement facilite le suivi, mais dépend de la saisie et de la consultation déjà disponibles.

US20 et US21 sont de priorité basse : ce sont des compléments au suivi principal. Leurs priorités restent ajustables par le Product Owner.

### Q13. Pourquoi ne pas tout développer simultanément ?

La capacité est limitée, les stories ont des dépendances et trop de tâches ouvertes augmentent les conflits et retardent la validation. Une première chaîne complète, connexion / appel / consultation, apporte une valeur vérifiable avant d'ajouter le circuit de justificatifs et l'administration.

### Q15. Pourquoi 8 points plutôt que 3 ?

US10 (8) combine sélection de fichier, vérification du format et de la taille, copie persistante, accès à l'absence, transaction et gestion des erreurs. US11 (3) affiche principalement des informations déjà enregistrées. L'incertitude et les interactions techniques sont plus grandes dans US10.

### Q16. Pourquoi les points ne sont pas des heures ?

Ils expriment une complexité relative intégrant effort, incertitude et risque. Deux équipes n'ont pas nécessairement la même échelle. La vitesse observée sur plusieurs Sprints aide à prévoir la capacité ; elle ne fournit pas une conversion universelle points/heures.

## Partie 8 - Planification du Sprint (Q17)

Durée proposée : deux semaines, de J1 à J10 ouvrés. Capacité maximale : 20 points. Objectif : permettre à l'enseignant de saisir une absence et à l'étudiant concerné de la consulter dans une première version locale.

| ID        | Story du Sprint 1                  | Points |
| --------- | ---------------------------------- | -----: |
| US01      | Connexion et espaces selon le rôle |      3 |
| US02      | Liste des étudiants par groupe     |      3 |
| US03      | Saisie d'absence                   |      5 |
| US04      | Historique enseignant              |      3 |
| US05      | Consultation étudiant              |      3 |
| US06      | Détail d'une absence               |      3 |
| **Total** |                                    | **20** |

Justification : ces stories forment un parcours complet sans dépendre du dépôt de fichiers ni des statistiques avancées. Le stockage initial nécessaire fait partie des tâches de ces stories. US22 traite ensuite l'évolution et la migration de ce stockage.

Plan indicatif : J1 clarification et conception ; J2-J3 connexion/groupes ; J3-J5 saisie ; J5-J7 historique et consultation ; J8-J9 intégration et recette ; J10 Review et rétrospective. Le Daily a lieu chaque jour. Les Developers adaptent ce plan selon l'avancement.

Definition of Done proposée : critères acceptés, TypeScript et lint sans erreur, tests pertinents réussis, parcours exécuté dans Expo Go Android, persistance vérifiée, documentation mise à jour et absence de défaut bloquant. Un bundle compilé ne remplace pas la recette sur appareil.

Proposition de découpage ultérieur, à reprioriser avec le Product Owner :

| Sprint | Stories                                   |                                               Total |
| ------ | ----------------------------------------- | --------------------------------------------------: |
| 2      | US07, US08, US09, US10                    |                                                  20 |
| 3      | US11, US12, US14, US15, US16              |                                                  19 |
| 4      | US13, US17, US18, US19                    |                                                  20 |
| 5      | US20, US21, US22 et recette d'intégration | 10 points de stories, marge pour recette et retours |

Ces Sprints constituent un plan pédagogique. Ils ne prétendent pas décrire une chronologie réellement observée pendant l'implémentation assistée.

## Partie 9 - Décomposition en tâches (Q18)

| Story | Tâches techniques et validation                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US01  | Construire le formulaire ; créer/initialiser les comptes SQLite ; vérifier les identifiants ; mettre la session en contexte ; protéger les routes ; tester erreur, rôle et déconnexion.                             |
| US03  | Modéliser séance/inscription/absence ; créer les champs et la sélection ; valider date/heure ; écrire la transaction paramétrée ; ajouter la contrainte unique ; tester doublons, étudiant hors séance et rollback. |
| US05  | Associer le compte au matricule ; filtrer les requêtes par étudiant ; créer liste et état vide ; rafraîchir au retour à l'écran ; vérifier l'accès à une autre absence ; tester la persistance après fermeture.     |

## Partie 10 - Événements Scrum (Q19-Q20)

| Événement            | Objectif                                                             | Participants                                          | Résultat                                                     |
| -------------------- | -------------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------ |
| Sprint               | Créer de la valeur sur une durée fixe                                | Scrum Team                                            | Incrément(s) utilisable(s), progression vers le Product Goal |
| Sprint Planning      | Définir pourquoi, quoi et comment réaliser le Sprint                 | Scrum Team                                            | Sprint Goal et Sprint Backlog                                |
| Daily Scrum          | Inspecter la progression vers le Sprint Goal et adapter le plan      | Developers ; PO/SM s'ils travaillent comme Developers | Plan ajusté pour la journée, obstacles identifiés            |
| Sprint Review        | Inspecter le résultat avec les parties prenantes et adapter la suite | Scrum Team et parties prenantes                       | Retours, backlog et prochaines priorités adaptés             |
| Sprint Retrospective | Améliorer la qualité et l'efficacité de la collaboration             | Scrum Team                                            | Actions concrètes d'amélioration                             |

Le Sprint contient les autres événements. Le Daily est limité à 15 minutes ; le TP propose ici une simulation de 10 minutes. Les trois questions sont une technique pédagogique possible, pas un format imposé par Scrum.

## Partie 11 - Simulation du Daily Scrum (Q21)

Simulation de 10 minutes : 1 minute de rappel de l'objectif, 6 minutes d'échanges, 3 minutes d'adaptation du plan. Les discussions techniques longues sont poursuivies après le Daily.

| Membre simulé                            | Depuis le dernier Daily                  | Aujourd'hui                                                             | Obstacle                                           |
| ---------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| Developer 1                              | Formulaire et validation de connexion    | Vérifier les redirections par rôle                                      | Aucun                                              |
| Developer 2                              | Schéma SQLite et groupes                 | Transaction d'enregistrement                                            | Confirmer la version SQLite compatible Expo        |
| Developer 3                              | Liste enseignant                         | État vide et filtres de l'historique                                    | Dépend des données de test de Developer 2          |
| Developer 4                              | Liste étudiant                           | Détail et contrôle d'accès                                              | Besoin d'un second compte étudiant pour la recette |
| Product Owner, invité pour clarification | Clarifié l'ordre des fonctionnalités     | Confirmer la définition d'une absence unique                            | Disponibilité limitée à une plage de validation    |
| Scrum Master, observateur/facilitateur   | Aidé à traiter le blocage d'installation | Faciliter la résolution des dépendances et protéger le temps de travail | Accès réseau de l'environnement                    |

Décisions simulées : Developer 2 confirme la dépendance, puis fournit un jeu de test ; Developer 4 crée le deuxième compte ; les Developers réordonnent leurs tâches ; le Product Owner réserve une plage de recette. PO et SM ne sont pas tenus de rendre compte quotidiennement : leur participation ci-dessus sert l'exercice demandé.

## Partie 12 - Proposition de Sprint Review (Q22)

Pour le Sprint 1 proposé, les stories candidates à présenter sont US01-US06. Elles ne peuvent être déclarées terminées au sens de la Definition of Done qu'après la recette Android.

Démonstration proposée : connexion enseignant, affichage d'un groupe, saisie d'une absence pour E001, répétition pour vérifier le doublon, consultation de l'historique, déconnexion, connexion étudiant et ouverture du détail, fermeture/réouverture et vérification des données.

Fonctions hors Sprint 1 : correction, justificatifs, emploi du temps, administration complète et statistiques. Elles restent au Product Backlog de ce plan, même si la version actuelle du dépôt contient désormais leur implémentation.

Remarques fictives du Product Owner pour la simulation : « afficher le statut de justification », « expliquer le calcul du taux », « confirmer la persistance d'une pièce jointe ». Ces remarques sont des exemples, à remplacer par les observations réellement recueillies. La Review sert à échanger et adapter la suite, pas seulement à faire une démonstration.

## Partie 13 - Proposition de rétrospective (Q23)

Points à discuter : la séparation écrans/données a facilité les évolutions ; les transactions ont protégé contre les écritures partielles ; les critères ont rendu les tests précis. Points à améliorer : anticiper les dépendances natives, définir le calcul du taux avant l'interface, réserver du temps sur appareil.

| Action d'amélioration proposée                                   | Responsable proposé               | Échéance / preuve                                              |
| ---------------------------------------------------------------- | --------------------------------- | -------------------------------------------------------------- |
| Vérifier les docs de la version Expo avant chaque nouveau module | Developer responsable de la story | Au raffinement ; version et compatibilité consignées           |
| Ajouter un test de refus d'accès pour chaque écriture sensible   | Developers                        | Avant la Review ; test automatique réussi                      |
| Exécuter un scénario complet enseignant/étudiant sur Android     | Binôme de recette                 | Avant de déclarer la story terminée ; fiche de recette remplie |
| Limiter les tâches En cours et intégrer tôt                      | Developers avec aide du SM        | Prochain Sprint ; blocages discutés au Daily                   |

## Partie 14 - Kanban (Q24)

Tableau de simulation pendant le Sprint 1 ; les états ci-dessous illustrent des déplacements, sans inventer une observation réelle.

| À faire                        | En cours                             | En test                                | Terminé                                      |
| ------------------------------ | ------------------------------------ | -------------------------------------- | -------------------------------------------- |
| US06 - mise en forme du détail | US05 - contrôle des données étudiant | US03 - doublons et persistance Android | US01 - connexion acceptée dans la simulation |
| US04 - vérification du filtre  | US04 - requête de l'historique       | US02 - validation des listes           |                                              |

Unité du tableau : tâche, avec préfixe de story. Exemple de déplacement : « US03 - doublons » passe de En cours à En test après intégration, puis à Terminé seulement après validation. Une erreur le renvoie En cours. Limite indicative : deux tâches En cours pour éviter la dispersion.

**État réel de livraison à utiliser aujourd'hui** : l'implémentation est présente dans le dépôt ; la validation Android manuelle est à faire. Les tâches de recette restent En test. Ne pas présenter toutes les stories comme acceptées sans cette vérification.

## Partie 15 - Mises en situation

### Q25. Demande de notification en cours de Sprint

L'équipe n'est pas obligée d'intégrer immédiatement la demande. Le Product Owner clarifie la valeur et ajoute/ordonne la story dans le backlog. Les Developers évaluent le coût et négocient avec le Product Owner un ajustement de périmètre si cela ne met pas en danger le Sprint Goal ni la qualité. Sinon la story est planifiée pour un prochain Sprint. Seul le Product Owner peut annuler un Sprint si son objectif devient obsolète.

L'application actuelle propose un compteur local de nouvelles absences. Un push entre appareils, y compris application fermée, est une autre story : définir destinataire, service distant, permissions et tests. Elle ne doit pas être déclarée terminée par la seule présence du compteur.

### Q26. Deux stories non terminées en fin de Sprint

Rendre visible ce qui fonctionne et ce qui ne respecte pas la Definition of Done. Les éléments inachevés ne font pas partie de l'incrément terminé et retournent au Product Backlog pour être réévalués et réordonnés. Une découpe n'est acceptable que si la partie livrée est cohérente et respecte les critères convenus. Ne pas prolonger automatiquement le Sprint ni réduire la qualité pour afficher artificiellement des stories terminées. Analyser les causes en rétrospective et adapter les prochaines prévisions.

## Partie 16 - Comparaison avec le TP1

### Q27. Comparaison des approches

| TP1 : besoins, analyse, UML, conception, implémentation | TP3 : backlog, planification, développement, Review, rétrospective |
| ------------------------------------------------------- | ------------------------------------------------------------------ |
| Accent sur comprendre et concevoir le système           | Accent sur organiser, livrer et améliorer le travail               |
| Modèles et architecture comme supports de réalisation   | Stories et critères comme unités de discussion et validation       |
| Progression pédagogique par étapes                      | Progression par petits incréments priorisés                        |
| Validation de la cohérence du modèle                    | Validation régulière de la valeur et du fonctionnement             |

Les deux approches sont complémentaires. Le scénario du TP3 est mobile ; notre réalisation utilise React Native/Expo. La progression de fin de document mentionne Java pour le TP1, mais cela ne constitue pas dans le TP3 une exigence de réécrire ce prototype mobile en Java. Une contrainte supplémentaire donnée en cours doit être confirmée avec l'encadrant.

### Q28. Utilisation d'UML en Agile

- Cas d'utilisation : vérifier les acteurs et la couverture du Product Backlog.
- Classes : guider les tables Compte, Étudiant, Groupe, Séance, Inscription, Absence et Justificatif.
- Séquences : clarifier l'enregistrement transactionnel et le circuit dépôt/décision.
- Activités : représenter la saisie et les branches d'erreur.

Produire et adapter les diagrammes nécessaires au fur et à mesure, sans figer tout le produit avant les retours utilisateurs. Les diagrammes du TP1 ne sont pas fournis ici : les réutiliser réellement au moment de la remise, plutôt que d'affirmer qu'ils ont été vérifiés.

## Correspondance entre exigences et application

| Besoin de l'énoncé                             | Écran / réalisation                         |
| ---------------------------------------------- | ------------------------------------------- |
| Connexion des trois rôles                      | Connexion, comptes SQLite, routes protégées |
| Enseignant : étudiants par groupe              | Espace enseignant                           |
| Enseignant : saisie d'une absence              | Saisir une séance / Faire l'appel           |
| Enseignant : modification / annulation         | Historique > Détails > Corriger / Annuler   |
| Enseignant : justifier / accepter / refuser    | Détails > décision avec commentaire         |
| Enseignant : historique et taux                | Historique et Statistiques                  |
| Étudiant : emploi du temps                     | Mon emploi du temps                         |
| Étudiant : absences et détails                 | Mes absences > Détails                      |
| Étudiant : justificatif et statut              | Détails > déposer un PDF/image > statut     |
| Administration : ajout / modification étudiant | Gérer les étudiants                         |
| Administration : ajout enseignant              | Ajouter un enseignant                       |
| Administration : groupes                       | Gérer les groupes                           |
| Administration : statistiques                  | Statistiques d'absence                      |
| Support du planning                            | Planifier une séance                        |

## Limites du prototype et conclusion

Cette version couvre les parcours fonctionnels de l'énoncé avec un stockage local partagé entre les comptes sur **le même appareil**. Les comptes restent une authentification de démonstration, sans serveur d'identité ; les mots de passe sont stockés localement pour l'exercice. Il n'y a pas de synchronisation entre téléphones ni de push distant. Les pièces jointes restent dans les documents privés de l'application. Les supprimer avec les données de l'application supprime aussi leur accès.

Le taux utilise les séances commencées et les inscriptions conservées ; il inclut les absences justifiées et expose leur nombre séparément. Les séances planifiées sont supposées tenues dès leur heure de début. Les séances de démonstration initiales servent au test et doivent être distinguées de données de scolarité réelles.

Le TP relie besoins, réalisation et gestion du projet. Le backlog rend le périmètre visible, les critères guident la validation et les événements simulés montrent comment inspecter les résultats et adapter le travail. La prochaine étape pédagogique est d'exécuter la recette, recueillir des retours réels et mettre à jour les états et la rétrospective avec ces observations.

## Références

- Énoncé fourni : TP 3, Méthodologie Agile - Scrum, 11 pages.
- [Scrum Guide officiel](https://scrumguides.org/scrum-guide.html) : rôles, événements, artefacts et engagements.
- [Manifeste Agile, version française](https://agilemanifesto.org/iso/fr/manifesto.html) : les quatre valeurs.
- [SQLite pour Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/sqlite/), [DocumentPicker](https://docs.expo.dev/versions/v58.0.0/sdk/document-picker/) et [FileSystem](https://docs.expo.dev/versions/v58.0.0/sdk/filesystem/) : modules utilisés.
