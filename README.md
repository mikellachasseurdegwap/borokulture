# BORO KULTURE

BORO KULTURE est une application de réseau social premium orientée créateurs.
Le projet met en avant une expérience dark mode inspirée des plateformes
créatives modernes, avec une identité visuelle chaude, orange et culturelle.

L'objectif RNCP est de présenter une application full-stack réaliste : un
frontend Next.js, une API Express, une base PostgreSQL pilotée avec Prisma, une
authentification JWT et de vraies fonctionnalités sociales persistées.

## Stack technique

- Next.js
- TypeScript
- React
- Tailwind CSS
- Framer Motion
- Lucide React
- shadcn/ui
- Express
- Prisma
- PostgreSQL
- JWT
- Multer
- Jest
- Supertest

## Fonctionnalités disponibles

- Inscription et connexion utilisateur.
- Authentification JWT.
- Page de présentation BORO après inscription.
- Feed social paginé avec bouton `Charger plus`.
- Création de publications texte et/ou images.
- Upload d'images de posts en `jpg`, `png`, `webp`.
- Modification et suppression de ses propres publications.
- Likes persistés avec protection contre les doublons.
- Commentaires persistés.
- Suppression de ses propres commentaires.
- Follow / unfollow entre utilisateurs.
- Recherche d'utilisateurs.
- Pages de profil publiques.
- Profil connecté complet.
- Modification du nom, username, bio, avatar et couverture.
- Ajustement du cadrage de la photo de profil.
- Déconnexion depuis les paramètres du profil.
- États vides propres quand aucune donnée n'existe.
- Design responsive desktop et mobile.

## Sécurité mise en place

- Mots de passe hashés avec `bcrypt`.
- Authentification par JWT.
- Routes sensibles protégées par middleware d'authentification.
- Vérification côté backend avant modification ou suppression d'un post.
- Vérification côté backend avant suppression d'un commentaire.
- Contrainte unique en base pour empêcher plusieurs likes du même utilisateur.
- Contrainte unique en base pour empêcher les doublons de follow.
- Protection contre le self-follow.
- Validation des formats d'images acceptés.
- Limite de taille sur les uploads.
- CORS limité via `CLIENT_URL`.
- Rate limiting simple sur :
  - connexion ;
  - inscription ;
  - création de publication ;
  - création de commentaire.

## Limites connues

- Les tokens sont stockés en `localStorage`. C'est suffisant pour la démo RNCP,
  mais une production plus robuste devrait utiliser des cookies HTTP-only.
- Les uploads sont stockés localement dans `public/uploads`.
- Le stockage local des images n'est pas durable sur une plateforme stateless.
- Il n'y a pas encore de page admin ou de modération.
- Il n'y a pas encore de notifications temps réel.
- Il n'y a pas encore de système de sauvegarde de posts.
- Le feed utilise un bouton `Charger plus`, pas un infinite scroll.
- La couverture de tests est ciblée, mais pas exhaustive.

## Ce qui reste à faire pour une vraie production

- Remplacer `localStorage` par une stratégie de session plus sécurisée.
- Migrer les uploads vers Cloudinary, Amazon S3, Supabase Storage ou Vercel Blob.
- Ajouter une page admin pour gérer les comptes, posts et contenus signalés.
- Ajouter de la modération et éventuellement un système de signalement.
- Ajouter des logs applicatifs structurés.
- Ajouter une supervision des erreurs.
- Ajouter des tests end-to-end sur les parcours critiques.
- Ajouter un seed avec images hébergées durablement.
- Préparer un déploiement complet frontend + backend + base de données.

## Installation

```bash
npm install
```

## Variables d'environnement

Créer un fichier `.env` à partir de `.env.example`.

Variables principales :

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/boro_kulture"
JWT_SECRET="votre_secret_jwt"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001"
PORT=3001
```

`CLIENT_URL` sert à limiter les origines autorisées par CORS. En développement,
le backend autorise aussi `http://localhost:3000` et `http://127.0.0.1:3000`
pour faciliter la démo locale. En production, il faut renseigner l'URL réelle
du frontend afin de ne pas accepter les requêtes venant de n'importe quel site.

## Base de données

Appliquer les migrations Prisma :

```bash
npx prisma migrate dev
```

Générer le client Prisma si nécessaire :

```bash
npx prisma generate
```

## Démo avec seed

Créer un jeu de données de démonstration :

```bash
npm run prisma:seed
```

Le seed crée plusieurs comptes, publications, likes, commentaires et abonnements.
Tous les comptes de démonstration utilisent le mot de passe `Password123!`.

Comptes de démonstration :

- `mikel@borokulture.demo`
- `aya@borokulture.demo`
- `koffi@borokulture.demo`
- `lina@borokulture.demo`

## Lancement du projet

Lancer le backend et le frontend :

```bash
npm run dev
```

Ou séparément :

```bash
npm run dev:backend
npm run dev:frontend
```

Par défaut :

- Frontend : http://localhost:3000
- Backend : http://localhost:3001
- Health check API : http://localhost:3001/health

## Tests

Lancer les tests :

```bash
npm test
```

Lancer les tests en série, recommandé pour la validation RNCP :

```bash
npm test -- --runInBand
```

## Build

Vérifier que le frontend compile :

```bash
npm run build
```

## Gestion des uploads

Les images de profil, couvertures et images de posts sont stockées localement
dans `public/uploads` via Multer. Ce choix est volontaire pour la démo RNCP :
il permet de tester simplement les uploads en local sans service externe.

Limites :

- `public/uploads` est ignoré par Git.
- Les fichiers uploadés ne doivent pas être considérés comme persistants sur une
  plateforme stateless comme Vercel.
- En production réelle, il faut remplacer ce stockage local par un service dédié.

Évolution prévue :

- conserver les validations actuelles côté backend (`jpg`, `png`, `webp`, taille maximum) ;
- envoyer les fichiers vers un stockage externe ;
- enregistrer en base uniquement l'URL publique retournée par le service ;
- prévoir la suppression des anciens fichiers lors du remplacement d'un avatar,
  d'une couverture ou d'une publication.

## Structure du projet

- `app/` : pages Next.js.
- `components/` : composants React.
- `lib/` : helpers frontend.
- `src/` : API Express.
- `prisma/` : schéma, migrations et seed.
- `public/` : assets publics.
- `tests/` : tests automatisés.
- `docs/` : documentation RNCP.

## Documentation RNCP

- [Contexte du projet](docs/01-contexte-rncp.md)
- [Diagrammes de conception](docs/02-diagrammes.md)
- [Documentation API](docs/03-api.md)
- [Démo de soutenance](docs/04-demo-soutenance.md)
- [Plan de mémoire](docs/05-plan-memoire.md)
- [Checklist RNCP](docs/06-checklist-rncp.md)

## Notes RNCP

Le projet met en avant :

- une architecture full-stack séparée ;
- une base de données relationnelle ;
- une authentification sécurisée côté backend ;
- des règles métier protégées côté serveur ;
- une interface responsive ;
- une direction artistique cohérente ;
- des tests automatisés ;
- une documentation de conception et de soutenance.
