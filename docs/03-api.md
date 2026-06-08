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
- `avatarPositionX`
- `avatarPositionY`
- `avatarScale`
- `cover`

Les images acceptées sont : `jpg`, `png`, `webp`.
La taille maximum est de 2 Mo par image.

En démo locale, les fichiers sont enregistrés dans `public/uploads/profiles`.
Ce stockage local n'est pas adapté à une production stateless : pour une mise en
ligne réelle, il devra être remplacé par un stockage externe durable.

Les valeurs de recadrage avatar permettent d'ajuster l'image dans le cercle :

- `avatarPositionX` : position horizontale de 0 à 100.
- `avatarPositionY` : position verticale de 0 à 100.
- `avatarScale` : zoom de 1 à 2.

## Publications

| Méthode | Route | Protection | Description |
|---|---|---|---|
| GET | `/posts` | JWT | Lister les publications |
| POST | `/posts` | JWT | Créer une publication avec texte et/ou images |
| PATCH | `/posts/:postId` | JWT | Modifier sa publication |
| DELETE | `/posts/:postId` | JWT | Supprimer sa publication |

La création d'une publication accepte :

- `content` : texte de la publication.
- `media` : images optionnelles en `multipart/form-data`.

Formats acceptés pour les images de posts :

- `jpg`
- `png`
- `webp`

Limites :

- 4 images maximum par publication.
- 5 Mo maximum par image.

En démo locale, les fichiers sont enregistrés dans `public/uploads/posts`. Ce
choix est suffisant pour tester le parcours utilisateur en local, mais une vraie
production devra utiliser Cloudinary, S3, Supabase Storage ou Vercel Blob.

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
