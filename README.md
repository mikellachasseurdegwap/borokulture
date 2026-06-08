# BORO KULTURE

BORO KULTURE est une application de réseau social premium orientée créateurs. Le projet propose une expérience dark mode moderne avec authentification, profils utilisateurs, feed social, publications, likes, commentaires, abonnements et upload d'images de profil.

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

## Fonctionnalités

- Inscription et connexion utilisateur
- Authentification JWT
- Profil utilisateur complet
- Modification du nom, de la bio, de l'avatar et de la couverture
- Ajustement du cadrage de la photo de profil
- Upload d'images `jpg`, `png`, `webp` avec limite de taille
- Feed social responsive
- Création de publications
- Upload d'images dans les publications
- Modification et suppression de ses propres publications
- Likes persistés avec protection contre les doublons
- Commentaires persistés
- Suppression de ses propres commentaires
- Follow / unfollow entre utilisateurs
- Recherche d'utilisateurs
- Pages de profil publiques

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

Le backend applique aussi un rate limiting simple sur les routes sensibles :
connexion, inscription, création de publication et création de commentaire. Cela
réduit les risques de brute force et de spam pendant la démo et en préproduction.

## Base de données

Appliquer les migrations Prisma :

```bash
npx prisma migrate dev
```

Générer le client Prisma si nécessaire :

```bash
npx prisma generate
```

Créer un jeu de données de démonstration :

```bash
npm run prisma:seed
```

Le seed crée plusieurs comptes, publications, likes, commentaires et abonnements.
Tous les comptes de démonstration utilisent le mot de passe `Password123!`.

## Lancement en développement

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

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```

## Gestion des uploads

Les images de profil, couvertures et images de posts sont stockées localement
dans `public/uploads` via Multer. Ce choix est volontaire pour la démo RNCP :
il permet de tester simplement les uploads en local sans service externe.

Limites connues :

- `public/uploads` est ignoré par Git.
- Les fichiers uploadés ne doivent pas être considérés comme persistants sur une
  plateforme stateless comme Vercel.
- En production réelle, il faut remplacer ce stockage local par un service dédié
  comme Cloudinary, Amazon S3, Supabase Storage ou Vercel Blob.

Évolution prévue pour la production :

- conserver les validations actuelles côté backend (`jpg`, `png`, `webp`, taille maximum) ;
- envoyer les fichiers vers un stockage externe ;
- enregistrer en base uniquement l'URL publique retournée par le service ;
- prévoir la suppression des anciens fichiers lors du remplacement d'un avatar,
  d'une couverture ou d'une publication.

## Structure du projet

- `app/` : pages Next.js
- `components/` : composants React
- `lib/` : helpers frontend
- `src/` : API Express
- `prisma/` : schéma et migrations
- `public/` : assets publics
- `tests/` : tests automatisés

## Notes RNCP

Le projet met en avant une architecture full-stack avec séparation frontend/backend, persistance des données, authentification, sécurité des actions côté serveur, gestion des erreurs, responsive design et tests automatisés.

## Documentation RNCP

- [Contexte du projet](docs/01-contexte-rncp.md)
- [Diagrammes de conception](docs/02-diagrammes.md)
- [Documentation API](docs/03-api.md)
- [Démo de soutenance](docs/04-demo-soutenance.md)
- [Plan de mémoire](docs/05-plan-memoire.md)
- [Checklist RNCP](docs/06-checklist-rncp.md)
