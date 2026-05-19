# Diagrammes de conception

## Architecture générale

```mermaid
flowchart LR
    U[Utilisateur] --> B[Navigateur]
    B --> F[Frontend Next.js]
    F --> A[API Express]
    A --> P[Prisma ORM]
    P --> D[(PostgreSQL)]
    A --> S[Stockage local uploads]

    subgraph Frontend
      F
      C[Composants React]
      T[Tailwind CSS]
    end

    subgraph Backend
      A
      M[Middlewares auth/upload/erreur]
      R[Routes API]
      CT[Controllers]
    end

    F --> C
    C --> T
    A --> M
    A --> R
    R --> CT
```

## Modèle de données

```mermaid
erDiagram
    User ||--o{ Post : cree
    User ||--o{ Like : aime
    User ||--o{ Comment : commente
    User ||--o{ Follow : suit
    User ||--o{ Follow : est_suivi
    Post ||--o{ Like : recoit
    Post ||--o{ Comment : contient

    User {
        string id PK
        string email UK
        string username UK
        string displayName
        string bio
        string avatarUrl
        string coverUrl
        boolean isVerified
        string password
        datetime createdAt
        datetime updatedAt
    }

    Post {
        string id PK
        string content
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    Like {
        string id PK
        string userId FK
        string postId FK
        datetime createdAt
    }

    Comment {
        string id PK
        string content
        string userId FK
        string postId FK
        datetime createdAt
        datetime updatedAt
    }

    Follow {
        string id PK
        string followerId FK
        string followingId FK
        datetime createdAt
    }
```

## Classes principales côté métier

```mermaid
classDiagram
    class User {
      +String id
      +String email
      +String username
      +String displayName
      +String bio
      +String avatarUrl
      +String coverUrl
      +Boolean isVerified
      +DateTime createdAt
    }

    class Post {
      +String id
      +String content
      +DateTime createdAt
      +DateTime updatedAt
    }

    class Like {
      +String id
      +DateTime createdAt
    }

    class Comment {
      +String id
      +String content
      +DateTime createdAt
      +DateTime updatedAt
    }

    class Follow {
      +String id
      +DateTime createdAt
    }

    User "1" --> "*" Post : publie
    User "1" --> "*" Like : ajoute
    User "1" --> "*" Comment : ecrit
    User "1" --> "*" Follow : suit
    Post "1" --> "*" Like : recoit
    Post "1" --> "*" Comment : contient
```

## Cas d'utilisation principaux

```mermaid
flowchart TB
    Actor[Utilisateur]

    Actor --> UC1[Créer un compte]
    Actor --> UC2[Se connecter]
    Actor --> UC3[Modifier son profil]
    Actor --> UC4[Créer une publication]
    Actor --> UC5[Modifier sa publication]
    Actor --> UC6[Supprimer sa publication]
    Actor --> UC7[Liker une publication]
    Actor --> UC8[Commenter une publication]
    Actor --> UC9[Supprimer son commentaire]
    Actor --> UC10[Suivre un utilisateur]
    Actor --> UC11[Rechercher un utilisateur]
    Actor --> UC12[Consulter un profil public]

    UC2 --> Auth[Authentification JWT]
    UC3 --> Auth
    UC4 --> Auth
    UC5 --> Auth
    UC6 --> Auth
    UC7 --> Auth
    UC8 --> Auth
    UC9 --> Auth
    UC10 --> Auth
```

## Parcours utilisateur

```mermaid
flowchart LR
    A[Arrivée sur l'application] --> B{Compte existant ?}
    B -- Non --> C[Inscription]
    B -- Oui --> D[Connexion]
    C --> E[Profil utilisateur]
    D --> E
    E --> F[Modifier profil]
    E --> G[Accéder au feed]
    G --> H[Créer une publication]
    G --> I[Liker/commenter]
    G --> J[Rechercher un utilisateur]
    J --> K[Profil public]
    K --> L[Follow/unfollow]
```

## Séquence de connexion

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend Next.js
    participant A as API Express
    participant D as PostgreSQL

    U->>F: Saisit email et mot de passe
    F->>A: POST /auth/login
    A->>D: Recherche utilisateur par email
    D-->>A: Utilisateur trouvé
    A->>A: Vérifie le mot de passe avec bcrypt
    A->>A: Génère un JWT
    A-->>F: Token + données utilisateur
    F->>F: Stocke le token
    F-->>U: Redirection vers le profil
```

## Séquence création de publication

```mermaid
sequenceDiagram
    participant U as Utilisateur connecté
    participant F as Frontend
    participant A as API Express
    participant D as PostgreSQL

    U->>F: Rédige une publication
    F->>A: POST /posts avec JWT
    A->>A: Vérifie le token
    A->>D: Crée le post
    D-->>A: Post créé
    A-->>F: Publication complète
    F-->>U: Ajout du post dans le feed sans rechargement
```

## Séquence like/commentaire

```mermaid
sequenceDiagram
    participant U as Utilisateur connecté
    participant F as Frontend
    participant A as API Express
    participant D as PostgreSQL

    U->>F: Clique sur like
    F->>A: POST /posts/:id/likes
    A->>A: Vérifie le token
    A->>D: Crée un like unique userId/postId
    D-->>A: Like enregistré
    A-->>F: Etat like + compteur

    U->>F: Ajoute un commentaire
    F->>A: POST /posts/:id/comments
    A->>D: Crée le commentaire
    D-->>A: Commentaire enregistré
    A-->>F: Commentaire + compteur
```

## Séquence follow/unfollow

```mermaid
sequenceDiagram
    participant U as Utilisateur connecté
    participant F as Frontend
    participant A as API Express
    participant D as PostgreSQL

    U->>F: Clique sur Suivre
    F->>A: POST /search/users/:username/follow
    A->>A: Vérifie que l'utilisateur ne se suit pas lui-même
    A->>D: Crée la relation Follow
    D-->>A: Relation créée
    A-->>F: Etat abonné + compteur abonnés

    U->>F: Clique sur Abonné
    F->>A: DELETE /search/users/:username/follow
    A->>D: Supprime la relation Follow
    D-->>A: Relation supprimée
    A-->>F: Etat non abonné + compteur abonnés
```
