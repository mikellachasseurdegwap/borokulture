# Documentation API

## Authentification

| Méthode | Route | Protection | Description |
|---|---|---|---|
| POST | `/auth/register` | Non | Créer un compte |
| POST | `/auth/login` | Non | Se connecter |
| GET | `/auth/me` | JWT | Récupérer le profil connecté |
| PATCH | `/auth/me` | JWT | Modifier le profil connecté |

### Données modifiables du profil

- `username`
- `displayName`
- `bio`
- `avatar`
- `cover`

Les images acceptées sont : `jpg`, `png`, `webp`.
La taille maximum est de 2 Mo par image.

## Publications

| Méthode | Route | Protection | Description |
|---|---|---|---|
| GET | `/posts` | JWT | Lister les publications |
| POST | `/posts` | JWT | Créer une publication |
| PATCH | `/posts/:postId` | JWT | Modifier sa publication |
| DELETE | `/posts/:postId` | JWT | Supprimer sa publication |

Règles de sécurité :

- Un utilisateur ne peut modifier que ses propres posts.
- Un utilisateur ne peut supprimer que ses propres posts.

## Likes

| Méthode | Route | Protection | Description |
|---|---|---|---|
| POST | `/posts/:postId/likes` | JWT | Liker une publication |
| DELETE | `/posts/:postId/likes` | JWT | Retirer son like |

Règles :

- Un utilisateur ne peut liker une même publication qu'une seule fois.
- La contrainte unique est gérée en base avec `userId` + `postId`.

## Commentaires

| Méthode | Route | Protection | Description |
|---|---|---|---|
| POST | `/posts/:postId/comments` | JWT | Ajouter un commentaire |
| DELETE | `/posts/:postId/comments/:commentId` | JWT | Supprimer son commentaire |

Règles :

- Un utilisateur connecté peut commenter une publication.
- Un utilisateur ne peut supprimer que ses propres commentaires.

## Recherche et profils publics

| Méthode | Route | Protection | Description |
|---|---|---|---|
| GET | `/search/users?q=...` | JWT | Rechercher des utilisateurs |
| GET | `/search/users/:username` | JWT | Voir un profil public |
| GET | `/search/users/:username/posts` | JWT | Voir les posts d'un utilisateur |
| POST | `/search/users/:username/follow` | JWT | Suivre un utilisateur |
| DELETE | `/search/users/:username/follow` | JWT | Ne plus suivre un utilisateur |

Règles :

- Un utilisateur ne peut pas se suivre lui-même.
- Une relation follow est unique entre deux utilisateurs.
