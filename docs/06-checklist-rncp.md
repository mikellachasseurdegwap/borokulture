# Checklist dossier RNCP

## Ce qui est déjà prêt

- Application full-stack fonctionnelle.
- Frontend Next.js avec interface dark mode BORO KULTURE.
- Backend Express séparé du frontend.
- Base de données PostgreSQL avec Prisma.
- Authentification utilisateur avec JWT.
- Inscription et connexion.
- Profil utilisateur complet.
- Upload avatar et couverture.
- Feed social.
- Création, modification et suppression de posts.
- Likes persistés avec protection contre les doublons.
- Commentaires persistés.
- Follow / unfollow.
- Recherche utilisateurs.
- Pages de profil publiques.
- Tests automatisés.
- README projet.
- Dépôt GitHub organisé avec branches.
- Diagrammes de conception.
- Documentation API.
- Scénario de démonstration.
- Plan de mémoire.

## Ce qu'il faut encore préparer

- Diaporama de soutenance.
- Captures d'écran propres de l'application.
- Jeu de données de démonstration avec deux comptes.
- Explication orale de l'architecture.
- Explication orale du modèle de données.
- Explication orale de la sécurité backend.
- Présentation des difficultés rencontrées.
- Présentation des améliorations possibles.
- Vérification finale du dépôt GitHub.

## Diagrammes à présenter

- Architecture générale de l'application.
- Modèle de données.
- Cas d'utilisation.
- Parcours utilisateur.
- Séquence de connexion.
- Séquence de création de publication.
- Séquence like/commentaire.
- Séquence follow/unfollow.

## Points techniques à savoir expliquer

- Pourquoi utiliser Next.js pour le frontend.
- Pourquoi séparer le backend avec Express.
- Pourquoi utiliser PostgreSQL.
- Pourquoi utiliser Prisma.
- Comment fonctionne le JWT.
- Comment les routes protégées récupèrent l'utilisateur connecté.
- Comment le backend empêche de modifier le contenu d'un autre utilisateur.
- Comment la contrainte unique empêche les likes en double.
- Comment les fichiers uploadés sont validés.
- Pourquoi les uploads sont stockés localement pour la démo, et pourquoi un
  stockage externe est nécessaire en production.
- Comment l'interface reste responsive.

## Utilisation de l'IA

Tu peux expliquer que l'assistant IA a été utilisé comme outil d'aide au développement, de structuration et de documentation.

Ce qu'il faut assumer clairement :

- L'IA a aidé à accélérer certaines tâches.
- Le projet reste sous ta responsabilité.
- Tu dois être capable d'expliquer le code.
- Tu dois être capable de refaire ou corriger une partie devant le jury.
- Tu ne présentes pas l'IA comme le développeur du projet.

Formulation possible :

> J'ai utilisé un assistant IA comme support, un peu comme une documentation interactive. Il m'a aidé à structurer, corriger et documenter, mais j'ai gardé la responsabilité des choix techniques et je suis capable d'expliquer le fonctionnement de l'application.

## Checklist finale avant envoi

- [ ] Le projet démarre en local.
- [ ] Le backend répond sur `/health`.
- [ ] Le frontend affiche l'application.
- [ ] La connexion fonctionne.
- [ ] Les fonctionnalités sociales fonctionnent.
- [ ] Les uploads fonctionnent.
- [ ] La limite du stockage local des uploads est expliquée au jury.
- [ ] Les tests passent.
- [ ] Le build passe.
- [ ] Le README est complet.
- [ ] Les fichiers `.env` ne sont pas envoyés sur GitHub.
- [ ] Les diagrammes s'affichent sur GitHub.
- [ ] Le dépôt GitHub est public ou accessible au jury.
- [ ] La branche `main` contient la version stable.
- [ ] La branche `develop` existe.
- [ ] Le tag RNCP existe.
