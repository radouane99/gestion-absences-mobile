# Gestion des absences universitaires

Application mobile pédagogique réalisée avec **React Native, Expo SDK 58, TypeScript et SQLite**. Elle propose trois espaces : enseignant, étudiant et administration. L'interface est en français et les données sont conservées localement sur l'appareil.

Le projet accompagne le **TP 3 - Méthodologie Agile / Scrum**. Le code source et les documents permettent de présenter les fonctionnalités, la conception et l'organisation du travail.

## Accès rapide pour l'évaluation

- [Installation et lancement](#installation-et-lancement)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Guide de recette Android dans Expo Go](TEST-EXPO-GO.md)
- [Dossier du TP Scrum : questions 1 à 28](docs/TP3-SCRUM.md)
- [Architecture, données et règles métier](docs/ARCHITECTURE.md)

## Fonctionnalités

| Espace         | Fonctionnalités                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Enseignant     | Étudiants par groupe, emploi du temps, appel, enregistrement des absences, historique, correction et annulation, traitement des justificatifs, taux d'absence                                    |
| Étudiant       | Emploi du temps, consultation de ses propres absences et de leurs détails, dépôt d'un PDF ou d'une image, suivi du statut, taux personnel, signalement des nouvelles absences dans l'application |
| Administration | Ajout et modification d'étudiants, création de comptes enseignants, gestion des groupes, planification des séances, consultation et traitement des justificatifs, statistiques par groupe        |

Les formulaires vérifient les données, les écritures sensibles utilisent des transactions et les contraintes SQLite évitent les doublons. Les écrans sont protégés selon le rôle de la session locale.

## Technologies

| Élément                          | Version / rôle                                               |
| -------------------------------- | ------------------------------------------------------------ |
| Expo                             | SDK 58 (`~58.0.19`)                                          |
| React Native / React             | `0.88.0` / `19.3.0`                                          |
| TypeScript                       | Mode strict                                                  |
| Expo Router                      | Navigation par fichiers dans `src/app/`                      |
| Expo SQLite                      | Base persistante `gestion-absences.db`                       |
| Expo DocumentPicker / FileSystem | Sélection, copie persistante et ouverture des pièces jointes |
| ESLint / Prettier                | Vérification et formatage du code                            |

Les versions exactes sont verrouillées dans `package-lock.json`.

## Installation et lancement

### Prérequis

- Node.js **24.3.0 minimum dans la branche 24**, ou **22.13.0 minimum dans la branche 22**, avec npm. Le fichier `.nvmrc` sélectionne la branche 24 pour les utilisateurs de nvm.
- Git pour cloner le dépôt.
- Téléphone Android avec une version d'Expo Go compatible avec le SDK 58.
- Ordinateur et téléphone connectés au même réseau pour le mode LAN.

### Depuis le dépôt GitHub

1. Cloner le dépôt et entrer dans le projet :

   ```bash
   git clone https://github.com/radouane99/gestion-absences-mobile.git
   cd gestion-absences-mobile
   ```

   Le fichier `package.json` se trouve directement à cette racine.

2. Installer les dépendances :

   ```bash
   npm ci
   ```

3. Démarrer le serveur de développement :

   ```bash
   npx expo start --clear
   ```

4. Dans Expo Go sur Android, scanner le QR code affiché dans le terminal. Garder le serveur en cours d'exécution pendant la démonstration.

Aucune clé API, variable d'environnement ni base distante n'est nécessaire. Les modules utilisés pour SQLite et les justificatifs sont disponibles dans Expo Go pour ce SDK. Le scénario de recette cible Android ; le stockage SQLite web n'est pas configuré.

Si le téléphone ne joint pas le serveur LAN, vérifier le réseau et le pare-feu. Un tunnel peut être essayé avec `npx expo start --tunnel` ; il nécessite Internet et peut demander l'installation d'un outil supplémentaire.

## Comptes de démonstration

| Rôle           | Email                 | Mot de passe   |
| -------------- | --------------------- | -------------- |
| Administration | `admin@absence.ma`    | `Admin123!`    |
| Enseignant     | `prof@absence.ma`     | `Prof123!`     |
| Étudiant       | `etudiant@absence.ma` | `Etudiant123!` |

Le compte étudiant correspond au matricule **E001**, Amine El Amrani, dans le groupe Informatique 1. L'administration peut créer d'autres comptes étudiants et enseignants. Ces identifiants sont **des données de démonstration volontairement présentes dans le code**.

Au premier lancement, l'application crée deux groupes, six étudiants et des séances de démonstration avant/après la date d'initialisation. Elle ne crée pas d'absences artificielles : l'enseignant les saisit. Une migration conserve les absences d'une ancienne installation.

## Démonstration rapide

1. **Enseignant** : ouvrir le groupe 1, saisir une matière, une date passée et une heure, sélectionner E001 puis valider l'appel.
2. **Étudiant** : se connecter, ouvrir l'absence E001, saisir un motif, choisir un PDF/PNG/JPEG de moins de 10 Mo et déposer le justificatif.
3. **Administration** : ouvrir **Absences et justificatifs > En attente**, ouvrir le détail et accepter avec un commentaire.
4. **Étudiant** : retrouver le statut Accepté et le commentaire de décision.
5. **Statistiques** : vérifier l'absence justifiée et consulter la formule du taux. Fermer puis rouvrir Expo Go pour vérifier la persistance.

Effectuer ces changements de compte **sur le même téléphone et dans le même projet Expo Go**. Les données d'un téléphone ne sont pas synchronisées avec un autre.

Un justificatif déposé est **En attente**, puis devient **Accepté** ou **Refusé** après décision. Le compteur « justifiée » ne compte que les demandes acceptées. Le taux brut inclut les absences justifiées.

## Organisation du code

```text
src/
  app/                         Écrans et navigation Expo Router
    index.tsx                  Connexion
    enseignant/                Groupes, appel et historique
    etudiant/                  Espace étudiant
    administration/            Étudiants, enseignants, groupes, séances, justificatifs
    absence.tsx                Détail partagé et actions autorisées
    emploi-du-temps.tsx         Planning selon le rôle
    statistiques.tsx           Statistiques selon le rôle
  components/                  Composants réutilisables et formulaires
    ui/formulaire.tsx          Page, boutons, champs, choix et états de chargement
  data/
    models.ts                  Types du domaine
    validation.ts              Validation, dates et contrôle des rôles
    database.ts                Ouverture SQLite, schéma, migration et initialisation
    absences.ts                Opérations métier et requêtes paramétrées
    demo.ts                    Données initiales de démonstration
    session.tsx                Session utilisateur en mémoire
    justificatifs-fichiers.ts  Import et conservation des documents
  hooks/                       Chargement au focus et gestion des actions asynchrones
  types/                       Déclarations Expo disponibles dès le clonage
scripts/                       Tests automatisés
docs/                          Architecture et dossier Scrum
assets/                        Ressources visuelles et icônes
```

Les écrans affichent les données et déclenchent les actions. Le dossier `data/` porte les règles et la persistance ; les composants partagent les éléments d'interface. Aucun fichier de base SQLite ni justificatif réel n'est nécessaire dans le dépôt.

## Vérifications et commandes

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
```

| Commande                             | Résultat                                                                                                                            |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `npm start`                          | Démarre Expo                                                                                                                        |
| `npm run android`                    | Démarre Expo et tente l'ouverture Android                                                                                           |
| `npm run typecheck`                  | Vérifie TypeScript sans générer de JavaScript                                                                                       |
| `npm run lint`                       | Vérifie les règles ESLint                                                                                                           |
| `npm test`                           | Exécute les deux suites ci-dessous                                                                                                  |
| `npm run test:absences`              | Migration, persistance, rôles, comptes, groupes, absences, justificatifs, taux, transferts et rollback sur le moteur SQLite de Node |
| `npm run test:justificatifs`         | Vérifie l'ordre des copies asynchrones et de l'écriture, les rejets de permission, les validations et le nettoyage après échec      |
| `npm run format`                     | Formate le code et la documentation                                                                                                 |
| `npm run format:check`               | Vérifie le formatage sans modifier les fichiers                                                                                     |
| `npx expo export --platform android` | Compile le bundle Android Hermes dans `dist/` ; ne produit pas un APK                                                               |

Les tests SQLite utilisent une base temporaire séparée. Les tests de fichiers remplacent le pont natif par un double asynchrone ; ils ne prouvent pas à eux seuls le fonctionnement du sélecteur ou du lecteur Android. Suivre le [guide de recette](TEST-EXPO-GO.md) pour ces vérifications.

Expo génère ses types de routes au démarrage. Après l'ajout ou le déplacement de routes, redémarrer `npx expo start --clear` avant de relancer TypeScript si des types de navigation semblent périmés.

## Règles importantes

- Une absence est unique pour un enseignant, un étudiant, une matière normalisée, une date et une heure.
- On ne peut pas saisir une absence avant le début de la séance.
- Un appel sans sélection enregistre la séance sans nouvel absent ; il ne supprime pas les absences existantes.
- Une correction vers une autre séance réinitialise le justificatif et la lecture de l'absence.
- Un transfert d'étudiant conserve l'historique et ajuste les inscriptions futures.
- Le taux utilise les séances commencées auxquelles l'étudiant était inscrit ; une séance planifiée est supposée tenue à son heure de début.
- Les lectures de l'étudiant et de l'enseignant sont filtrées ; l'administration dispose d'une vue globale et peut traiter les justificatifs.

## Limites du prototype

Il s'agit d'une application pédagogique **locale**, sans serveur, synchronisation multi-appareils ni push distant. L'authentification est une démonstration : les mots de passe des comptes sont stockés localement en clair et ne constituent pas un système de sécurité de production. Utiliser des identifiants et documents fictifs pour la recette.

La session est en mémoire et doit être rouverte après redémarrage. Les documents sont copiés dans le répertoire privé de l'application. Effacer les données d'Expo Go supprime les données locales. Des pièces devenues orphelines après remplacement ou suppression ne sont pas nettoyées automatiquement.

## Documents à remettre

- Le lien du dépôt GitHub donne accès au code et à ce guide.
- [TP3-SCRUM.md](docs/TP3-SCRUM.md) contient les réponses, les 22 User Stories, critères, estimations, plans de Sprint, Kanban et simulations.
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) explique les couches et la base de données.
- [TEST-EXPO-GO.md](TEST-EXPO-GO.md) décrit la recette et les résultats attendus.

Les réunions et plannings du dossier Scrum sont des **simulations pédagogiques explicitement signalées**. Les résultats de recette sur téléphone et les retours réels de l'encadrant restent à renseigner par le groupe.

## Licence et origine

Le projet a été initialisé à partir du modèle Expo. La [licence MIT et les mentions du modèle](LICENSE) sont conservées. Les données initiales sont fictives.
