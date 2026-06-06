"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Sparkles, UserPlus, UserRoundCheck } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { PostCard } from "@/components/social/post-card";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Button } from "@/components/ui/button";
import api, { type ApiError } from "@/lib/api";
import { getAvatarImageStyle } from "@/lib/avatar-style";
import { type Post, type SocialUser } from "@/lib/social-types";

type ProfileResponse = {
  user: SocialUser & {
    postCount: number;
    followerCount: number;
    followingCount: number;
    isMe: boolean;
    isFollowing: boolean;
  };
};

type PostsResponse = {
  posts: Post[];
};

type FollowResponse = {
  isFollowing: boolean;
  followerCount: number;
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
};

const getInitials = (username?: string | null) => {
  return (username || "U").slice(0, 2).toUpperCase();
};

export default function PublicProfilePage() {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);
  const [user, setUser] = useState<ProfileResponse["user"] | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [{ data: profileData }, { data: postsData }] = await Promise.all([
          api.get<ProfileResponse>(`/search/users/${username}`),
          api.get<PostsResponse>(`/search/users/${username}/posts`)
        ]);

        setUser(profileData.user);
        setPosts(postsData.posts);
      } catch (requestError) {
        const apiError = requestError as ApiError;
        setError(apiError.message || "Impossible de charger ce profil");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [username]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleFollowToggle = async () => {
    if (!user || user.isMe || isFollowLoading) {
      return;
    }

    try {
      setIsFollowLoading(true);
      setError(null);

      const { data } = user.isFollowing
        ? await api.delete<FollowResponse>(`/search/users/${user.username}/follow`)
        : await api.post<FollowResponse>(`/search/users/${user.username}/follow`);

      setUser({
        ...user,
        isFollowing: data.isFollowing,
        followerCount: data.followerCount
      });
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Action impossible");
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="public-profile-page min-h-screen bg-[#050505] text-white">
        <nav className="sticky top-0 z-40 bg-transparent">
          <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <BrandLogo variant="full" className="w-32" />
            <div className="flex items-center gap-4 text-sm font-bold text-[#B7B7B7]">
              <Link className="transition hover:text-white" href="/feed">Feed</Link>
              <Link className="transition hover:text-white" href="/profile">Mon profil</Link>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-[980px] px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <section className="rounded-[30px] border border-white/[0.08] bg-[#121212]/80 p-8">
              <div className="flex items-center gap-3 text-[#B7B7B7]"><Loader2 className="h-5 w-5 animate-spin text-[#FF6B00]" />Chargement du profil...</div>
            </section>
          ) : error ? (
            <section className="rounded-[30px] border border-red-500/20 bg-red-500/10 p-8 text-red-200">{error}</section>
          ) : user ? (
            <>
              <section className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-[#121212]/82 shadow-[0_30px_90px_rgba(0,0,0,0.40)] backdrop-blur-2xl">
                <div className="relative min-h-80 p-6 sm:p-8">
                  <div className="absolute inset-0">
                    {user.coverUrl ? <img src={user.coverUrl} alt="Couverture" className="h-full w-full object-cover opacity-70" /> : null}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,107,0,0.24),transparent_32%),linear-gradient(135deg,rgba(255,107,0,0.14),rgba(18,18,18,0.82))]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent" />
                  </div>

                  <div className="relative flex min-h-64 flex-col justify-end gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border border-[#FF6B00]/35 bg-[#FF6B00]/14 text-2xl font-black text-[#FF8A1F]">
                        {user.avatarUrl ? <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" style={getAvatarImageStyle(user)} /> : getInitials(user.displayName || user.username)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{user.displayName || "@" + user.username}</h1>
                          {user.isVerified ? <Sparkles className="h-5 w-5 text-[#3B82F6]" fill="#3B82F6" /> : null}
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#FF8A1F]">@{user.username}</p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-[#B7B7B7]"><CalendarDays className="h-4 w-4" />Inscrit le {formatDate(user.createdAt)}</p>
                      </div>
                    </div>

                    {user.isMe ? (
                      <Button asChild type="button"><Link href="/profile">Modifier mon profil</Link></Button>
                    ) : (
                      <Button type="button" onClick={handleFollowToggle} disabled={isFollowLoading}>
                        {isFollowLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : user.isFollowing ? <UserRoundCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                        {user.isFollowing ? "Abonné" : "Suivre"}
                      </Button>
                    )}
                  </div>

                  {user.bio ? <p className="relative mt-6 max-w-2xl text-sm leading-6 text-white/82">{user.bio}</p> : null}
                </div>

                <div className="grid grid-cols-3 border-t border-white/[0.08]">
                  <div className="p-5 text-center"><div className="text-2xl font-black">{user.postCount}</div><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Posts</div></div>
                  <div className="border-x border-white/[0.08] p-5 text-center"><div className="text-2xl font-black">{user.followerCount}</div><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Abonnés</div></div>
                  <div className="p-5 text-center"><div className="text-2xl font-black">{user.followingCount}</div><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9CA3AF]">Abonnements</div></div>
                </div>
              </section>

              <section className="mt-6 columns-1 gap-5 md:columns-2 [column-fill:_balance]">
                {posts.length === 0 ? (
                  <div className="break-inside-avoid rounded-[30px] border border-white/[0.08] bg-[#121212]/72 p-8 text-center text-[#B7B7B7]">Cet utilisateur n'a pas encore publié.</div>
                ) : (
                  posts.map((post) => <PostCard key={post.id} post={post} currentUserId={user.isMe ? user.id : undefined} onToast={showToast} />)
                )}
              </section>
            </>
          ) : null}
        </main>

        {toast ? <div className="fixed right-4 top-20 z-[90] rounded-full border border-white/[0.06] bg-[#121212]/94 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-black/50 backdrop-blur-xl">{toast}</div> : null}
      </div>
    </AuthGuard>
  );
}
