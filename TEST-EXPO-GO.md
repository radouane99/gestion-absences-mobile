# Recette complète dans Expo Go Android

## Lancement

Depuis `gestion-absences` : `npm install`, puis `npx expo start --clear`. Scanner le QR code avec Expo Go compatible SDK 58. Le téléphone et l'ordinateur doivent être sur le même réseau. SQLite, DocumentPicker et FileSystem sont des modules Expo compatibles Expo Go ; aucun build personnalisé n'est nécessaire pour ces parcours.

Les trois comptes initiaux sont conservés :

| Rôle           | Email               | Mot de passe |
| -------------- | ------------------- | ------------ |
| Administration | admin@absence.ma    | Admin123!    |
| Enseignant     | prof@absence.ma     | Prof123!     |
| Étudiant E001  | etudiant@absence.ma | Etudiant123! |

Le compte étudiant correspond à **Amine El Amrani, E001, groupe 1**. Les comptes ajoutés par l'administration se connectent avec l'email et le mot de passe renseignés à la création. Le nom d'un compte étudiant est mis à jour lors de la modification administrative de son dossier.

Le premier lancement initialise deux groupes, six étudiants et huit séances de démonstration : deux passées et deux futures par groupe, par rapport à la date du premier lancement. La migration conserve les absences de l'ancienne version et reconstitue leurs séances. Elle ne réinitialise pas les données lors des ouvertures suivantes. Ne pas effacer les données d'Expo Go pour tester la migration.

## 1. Connexion et rôles

1. Tester les champs vides et un mot de passe faux : refus explicite.
2. Se connecter successivement avec les trois comptes : chaque compte ouvre son espace.
3. Se déconnecter et tenter le retour Android vers un écran protégé : le contenu ne doit plus être accessible.
4. Se reconnecter avec un autre rôle : les données doivent respecter le rôle et le matricule.

## 2. Administration : groupes et comptes

1. Ouvrir Gérer les groupes, ajouter « Groupe recette » et vérifier sa présence.
2. Le renommer « Groupe recette 2 » et vérifier que le nom est conservé au retour.
3. Essayer un nom vide et un nom déjà existant : refus.
4. Créer un groupe vide temporaire, le supprimer après confirmation et vérifier sa disparition.
5. Gérer les étudiants : ajouter `R001`, « Étudiant recette », groupe recette 2, `recette@absence.ma`, mot de passe `Recette123!`.
6. Essayer un matricule déjà utilisé et un email déjà utilisé : refus sans créer de dossier partiel.
7. Modifier le nom de R001. Son matricule reste fixe. Vérifier le groupe et le nom au retour.
8. Ajouter un enseignant « Professeur recette », `prof.recette@absence.ma`, `ProfRecette123!`.
9. Essayer email invalide et mot de passe de moins de huit caractères : refus.
10. Déconnexion, connexion aux deux nouveaux comptes : vérifier les espaces et l'identité.
11. Reconnecter l'administration et tenter de supprimer un groupe occupé : refus explicite.

## 3. Planning

1. Administration > Planifier une séance : choisir groupe recette 2, professeur recette, matière « Algorithmique », une date passée et `08:30`.
2. Ajouter une seconde séance passée à `10:30`, puis une future un autre jour.
3. Refaire exactement la première planification : pas de doublon dans l'emploi du temps.
4. Essayer le 30 février, `24:00`, matière vide, enseignant ou groupe absent : refus.
5. Se connecter avec R001 : son emploi du temps doit afficher ces séances.
6. Se connecter avec professeur recette : son emploi du temps doit afficher ses séances ; « Faire l'appel » préremplit le formulaire.

## 4. Enseignant : saisie et historique

1. Se connecter avec `prof@absence.ma`. Vérifier les groupes et les matricules.
2. Choisir groupe 1, matière « Français », une date passée et `08:30` ; cocher E001 et E002 puis valider.
3. Vérifier le nombre d'ajouts, les détails et le statut Non justifiée dans l'historique.
4. Refaire la même saisie : zéro nouvel ajout et deux doublons signalés.
5. Changer de date ou d'heure : nouvelle absence possible.
6. Tester une séance future : aucun enregistrement d'absence autorisé avant son début.
7. Valider une séance passée sans sélectionner d'étudiant : la séance existe, sans nouvel absent. Cela ne retire pas les absences déjà enregistrées ; utiliser les détails pour corriger une saisie.
8. Saisir une absence dans le second groupe : le filtre de l'historique apparaît quand les deux groupes ont des absences.
9. Se connecter avec professeur recette : l'historique n'affiche pas les absences du premier professeur.

## 5. Étudiant : absences, détail et notifications locales

1. Se connecter avec `etudiant@absence.ma` : seules les absences E001 sont affichées, pas celles de E002.
2. Le compteur de notifications indique les absences non lues.
3. Ouvrir un détail : vérifier matière, date, heure, groupe, enseignant et statut.
4. Revenir : le compteur diminue, la lecture est conservée après redémarrage.
5. Se connecter avec R001 avant sa première absence : vérifier l'état vide.

## 6. Dépôt d'un justificatif et décision

Préparer sur le téléphone un PDF ou une image PNG/JPEG de moins de 10 Mo.

