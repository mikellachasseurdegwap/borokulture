import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const demoPassword = "Password123!";

const users = [
  {
    email: "mikel@borokulture.demo",
    username: "mikel",
    displayName: "Mikel",
    bio: "Fondateur de BORO KULTURE. Passionne par la culture ivoirienne, le design et les reseaux sociaux creatifs.",
    isVerified: true
  },
  {
    email: "aya@borokulture.demo",
    username: "aya.creative",
    displayName: "Aya Creative",
    bio: "Direction artistique, mode urbaine et inspiration Abidjan.",
    isVerified: true
  },
  {
    email: "koffi@borokulture.demo",
    username: "koffi.sound",
    displayName: "Koffi Sound",
    bio: "Beatmaker et curateur musical. Je partage les sons qui font bouger la ville.",
    isVerified: false
  },
  {
    email: "lina@borokulture.demo",
    username: "lina.photo",
    displayName: "Lina Photo",
    bio: "Photographe lifestyle. Portraits, rues, lumiere chaude et scenes de vie.",
    isVerified: false
  }
];

const posts = [
  {
    username: "mikel",
    content: "Bienvenue sur BORO KULTURE. L'objectif est simple : faire circuler les voix creatives et donner une vraie presence digitale aux talents ivoiriens."
  },
  {
    username: "aya.creative",
    content: "Moodboard du jour : orange, texture, soleil, energie d'Abidjan. Une identite visuelle doit se ressentir avant meme d'etre expliquee."
  },
  {
    username: "koffi.sound",
    content: "Je travaille sur une playlist BORO pour accompagner les sessions creation. Afro, coupe-decale, rap ivoire et inspirations club."
  },
  {
    username: "lina.photo",
    content: "La rue raconte deja beaucoup. Un bon profil createur doit montrer une atmosphere, pas seulement une photo."
  },
  {
    username: "mikel",
    content: "Test du feed social : publications, likes, commentaires, follows et profils publics. La base du reseau est en place."
  }
];

const comments = [
  {
    postIndex: 0,
    username: "aya.creative",
    content: "C'est exactement l'energie qu'il faut pour la communaute."
  },
  {
    postIndex: 0,
    username: "koffi.sound",
    content: "Pret a envoyer les premiers sons dans le feed."
  },
  {
    postIndex: 1,
    username: "lina.photo",
    content: "La palette colle bien a l'identite BORO."
  },
  {
    postIndex: 2,
    username: "mikel",
    content: "Cette playlist peut devenir un vrai format recurrent."
  }
];

const follows = [
  ["mikel", "aya.creative"],
  ["mikel", "koffi.sound"],
  ["aya.creative", "mikel"],
  ["aya.creative", "lina.photo"],
  ["koffi.sound", "mikel"],
  ["lina.photo", "aya.creative"]
];

const likes = [
  ["aya.creative", 0],
  ["koffi.sound", 0],
  ["lina.photo", 0],
  ["mikel", 1],
  ["koffi.sound", 1],
  ["mikel", 2],
  ["aya.creative", 2],
  ["mikel", 3],
  ["aya.creative", 4],
  ["lina.photo", 4]
];

async function main() {
  const password = await bcrypt.hash(demoPassword, 12);
  const createdUsers = new Map();

  for (const user of users) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        isVerified: user.isVerified
      },
      create: {
        ...user,
        password
      }
    });

    createdUsers.set(user.username, createdUser);
  }

  const createdPosts = [];

  for (const post of posts) {
    const author = createdUsers.get(post.username);

    if (!author) {
      throw new Error(`Utilisateur introuvable pour le post : ${post.username}`);
    }

    const existingPost = await prisma.post.findFirst({
      where: {
        userId: author.id,
        content: post.content
      }
    });

    if (existingPost) {
      createdPosts.push(existingPost);
      continue;
    }

    const createdPost = await prisma.post.create({
      data: {
        content: post.content,
        userId: author.id
      }
    });

    createdPosts.push(createdPost);
  }

  for (const [followerUsername, followingUsername] of follows) {
    const follower = createdUsers.get(followerUsername);
    const following = createdUsers.get(followingUsername);

    if (!follower || !following || follower.id === following.id) {
      continue;
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: follower.id,
          followingId: following.id
        }
      },
      update: {},
      create: {
        followerId: follower.id,
        followingId: following.id
      }
    });
  }

  for (const [username, postIndex] of likes) {
    const user = createdUsers.get(username);
    const post = createdPosts[postIndex];

    if (!user || !post) {
      continue;
    }

    await prisma.like.upsert({
      where: {
        userId_postId: {
          userId: user.id,
          postId: post.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        postId: post.id
      }
    });
  }

  for (const comment of comments) {
    const user = createdUsers.get(comment.username);
    const post = createdPosts[comment.postIndex];

    if (!user || !post) {
      continue;
    }

    const existingComment = await prisma.comment.findFirst({
      where: {
        userId: user.id,
        postId: post.id,
        content: comment.content
      }
    });

    if (existingComment) {
      continue;
    }

    await prisma.comment.create({
      data: {
        userId: user.id,
        postId: post.id,
        content: comment.content
      }
    });
  }

  console.log("Seed demo BORO KULTURE termine.");
  console.log(`Comptes demo crees avec le mot de passe : ${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
