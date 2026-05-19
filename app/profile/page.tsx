"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, type PointerEvent, type WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Copy,
  Edit3,
  FileText,
  Home,
  ImagePlus,
  Loader2,
  Menu,
  Minus,
  Move,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  Sparkles,
  User,
  X
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { PostCard } from "@/components/social/post-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import api, { type ApiError } from "@/lib/api";
import { getAvatarImageStyle } from "@/lib/avatar-style";
import { isAuthenticated } from "@/lib/auth";
import { type MeResponse, type Post, type PostsResponse, type SocialUser } from "@/lib/social-types";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Feed", icon: Sparkles, href: "/feed" },
  { label: "Profil", icon: User, href: "/profile", active: true },
  { label: "Parametres", icon: Settings, href: "/profile", settings: true }
];

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
};

const getInitials = (name?: string | null) => {
  return (name || "U").slice(0, 2).toUpperCase();
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export default function ProfilePage() {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftDisplayName, setDraftDisplayName] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [draftAvatarPositionX, setDraftAvatarPositionX] = useState(50);
  const [draftAvatarPositionY, setDraftAvatarPositionY] = useState(50);
  const [draftAvatarScale, setDraftAvatarScale] = useState(1);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const avatarFrameRef = useRef<HTMLDivElement>(null);
  const avatarDragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startPositionX: 50,
    startPositionY: 50
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [{ data: meData }, { data: postsData }] = await Promise.all([
          api.get<MeResponse>("/auth/me"),
          api.get<PostsResponse>("/posts")
        ]);

        setUser(meData.user);
        setDraftUsername(meData.user.username);
        setDraftDisplayName(meData.user.displayName || "");
        setDraftBio(meData.user.bio || "");
        setDraftAvatarPositionX(meData.user.avatarPositionX ?? 50);
        setDraftAvatarPositionY(meData.user.avatarPositionY ?? 50);
        setDraftAvatarScale(meData.user.avatarScale ?? 1);
        setPosts(postsData.posts);
      } catch (requestError) {
        const apiError = requestError as ApiError;
        setError(apiError.message || "Impossible de charger le profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  const userPosts = useMemo(() => {
    if (!user) {
      return [];
    }

    return posts.filter((post) => post.user.id === user.id);
  }, [posts, user]);

  const latestActivity = userPosts[0]?.createdAt ? formatDate(userPosts[0].createdAt) : null;
  const displayName = user?.displayName || user?.username || "Profil";
  const avatarPreviewSrc = avatarPreviewUrl || user?.avatarUrl;
  const avatarPreviewCrop = {
    avatarPositionX: draftAvatarPositionX,
    avatarPositionY: draftAvatarPositionY,
    avatarScale: draftAvatarScale
  };

  const stats = [
    { label: "Abonnes", value: String(user?.followerCount ?? 0) },
    { label: "Abonnements", value: String(user?.followingCount ?? 0) },
    { label: "Publications", value: String(userPosts.length) },
    { label: "Activite", value: latestActivity || "Aucune" }
  ];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Lien du profil copie");
    } catch {
      showToast("Lien du profil pret a partager");
    }
  };

  const validateImage = (file: File | null) => {
    if (!file) {
      return null;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return "Les images doivent etre au format jpg, png ou webp";
    }

    if (file.size > 2 * 1024 * 1024) {
      return "Chaque image doit faire 2 Mo maximum";
    }

    return null;
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = event.target.files?.[0] || null;
    const validationError = validateImage(file);

    if (validationError) {
      setEditorError(validationError);
      event.target.value = "";
      return;
    }

    setEditorError(null);
    if (type === "avatar") {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }

      setAvatarFile(file);
      setAvatarPreviewUrl(file ? URL.createObjectURL(file) : null);

      if (file) {
        setDraftAvatarPositionX(50);
        setDraftAvatarPositionY(50);
        setDraftAvatarScale(1);
      }

      return;
    }

    setCoverFile(file);
  };

  const updateAvatarScale = (delta: number) => {
    setDraftAvatarScale((value) => clamp(Number((value + delta).toFixed(2)), 1, 2));
  };

  const resetAvatarCrop = () => {
    setDraftAvatarPositionX(50);
    setDraftAvatarPositionY(50);
    setDraftAvatarScale(1);
  };

  const startAvatarDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!avatarPreviewSrc || !avatarFrameRef.current) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    avatarDragRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startPositionX: draftAvatarPositionX,
      startPositionY: draftAvatarPositionY
    };
  };

  const moveAvatar = (event: PointerEvent<HTMLDivElement>) => {
    const frame = avatarFrameRef.current;

    if (!avatarDragRef.current.isDragging || !frame) {
      return;
    }

    const bounds = frame.getBoundingClientRect();
    const deltaX = ((event.clientX - avatarDragRef.current.startX) / bounds.width) * 100;
    const deltaY = ((event.clientY - avatarDragRef.current.startY) / bounds.height) * 100;
    const sensitivity = 1 / draftAvatarScale;

    setDraftAvatarPositionX(clamp(avatarDragRef.current.startPositionX - deltaX * sensitivity, 0, 100));
    setDraftAvatarPositionY(clamp(avatarDragRef.current.startPositionY - deltaY * sensitivity, 0, 100));
  };

  const stopAvatarDrag = (event: PointerEvent<HTMLDivElement>) => {
    avatarDragRef.current.isDragging = false;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleAvatarWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    updateAvatarScale(event.deltaY < 0 ? 0.05 : -0.05);
  };

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const username = draftUsername.trim();
    if (!username) {
      setEditorError("Le username est requis");
      return;
    }

    const avatarError = validateImage(avatarFile);
    const coverError = validateImage(coverFile);
    if (avatarError || coverError) {
      setEditorError(avatarError || coverError);
      return;
    }

    try {
      setIsSaving(true);
      setEditorError(null);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("displayName", draftDisplayName.trim());
      formData.append("bio", draftBio.trim());
      formData.append("avatarPositionX", String(draftAvatarPositionX));
      formData.append("avatarPositionY", String(draftAvatarPositionY));
      formData.append("avatarScale", String(draftAvatarScale));

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      if (coverFile) {
        formData.append("cover", coverFile);
      }

      const { data } = await api.patch<MeResponse>("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setUser(data.user);
      setDraftUsername(data.user.username);
      setDraftDisplayName(data.user.displayName || "");
      setDraftBio(data.user.bio || "");
      setDraftAvatarPositionX(data.user.avatarPositionX ?? 50);
      setDraftAvatarPositionY(data.user.avatarPositionY ?? 50);
      setDraftAvatarScale(data.user.avatarScale ?? 1);
      setAvatarFile(null);
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
      setAvatarPreviewUrl(null);
      setCoverFile(null);
      setIsEditorOpen(false);
      showToast("Profil mis a jour");
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setEditorError(apiError.message || "Modification impossible");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePost = (updatedPost: Post) => {
    setPosts((currentPosts) => currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const deletePost = (postId: string) => {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    showToast("Publication supprimee");
  };

  const sidebar = (
    <div className="rounded-[28px] border border-white/[0.08] bg-[#121212]/88 p-3 shadow-2xl shadow-black/35 backdrop-blur-xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const itemClassName =
          "mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition " +
          (item.active
            ? "bg-[#FF6B00] text-black shadow-[0_0_28px_rgba(255,107,0,0.24)]"
            : "text-[#B3B3B3] hover:bg-white/[0.08] hover:text-white");

        if (item.settings) {
          return (
            <button key={item.label} type="button" onClick={() => { setIsSidebarOpen(false); setIsEditorOpen(true); }} className={itemClassName}>
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        }

        return (
          <Link key={item.label} href={item.href} onClick={() => setIsSidebarOpen(false)} className={itemClassName}>
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  return (
    <AuthGuard>
      <div className="premium-profile min-h-screen bg-[#0B0B0B] text-white selection:bg-[#FF6B00] selection:text-black">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_8%,rgba(255,107,0,0.18),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(216,23,114,0.12),transparent_30%),linear-gradient(180deg,#121212_0%,#0B0B0B_42%,#080808_100%)]" />

        <nav className="sticky top-0 z-40 border-b border-white/[0.08] bg-[#0B0B0B]/76 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <BrandLogo variant="full" className="w-32" />

            <div className="hidden items-center gap-6 text-sm font-semibold text-[#B3B3B3] md:flex">
              <Link className="transition hover:text-white" href="/">Home</Link>
              <Link className="transition hover:text-white hover:text-[#FF6B00]" href="/feed">Feed</Link>
              <Link className="text-white" href="/profile">Profil</Link>
              <button type="button" className="transition hover:text-white" onClick={() => setIsEditorOpen(true)}>Parametres</button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Partager</span>
              </Button>
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Ouvrir la navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </nav>

        {isSidebarOpen ? (
          <div className="fixed inset-0 z-[70] bg-black/70 p-4 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} className="max-w-xs">
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} aria-label="Fermer la navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebar}
            </motion.div>
          </div>
        ) : null}

        <div className="relative z-10 mx-auto grid max-w-[1380px] grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[210px_minmax(0,1fr)] lg:px-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">{sidebar}</div>
          </aside>

          <main className="min-w-0 pb-24 lg:pb-0">
            {isLoading ? (
              <section className="rounded-[32px] border border-white/[0.08] bg-[#121212]/88 p-8 text-[#B3B3B3] shadow-2xl shadow-black/30">
                Chargement du profil...
              </section>
            ) : error ? (
              <section className="rounded-[32px] border border-white/[0.08] bg-[#121212]/88 p-8 text-red-200 shadow-2xl shadow-black/30">
                {error}
              </section>
            ) : user ? (
              <>
                <motion.section initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.55, ease: "easeOut" }} className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#121212] shadow-[0_30px_90px_rgba(0,0,0,0.48)]">
                  <div className="absolute inset-0">
                    {user.coverUrl ? <img src={user.coverUrl} alt="Couverture" className="h-full w-full object-cover opacity-70" /> : null}
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,107,0,0.30),rgba(18,18,18,0.72)_38%,rgba(11,11,11,0.96)),radial-gradient(circle_at_78%_22%,rgba(255,107,0,0.22),transparent_26%)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/50 to-transparent" />
                  </div>

                  <div className="relative flex min-h-[460px] flex-col justify-end p-6 sm:p-8 lg:p-10">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end">
                      <motion.div whileHover={{ scale: 1.03 }} className="grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-[#FF6B00] bg-[#181818] text-4xl font-black text-white shadow-[0_0_45px_rgba(255,107,0,0.28)] sm:h-40 sm:w-40 sm:text-5xl">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" style={getAvatarImageStyle(user)} /> : getInitials(user.displayName || user.username)}
                      </motion.div>

                      <div className="min-w-0 max-w-4xl">
                        <div className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-[#FF6B00]">Profil</div>
                        <h1 className="break-words text-5xl font-black leading-none tracking-tight sm:text-7xl lg:text-8xl">{displayName}</h1>
                        <p className="mt-4 text-lg font-semibold text-[#B3B3B3]">@{user.username}</p>
                        {user.bio ? <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">{user.bio}</p> : null}
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                      {stats.map((stat) => (
                        <motion.div key={stat.label} whileHover={{ y: -3 }} className="rounded-3xl border border-white/[0.08] bg-white/[0.07] p-4 backdrop-blur-xl">
                          <div className="text-2xl font-black">{stat.value}</div>
                          <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#B3B3B3]">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                <section className="mt-6 flex flex-wrap items-center gap-3 rounded-[28px] border border-white/[0.08] bg-[#121212]/70 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
                  <Button asChild size="lg" className="shadow-[0_0_34px_rgba(255,107,0,0.3)]">
                    <Link href="/feed"><Sparkles className="h-5 w-5" />Feed</Link>
                  </Button>
                  <Button size="lg" onClick={() => setIsEditorOpen(true)}><Edit3 className="h-5 w-5" />Modifier profil</Button>
                  <Button variant="secondary" size="lg" onClick={handleShare}><Share2 className="h-5 w-5" />Partager</Button>
                </section>

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                  <section className="space-y-6">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.08, duration: 0.5 }} className="rounded-[30px] border border-white/[0.08] bg-[#181818]/88 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-black">Publications</h2>
                          <p className="mt-1 text-sm text-[#B3B3B3]">Vos publications enregistrees en base.</p>
                        </div>
                        <Button asChild variant="secondary" size="sm">
                          <Link href="/feed"><ImagePlus className="h-4 w-4" />Creer une publication</Link>
                        </Button>
                      </div>

                      {userPosts.length === 0 ? (
                        <div className="mt-6 grid min-h-72 place-items-center rounded-[28px] border border-dashed border-white/[0.12] bg-black/18 p-8 text-center">
                          <div>
                            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#FF6B00]/12 text-[#FF6B00]"><FileText className="h-8 w-8" /></div>
                            <h3 className="mt-5 text-xl font-black">Aucune publication</h3>
                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#B3B3B3]">Vos publications apparaitront ici des qu'elles seront creees.</p>
                            <Button asChild className="mt-6"><Link href="/feed">Creer une publication</Link></Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-5 columns-1 gap-5 lg:columns-2 [column-fill:_balance]">
                          {userPosts.map((post) => (
                            <PostCard key={post.id} post={post} currentUserId={user.id} onPostUpdated={updatePost} onPostDeleted={deletePost} onToast={showToast} />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </section>

                  <aside className="space-y-6">
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.12, duration: 0.5 }} className="rounded-[30px] border border-white/[0.08] bg-[#181818]/88 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                      <h2 className="text-xl font-black">Informations</h2>
                      <div className="mt-5 space-y-4 text-sm text-[#B3B3B3]">
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="font-bold text-white">Nom</div><div className="mt-1 break-all">{displayName}</div></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="font-bold text-white">Username</div><div className="mt-1 break-all">@{user.username}</div></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="font-bold text-white">Email</div><div className="mt-1 break-all">{user.email}</div></div>
                        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"><div className="flex items-center gap-2 font-bold text-white"><CalendarDays className="h-4 w-4 text-[#FF6B00]" />Inscription</div><div className="mt-1">{formatDate(user.createdAt)}</div></div>
                      </div>
                    </motion.div>
                  </aside>
                </div>
              </>
            ) : null}
          </main>
        </div>

        {isEditorOpen && user ? (
          <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleSaveProfile} className="w-full max-w-2xl rounded-[30px] border border-white/[0.08] bg-[#181818] p-6 shadow-2xl shadow-black/70">
              <div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">Modifier le profil</h2><p className="mt-2 text-sm text-[#B3B3B3]">JPG, PNG ou WEBP. 2 Mo maximum par image.</p></div><Button type="button" variant="ghost" size="sm" onClick={() => setIsEditorOpen(false)} aria-label="Fermer"><X className="h-5 w-5" /></Button></div>

              {editorError ? <p className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-200">{editorError}</p> : null}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div><label className="block text-sm font-bold text-[#B3B3B3]" htmlFor="edit-username">Username</label><input id="edit-username" value={draftUsername} onChange={(event) => setDraftUsername(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]/70" /></div>
                <div><label className="block text-sm font-bold text-[#B3B3B3]" htmlFor="edit-display-name">Nom</label><input id="edit-display-name" value={draftDisplayName} onChange={(event) => setDraftDisplayName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]/70" /></div>
              </div>

              <label className="mt-5 block text-sm font-bold text-[#B3B3B3]" htmlFor="edit-bio">Bio</label><textarea id="edit-bio" value={draftBio} onChange={(event) => setDraftBio(event.target.value)} rows={4} className="mt-2 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#FF6B00]/70" />

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div><label className="block text-sm font-bold text-[#B3B3B3]" htmlFor="edit-avatar">Photo de profil</label><input id="edit-avatar" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageChange(event, "avatar")} className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-[#B3B3B3] file:mr-3 file:rounded-full file:border-0 file:bg-[#FF6B00] file:px-4 file:py-2 file:font-bold file:text-black" /></div>
                <div><label className="block text-sm font-bold text-[#B3B3B3]" htmlFor="edit-cover">Photo de couverture</label><input id="edit-cover" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => handleImageChange(event, "cover")} className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-[#B3B3B3] file:mr-3 file:rounded-full file:border-0 file:bg-[#FF6B00] file:px-4 file:py-2 file:font-bold file:text-black" /></div>
              </div>

              {avatarPreviewSrc ? (
                <div className="mt-6 rounded-[26px] border border-white/[0.08] bg-black/24 p-5">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div
                      ref={avatarFrameRef}
                      onPointerDown={startAvatarDrag}
                      onPointerMove={moveAvatar}
                      onPointerUp={stopAvatarDrag}
                      onPointerCancel={stopAvatarDrag}
                      onLostPointerCapture={stopAvatarDrag}
                      onWheel={handleAvatarWheel}
                      className="group relative grid h-40 w-40 shrink-0 cursor-grab touch-none select-none place-items-center overflow-hidden rounded-full border-4 border-[#FF6B00] bg-[#181818] text-3xl font-black text-white shadow-[0_0_34px_rgba(255,107,0,0.22)] active:cursor-grabbing"
                      aria-label="Ajuster la photo de profil"
                      role="img"
                    >
                      <img src={avatarPreviewSrc} alt="Apercu avatar" className="h-full w-full object-cover" style={getAvatarImageStyle(avatarPreviewCrop)} />
                      <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-full bg-black/0 transition group-hover:bg-black/22">
                        <Move className="h-8 w-8 text-white/0 transition group-hover:text-white/80" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.04] p-4">
                        <div className="flex items-center gap-2 text-sm font-black text-white">
                          <Move className="h-4 w-4 text-[#FF6B00]" />
                          Glissez la photo directement dans le rond
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[#B3B3B3]">Déplacez l'image avec la souris ou le doigt. Utilisez le zoom pour rapprocher ou élargir le cadrage.</p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Button type="button" variant="secondary" size="sm" onClick={() => updateAvatarScale(-0.1)} disabled={draftAvatarScale <= 1}>
                            <Minus className="h-4 w-4" /> Zoom
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={() => updateAvatarScale(0.1)} disabled={draftAvatarScale >= 2}>
                            <Plus className="h-4 w-4" /> Zoom
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={resetAvatarCrop}>
                            <RotateCcw className="h-4 w-4" /> Recentrer
                          </Button>
                          <span className="ml-auto rounded-full border border-white/[0.08] bg-black/24 px-3 py-2 text-xs font-black text-[#B3B3B3]">{draftAvatarScale.toFixed(1)}x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setIsEditorOpen(false)}>Annuler</Button><Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{isSaving ? "Enregistrement..." : "Enregistrer"}</Button></div>
            </motion.form>
          </div>
        ) : null}

        {toast ? <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="fixed right-4 top-20 z-[90] rounded-full border border-white/[0.08] bg-[#181818]/94 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-black/50 backdrop-blur-xl"><Copy className="mr-2 inline h-4 w-4 text-[#FF6B00]" />{toast}</motion.div> : null}
      </div>
    </AuthGuard>
  );
}