1. E001 > Détail d'une absence > saisir « Maladie » puis Choisir une pièce jointe.
2. Annuler le sélecteur : le formulaire reste utilisable, aucun dépôt automatique.
3. Sans motif ou sans pièce, tenter le dépôt : refus.
4. Essayer un fichier autorisé dépassant 10 Mo : refus. Le sélecteur filtre les autres formats ; leur extension est aussi vérifiée.
5. Déposer un fichier valide : statut En attente. Fermer et rouvrir Expo Go ; le document reste consultable.
6. Se reconnecter avec le professeur auteur de l'absence > Historique > Détails > ouvrir la pièce. Android peut demander de choisir un lecteur PDF/image. En l'absence de lecteur, un message l'explique.
7. Essayer une décision sans commentaire : refus.
8. Refuser avec « Document incomplet ». Reconnexion E001 : statut Refusé et commentaire visibles.
9. Déposer une nouvelle pièce : statut remis à En attente.
10. Professeur ou administration > accepter avec « Certificat conforme ». E001 retrouve Accepté et le dépôt est verrouillé.
11. Pour une autre absence sans fichier, l'enseignant peut justifier directement avec un commentaire, par exemple « Justificatif papier reçu ».

### Régression Android : permission READ et consultation administrative

- Relancer avec `npx expo start --clear`, puis rouvrir le projet dans Expo Go. Ne pas effacer les données de l'application.
- Sur Android, choisir un document du fournisseur système : l'application copie l'URI autorisée dans son propre cache, puis attend la copie persistante avant d'écrire le dépôt SQLite. Une erreur de lecture doit afficher une alerte et ne doit jamais annoncer un dépôt réussi.
- Si un dépôt de l'ancienne version référence un fichier absent, le sélectionner et le déposer à nouveau depuis le compte étudiant. Les anciennes lignes SQLite sont conservées.
- Administration > **Absences et justificatifs** > **Justificatifs en attente** : le dépôt apparaît avec le nom de l'étudiant. Ouvrir Détails, puis la pièce jointe, et accepter/refuser avec commentaire.
- Revenir à la liste : elle se recharge automatiquement ; un dépôt accepté quitte le filtre En attente et apparaît dans Acceptés.
- Statistiques : « justifiée » correspond à **Accepté**. En attente et Refusé ne doivent pas augmenter ce nombre. Le taux brut ne change pas après acceptation.
- `npm run test:justificatifs` vérifie les copies asynchrones : aucune écriture avant la fin du fichier, rejet READ transmis, échec de base nettoyé et absence de faux succès.

## 7. Correction et annulation

1. Auteur de l'absence > Détails > changer matière, date ou heure vers une autre séance passée.
2. Confirmer : correction visible dans les deux espaces ; le justificatif est retiré et la notification redevient non lue.
3. Enregistrer sans changer la séance : le justificatif reste conservé.
4. Essayer de déplacer une absence vers une séance où le même étudiant est déjà absent : refus ; la donnée initiale doit rester intacte.
5. Annuler une absence saisie par erreur : demander confirmation, puis vérifier sa disparition côté enseignant et étudiant.

## 8. Statistiques

Utiliser le groupe recette 2 pour un résultat sans les séances initiales de démonstration.

1. Avec professeur recette, enregistrer R001 absent à la première séance passée, puis valider la seconde sans absent.
2. Vérifier le taux : 1 absence / 2 séances commencées = 50 %. La séance future n'est pas comptée.
3. Accepter une justification : taux brut toujours 50 %, nombre d'absences justifiées = 1.
4. Espace étudiant : seulement son taux. Espace enseignant : seulement les séances et absences de cet enseignant. Administration : agrégat de tous les enseignants et filtre par groupe.
5. Sans séance commencée, afficher Non calculable, pas une division par zéro.
6. Modifier le groupe de R001 : les inscriptions passées et ses absences sont conservées ; les inscriptions futures sont transférées. Le groupe affiché dans les statistiques individuelles est son groupe actuel.

Hypothèse affichée dans l'application : une séance planifiée est considérée tenue à son heure de début. Le taux est brut, justifications incluses, et utilise les inscriptions mémorisées pour chaque séance. Le global est pondéré par ces inscriptions, pas une simple moyenne des pourcentages individuels.

## 9. Persistance et migration

Fermer complètement Expo Go, rouvrir le même projet, puis se reconnecter. Vérifier groupes renommés, nouveaux comptes, modifications des étudiants, planning, absences, décisions, lectures et ouverture des pièces. Une ancienne installation doit retrouver ses absences après migration ; l'initialisation ne doit pas recréer des groupes supprimés ou écraser les noms modifiés.

## Contrôles automatiques

- `npm run typecheck` : TypeScript.
- `npm run lint` : ESLint.
- `npm run test:absences` : Node 22.13+ avec SQLite intégré ; teste une base sur disque, migration ancienne version, persistance après réouverture, comptes et rôles, doublons, transactions/rollback, justificatifs, correction, suppression, statistiques et transferts.
- `npx expo export --platform android` : compilation du bundle Android Hermes.

Le test remplace uniquement le pont natif Expo par un adaptateur du moteur SQLite de Node. Le sélecteur Android, la prévisualisation de fichiers, les gestes et la persistance du module natif doivent être vérifiés sur appareil.

## Limites et remise du TP

Prototype local sur le même appareil : pas de synchronisation entre téléphones, pas de push distant, pas de serveur d'authentification. Les mots de passe restent locaux pour la démonstration. Ne pas utiliser de vrais dossiers médicaux pour la recette. Les pièces acceptées/supprimées du dossier peuvent rester dans le répertoire privé comme fichiers orphelins ; un nettoyage automatique n'est pas implémenté. Effacer les données d'Expo Go efface le stockage.

Le dossier `docs/TP3-SCRUM.md` contient les réponses 1 à 28, le backlog de 22 stories, les critères, estimations et plans de Sprint, les simulations, Kanban et la correspondance avec les écrans. Les simulations sont explicitement identifiées ; noter les vrais résultats de recette et les vrais retours du Product Owner avant la remise.
