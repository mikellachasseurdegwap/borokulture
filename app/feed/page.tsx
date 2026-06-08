"use client";

import Link from "next/link";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  ImagePlus,
  Loader2,
  PenLine,
  Search,
  Send,
  Settings,
  Sparkles,
  User,
  X
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { UserSearch } from "@/components/search/user-search";
import { PostCard } from "@/components/social/post-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import api, { type ApiError } from "@/lib/api";
import { getAvatarImageStyle } from "@/lib/avatar-style";
import { isAuthenticated } from "@/lib/auth";
import { type MeResponse, type Post, type PostResponse, type PostsResponse, type SocialUser } from "@/lib/social-types";

const navItems = [
  { label: "boro", icon: Home, href: "/" },
  { label: "Feed", icon: Sparkles, href: "/feed", active: true },
  { label: "Profil", icon: User, href: "/profile" },
  { label: "Parametres", icon: Settings, href: "/profile" }
];

const getInitials = (username?: string | null) => {
  return (username || "U").slice(0, 2).toUpperCase();
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 }
};

const FEED_PAGE_SIZE = 10;

export default function FeedPage() {
  const [user, setUser] = useState<SocialUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadFeed = async () => {
      if (!isAuthenticated()) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [{ data: meData }, { data: postsData }] = await Promise.all([
          api.get<MeResponse>("/auth/me"),
          api.get<PostsResponse>("/posts", {
            params: {
              page: 1,
              limit: FEED_PAGE_SIZE
            }
          })
        ]);

        setUser(meData.user);
        setPosts(postsData.posts);
        setCurrentPage(postsData.pagination?.page || 1);
        setHasNextPage(Boolean(postsData.pagination?.hasNextPage));
      } catch (requestError) {
        const apiError = requestError as ApiError;
        setError(apiError.message || "Impossible de charger le feed");
      } finally {
        setIsLoading(false);
      }
    };

    loadFeed();
  }, []);

  useEffect(() => {
    return () => {
      mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [mediaPreviews]);

  const ownPostsCount = useMemo(() => {
    if (!user) {
      return 0;
    }

    return user.postCount ?? posts.filter((post) => post.user.id === user.id).length;
  }, [posts, user]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const validateMediaFiles = (files: File[]) => {
    if (files.length > 4) {
      return "Vous pouvez ajouter 4 images maximum";
    }

    const invalidFile = files.find((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type));
    if (invalidFile) {
      return "Les images doivent etre au format jpg, png ou webp";
    }

    const oversizedFile = files.find((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFile) {
      return "Chaque image doit faire 5 Mo maximum";
    }

    return null;
  };

  const handleMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validationError = validateMediaFiles(files);

    if (validationError) {
      setComposerError(validationError);
      event.target.value = "";
      return;
    }

    mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setMediaFiles(files);
    setMediaPreviews(files.map((file) => URL.createObjectURL(file)));
    setComposerError(null);
  };

  const clearMedia = () => {
    mediaPreviews.forEach((preview) => URL.revokeObjectURL(preview));
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  const handlePublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cleanContent = content.trim();
    if (!cleanContent && mediaFiles.length === 0) {
      setComposerError("Ajoutez un texte ou une image");
      return;
    }

    try {
      setIsPublishing(true);
      setComposerError(null);
      const formData = new FormData();
      formData.append("content", cleanContent);
      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });

      const { data } = await api.post<PostResponse>("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setPosts((currentPosts) => [data.post, ...currentPosts]);
      setUser((currentUser) => currentUser ? { ...currentUser, postCount: (currentUser.postCount ?? 0) + 1 } : currentUser);
      setContent("");
      clearMedia();
      showToast("Publication creee");
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setComposerError(apiError.message || "Publication impossible");
    } finally {
      setIsPublishing(false);
    }
  };

  const loadMorePosts = async () => {
    if (isLoadingMore || !hasNextPage) {
      return;
    }

    try {
      setIsLoadingMore(true);
      setError(null);
      const nextPage = currentPage + 1;
      const { data } = await api.get<PostsResponse>("/posts", {
        params: {
          page: nextPage,
          limit: FEED_PAGE_SIZE
        }
      });

      setPosts((currentPosts) => {
        const existingIds = new Set(currentPosts.map((post) => post.id));
        const nextPosts = data.posts.filter((post) => !existingIds.has(post.id));

        return [...currentPosts, ...nextPosts];
      });
      setCurrentPage(data.pagination?.page || nextPage);
      setHasNextPage(Boolean(data.pagination?.hasNextPage));
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Impossible de charger plus de publications");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const updatePost = (updatedPost: Post) => {
    setPosts((currentPosts) => currentPosts.map((post) => (post.id === updatedPost.id ? updatedPost : post)));
  };

  const deletePost = (postId: string) => {
    const deletedPost = posts.find((post) => post.id === postId);

    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId));
    if (deletedPost?.user.id === user?.id) {
      setUser((currentUser) => currentUser ? { ...currentUser, postCount: Math.max((currentUser.postCount ?? 1) - 1, 0) } : currentUser);
    }
    showToast("Publication supprimee");
  };

  const sidebar = (
    <div className="rounded-[28px] border border-white/[0.08] bg-[#121212]/78 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <motion.div key={item.label} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={item.href}
              onClick={() => setIsMobileNavOpen(false)}
              className={
                "mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 " +
                (item.active
                  ? "bg-[linear-gradient(90deg,#FF8A1F,#f0443e,#FF3D7E)] text-white shadow-[0_0_32px_rgba(255,107,0,0.28)]"
                  : "border border-transparent text-[#B7B7B7] hover:border-white/[0.10] hover:bg-white/[0.08] hover:text-white hover:shadow-[0_0_26px_rgba(255,107,0,0.10)]")
              }
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          </motion.div>
        );
      })}
    </div>
  );

  return (
    <AuthGuard>
      <div className="feed-page min-h-screen bg-[#050505] text-white selection:bg-[#FF6B00] selection:text-black">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,107,0,0.16),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(255,107,0,0.08),transparent_26%),linear-gradient(180deg,#121212_0%,#050505_42%,#050505_100%)]" />

        <nav className="sticky top-0 z-40 bg-transparent">
          <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <BrandLogo variant="full" className="h-14 w-44 sm:h-16 sm:w-52" />

            <div className="hidden max-w-lg flex-1 md:mx-8 md:block">
              <UserSearch className="w-full" />
            </div>

            <Button variant="ghost" size="sm" className="md:hidden" aria-label="Rechercher">
              <Search className="h-5 w-5" />
            </Button>

            <div className="hidden items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] p-1 text-sm font-bold text-[#B7B7B7] shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-2xl md:flex">
              <Link className="rounded-full px-4 py-2 transition hover:bg-white/[0.08] hover:text-white" href="/">boro</Link>
              <Link className="rounded-full bg-[linear-gradient(90deg,#FF8A1F,#f0443e,#FF3D7E)] px-4 py-2 text-white shadow-[0_0_24px_rgba(255,107,0,0.28)]" href="/feed">Feed</Link>
              <Link className="rounded-full px-4 py-2 transition hover:bg-white/[0.08] hover:text-white" href="/profile">Profil</Link>
            </div>

            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileNavOpen(true)} aria-label="Ouvrir la navigation">
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </nav>

        {isMobileNavOpen ? (
          <div className="fixed inset-0 z-[70] bg-black/70 p-4 backdrop-blur-sm lg:hidden">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-xs">
              <div className="mb-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setIsMobileNavOpen(false)} aria-label="Fermer la navigation">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebar}
            </motion.div>
          </div>
        ) : null}

        <div className="relative z-10 mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-5 sm:px-6 lg:px-8 xl:grid-cols-[220px_minmax(0,760px)] xl:justify-center">
          <aside className="hidden xl:block">
            <div className="sticky top-24">{sidebar}</div>
          </aside>

          <main className="mx-auto w-full max-w-[760px] min-w-0 pb-24 xl:pb-0">
            <motion.section initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.45 }} className="mb-5 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#121212]/78 shadow-[0_30px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
              <div className="border-b border-white/[0.08] bg-[radial-gradient(circle_at_22%_0%,rgba(255,138,31,0.22),transparent_32%),linear-gradient(135deg,rgba(255,107,0,0.16),rgba(18,18,18,0.70)_46%,rgba(5,5,5,0.86))] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#FF6B00]">Feed social</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Actualite</h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#9CA3AF]">Les publications reelles de la communaute BORO KULTURE, triees par date.</p>
                  </div>
                  {user ? (
                    <div className="hidden rounded-2xl border border-white/[0.08] bg-white/[0.055] p-3 text-right shadow-[0_0_34px_rgba(255,107,0,0.08)] backdrop-blur-xl sm:block">
                      <div className="text-xl font-black">{ownPostsCount}</div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Vos posts</div>
                    </div>
                  ) : null}
                </div>
              </div>

              <form onSubmit={handlePublish} className="p-4" encType="multipart/form-data">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/[0.08] bg-[#FF6B00]/14 text-sm font-black text-[#FF6B00]">
                    {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" style={getAvatarImageStyle(user)} /> : getInitials(user?.displayName || user?.username)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <textarea
                      value={content}
                      onChange={(event) => {
                        setContent(event.target.value);
                        if (composerError) {
                          setComposerError(null);
                        }
                      }}
                      placeholder="Quoi de neuf sur BORO ?"
                      rows={3}
                      className="w-full resize-none rounded-[22px] border border-white/[0.08] bg-black/24 px-5 py-3 text-base leading-6 text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-[#FF6B00]/70 focus:bg-black/32 focus:shadow-[0_0_0_4px_rgba(255,107,0,0.10)]"
                      disabled={isPublishing}
                    />
                    {mediaPreviews.length > 0 ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {mediaPreviews.map((preview, index) => (
                          <div key={preview} className="group relative aspect-[4/3] overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/30">
                            <img src={preview} alt={`Apercu ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                          </div>
                        ))}
                      </div>
                    ) : null}
                    {composerError ? <p className="mt-3 text-sm font-semibold text-red-200">{composerError}</p> : null}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-[#9CA3AF]">
                        <input
                          id="post-media-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          onChange={handleMediaChange}
                          className="sr-only"
                          disabled={isPublishing}
                        />
                        <label htmlFor="post-media-upload" className="cursor-pointer rounded-full border border-white/[0.08] bg-white/[0.04] p-2 transition hover:border-[#FF6B00]/45 hover:bg-[#FF6B00]/13 hover:text-[#FF8A1F]" title="Ajouter des images">
                          <ImagePlus className="h-4 w-4" />
                        </label>
                        <span className="text-xs font-semibold">{mediaFiles.length > 0 ? `${mediaFiles.length} image${mediaFiles.length > 1 ? "s" : ""} selectionnee${mediaFiles.length > 1 ? "s" : ""}` : "JPG, PNG ou WEBP. 5 Mo maximum."}</span>
                        {mediaFiles.length > 0 ? (
                          <button type="button" onClick={clearMedia} className="rounded-full p-2 text-[#9CA3AF] transition hover:bg-red-500/10 hover:text-red-300" aria-label="Retirer les images">
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      <Button type="submit" disabled={isPublishing || (!content.trim() && mediaFiles.length === 0)} className="px-5 shadow-[0_0_34px_rgba(255,107,0,0.26)]">
                        {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Publier
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.section>

            {isLoading ? (
              <div className="grid gap-5">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-56 animate-pulse rounded-[30px] border border-white/[0.06] bg-[#121212]/80" />
                ))}
              </div>
            ) : error ? (
              <section className="rounded-[30px] border border-white/[0.06] bg-[#121212]/88 p-8 text-red-200 shadow-2xl shadow-black/30">{error}</section>
            ) : posts.length === 0 ? (
              <motion.section initial="hidden" animate="visible" variants={fadeUp} className="grid min-h-[340px] place-items-center rounded-[30px] border border-dashed border-white/[0.10] bg-[#121212]/72 p-8 text-center shadow-2xl shadow-black/30">
                <div>
                  <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#FF6B00]/12 text-[#FF6B00]">
                    <PenLine className="h-9 w-9" />
                  </div>
                  <h2 className="mt-6 text-2xl font-black">Aucune publication</h2>
                  <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#9CA3AF]">Le feed affichera les publications reelles des utilisateurs des qu'elles seront creees.</p>
                </div>
              </motion.section>
            ) : (
              <>
                <section className="space-y-5">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      onPostUpdated={updatePost}
                      onPostDeleted={deletePost}
                      onToast={showToast}
                    />
                  ))}
                </section>

                {hasNextPage ? (
                  <div className="mt-6 flex justify-center">
                    <Button type="button" variant="secondary" onClick={loadMorePosts} disabled={isLoadingMore}>
                      {isLoadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {isLoadingMore ? "Chargement..." : "Charger plus"}
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </main>
        </div>

        <div className="fixed bottom-4 left-4 right-4 z-50 grid grid-cols-4 rounded-full border border-white/[0.08] bg-[#121212]/82 p-2 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl xl:hidden">
          {[Home, Sparkles, User, Settings].map((Icon, index) => (
            <Link key={index} href={index === 0 ? "/" : index === 1 ? "/feed" : "/profile"} className={(index === 1 ? "bg-[linear-gradient(90deg,#FF8A1F,#f0443e,#FF3D7E)] text-white shadow-[0_0_24px_rgba(255,107,0,0.26)]" : "text-[#B7B7B7]") + " grid place-items-center rounded-full py-3 transition hover:bg-white/[0.08] hover:text-white"}>
              <Icon className="h-5 w-5" />
            </Link>
          ))}
        </div>

        {toast ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="fixed right-4 top-20 z-[90] rounded-full border border-white/[0.06] bg-[#121212]/94 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
            {toast}
          </motion.div>
        ) : null}
      </div>
    </AuthGuard>
  );
}
