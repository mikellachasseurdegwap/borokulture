# Démo de soutenance RNCP

## Préparation avant la démo

- Vérifier que PostgreSQL est lancé.
- Vérifier que le fichier `.env` est présent.
- Appliquer les migrations Prisma.
- Lancer le backend.
- Lancer le frontend.
- Préparer deux comptes utilisateurs pour tester le follow.

## Commandes utiles

```bash
npm install
npx prisma migrate dev
npm run dev:backend
npm run dev:frontend
```

## Scénario de démonstration

1. Ouvrir l'application.
2. Présenter rapidement l'accueil BORO KULTURE.
3. Créer un compte ou se connecter avec un compte de test.
4. Aller sur le profil.
5. Modifier le nom, la bio, l'avatar et la couverture.
6. Aller dans le feed.
7. Créer une publication.
8. Liker une publication.
9. Ajouter un commentaire.
10. Supprimer son commentaire.
11. Modifier sa publication.
12. Supprimer sa publication avec confirmation.
13. Rechercher un utilisateur.
14. Ouvrir un profil public.
15. Suivre puis ne plus suivre l'utilisateur.
16. Montrer rapidement le dépôt GitHub.

## Points à expliquer au jury

- Pourquoi Next.js pour le frontend.
- Pourquoi Express pour séparer l'API.
- Pourquoi PostgreSQL et Prisma.
- Comment fonctionne JWT.
- Comment les routes sont protégées.
- Comment les droits sont vérifiés côté backend.
- Comment les images sont validées et uploadées.
- Comment les relations sociales sont modélisées.
- Comment Git a été organisé.

## Questions possibles

### Comment empêches-tu un utilisateur de modifier le post d'un autre ?

Le backend vérifie l'identifiant de l'utilisateur connecté à partir du JWT. Avant toute modification ou suppression, il compare `req.userId` avec `post.userId`. Si les deux valeurs ne correspondent pas, l'API renvoie une erreur 403.

### Comment évites-tu les likes en double ?

La table `Like` possède une contrainte unique sur le couple `userId` et `postId`. Même si une requête est envoyée plusieurs fois, la base empêche les doublons.

### Comment empêches-tu le self-follow ?

Avant de créer une relation `Follow`, le backend vérifie que l'identifiant du compte ciblé est différent de l'identifiant de l'utilisateur connecté.

### Comment sont stockées les images ?

Les images uploadées sont validées par Multer. Les formats autorisés sont `jpg`, `png` et `webp`. La taille est limitée à 2 Mo. Les fichiers sont placés dans `public/uploads/profiles` et l'URL est stockée en base de données.

## Checklist avant soutenance

- [ ] Le backend démarre sans erreur.
- [ ] Le frontend démarre sans erreur.
- [ ] Les migrations Prisma sont appliquées.
- [ ] Les comptes de test existent.
- [ ] La connexion fonctionne.
- [ ] La modification du profil fonctionne.
- [ ] L'upload avatar/couverture fonctionne.
- [ ] La création de post fonctionne.
- [ ] Likes/commentaires fonctionnent.
- [ ] Follow/unfollow fonctionne.
- [ ] Le dépôt GitHub est accessible.
- [ ] Le README est clair.
- [ ] Les diagrammes sont prêts.
- [ ] Le diaporama est prêt.
