"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  AudioLines,
  Layers3,
  Palette,
  Sparkles,
  Users,
  Wand2
} from "lucide-react";

const reveal: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" }
  }
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12
    }
  }
};

const cultureNotes = [
  "BORO feed",
  "BORO profils",
  "BORO signal",
  "BORO communauté"
];

const manifesto = [
  {
    title: "Exprimer",
    text: "BORO KULTURE donne une scène aux voix créatives : textes, images, idées, inspirations, coups de cœur et visions culturelles."
  },
  {
    title: "Relier",
    text: "La plateforme rassemble les créateurs, les publics et les communautés autour d'une même énergie : faire circuler la culture."
  },
  {
    title: "Élever",
    text: "BORO KULTURE transforme le feed, le profil et les publications en espace de reconnaissance pour la créativité africaine."
  }
];

const identityCards = [
  {
    label: "Vision",
    title: "Faire exister une scène culturelle digitale forte.",
    text: "BORO KULTURE veut donner à la jeunesse créative un lieu reconnaissable, beau, vivant et construit pour valoriser ses idées."
  },
  {
    label: "Univers",
    title: "Une identité chaude, expressive et impossible à confondre.",
    text: "Orange, pink, glow, typographie forte, textures, mouvement : tout doit faire sentir BORO KULTURE dès les premières secondes."
  },
  {
    label: "Mouvement",
    title: "Une communauté avant tout.",
    text: "La marque existe pour connecter, encourager et faire grandir les créateurs qui portent une culture moderne, locale et ambitieuse."
  }
];

const platformPillars = [
  { icon: Sparkles, name: "BORO Feed", level: "Le fil d'actualité devient le cœur vivant du mouvement : posts, signaux, images et prises de parole." },
  { icon: Users, name: "BORO Profils", level: "Chaque profil devient une présence culturelle, pas seulement un compte utilisateur." },
  { icon: Palette, name: "BORO Universe", level: "Orange, pink, glow, textures et typographie construisent une signature reconnaissable." },
  { icon: AudioLines, name: "BORO Signal", level: "La plateforme diffuse l'énergie d'Abidjan, de la musique, de la mode et de l'art digital." },
  { icon: Layers3, name: "BORO System", level: "Home, feed, profil, publication et navigation doivent fusionner dans un même territoire." },
  { icon: Wand2, name: "BORO Movement", level: "BORO KULTURE existe comme un mouvement culturel avant d'être une interface." }
];

function HeroScene() {
  return (
    <section className="bk-hero">
      <div className="bk-hero__inner">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="bk-hero__copy"
        >
          <motion.h1 variants={reveal} className="bk-display">
            BORO KULTURE fait circuler les voix créatives.
          </motion.h1>

          <motion.p variants={reveal} className="bk-lead">
            Une plateforme culturelle ivoirienne pour publier, découvrir, connecter et donner une présence forte aux créateurs dans un univers chaud, artistique et vivant.
          </motion.p>

          <motion.div variants={reveal} className="bk-actions">
            <Link href="/register" className="bk-action bk-action--primary">
              <span>Entrer dans l'univers</span>
              <ArrowUpRight size={20} />
            </Link>
            <Link href="/feed" className="bk-action bk-action--secondary">
              <span>Voir le feed</span>
              <ArrowDownRight size={19} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function CultureSection() {
  return (
    <section className="bk-section bk-culture">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={stagger}
        className="bk-culture__layout"
      >
        <motion.div variants={reveal} className="bk-section-label">
          Culture vivante
        </motion.div>

        <motion.h2 variants={reveal} className="bk-section-title">
          BORO KULTURE transforme le feed en scène culturelle ivoirienne.
        </motion.h2>

        <motion.div variants={reveal} className="bk-culture__essay">
          <p>
            BORO KULTURE n'est pas pensé comme une page froide. C'est un espace de présence : un endroit où une publication devient un signal culturel et où chaque profil peut porter une esthétique.
          </p>
          <p>
            L'univers vient d'Abidjan, de la musique, de la mode, de la rue, des clips, des images et de cette envie de donner à la culture ivoirienne une interface qui a du caractère.
          </p>
        </motion.div>

        <div className="bk-notes">
          {cultureNotes.map((note, index) => (
            <motion.div
              key={note}
              variants={reveal}
              whileHover={{ y: -8, rotate: index % 2 === 0 ? -1.5 : 1.5 }}
              className="bk-note"
            >
              <span>0{index + 1}</span>
              {note}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function IdentitySection() {
  return (
    <section className="bk-section bk-identity">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="bk-identity__header"
      >
        <motion.div variants={reveal} className="bk-section-label">
          Identité
        </motion.div>
        <motion.h2 variants={reveal} className="bk-statement">
          Une marque culturelle qui vit comme un mouvement.
        </motion.h2>
      </motion.div>

      <div className="bk-identity__cards">
        {identityCards.map((card, index) => (
          <motion.article
            key={card.label}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={reveal}
            whileHover={{ y: -10 }}
            className="bk-identity-card"
            style={{ rotate: index === 1 ? "1.4deg" : index === 2 ? "-1deg" : "-1.7deg" }}
          >
            <span>{card.label}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={reveal}
        className="bk-manifesto"
      >
        {manifesto.map((item) => (
          <div key={item.title} className="bk-manifesto__item">
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

function EcosystemSection() {
  return (
    <section className="bk-section bk-ecosystem">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="bk-ecosystem__intro"
      >
        <motion.div variants={reveal} className="bk-section-label">
          Écosystème BORO
        </motion.div>
        <motion.h2 variants={reveal} className="bk-section-title">
          Tout doit fusionner : marque, feed, profils, culture et communauté.
        </motion.h2>
      </motion.div>

      <div className="bk-ecosystem-board">
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bk-ecosystem-board__radar"
        >
          <Sparkles size={42} />
          <span>boro kulture</span>
          <strong>culture system</strong>
        </motion.div>

        <div className="bk-ecosystem-grid">
          {platformPillars.map((skill, index) => {
            const Icon = skill.icon;
            return (
              <motion.article
                key={skill.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.05 }}
                whileHover={{ y: -7, scale: 1.015 }}
                className="bk-ecosystem-card"
              >
                <Icon size={24} />
                <h3>{skill.name}</h3>
                <p>{skill.level}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FinalSection() {
  return (
    <section className="bk-final">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7 }}
        className="bk-final__inner"
      >
        <Sparkles size={24} />
        <h2>BORO KULTURE commence ici : un feed, des profils, une culture qui circule.</h2>
        <div className="bk-actions bk-actions--center">
          <Link href="/register" className="bk-action bk-action--primary">
            <span>Créer mon profil</span>
            <ArrowUpRight size={20} />
          </Link>
          <Link href="/feed" className="bk-action bk-action--secondary">
            <span>Explorer d'abord</span>
            <ArrowDownRight size={19} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="boro-home">
      <div className="bk-noise" aria-hidden="true" />
      <HeroScene />
      <CultureSection />
      <IdentitySection />
      <EcosystemSection />
      <FinalSection />
    </main>
  );
}
