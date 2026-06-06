"use client";

import { type FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Check,
  Edit3,
  Heart,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api, { type ApiError } from "@/lib/api";
import { getAvatarImageStyle } from "@/lib/avatar-style";
import { type Comment, type Post, type PostResponse } from "@/lib/social-types";

type PostCardProps = {
  post: Post;
  currentUserId?: string;
  onPostUpdated?: (post: Post) => void;
  onPostDeleted?: (postId: string) => void;
  onToast?: (message: string) => void;
};

type LikeResponse = {
  isLiked: boolean;
  likeCount: number;
};

type CommentResponse = {
  comment: Comment;
  commentCount: number;
};

type DeleteCommentResponse = {
  commentCount: number;
};

const formatDateTime = (date: string) => {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(date));
};

const getInitials = (name?: string | null) => {
  return (name || "U").slice(0, 2).toUpperCase();
};

function Avatar({ user, size = "md" }: { user: Post["user"] | Comment["user"]; size?: "sm" | "md" }) {
  const dimensions = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";

  return (
    <div className={`${dimensions} grid shrink-0 place-items-center overflow-hidden rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/14 font-black text-[#FF8A1F] shadow-[0_0_24px_rgba(255,107,0,0.12)]`}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" style={getAvatarImageStyle(user)} />
      ) : (
        getInitials(user.displayName || user.username)
      )}
    </div>
  );
}

export function PostCard({ post, currentUserId, onPostUpdated, onPostDeleted, onToast }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [comments, setComments] = useState(post.comments);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [editContent, setEditContent] = useState(post.content);
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = post.user.displayName || post.user.username;
  const hasTextContent = editContent.trim().length > 0;
  const mediaItems = post.media || [];

  const toggleLike = async () => {
    if (isBusy) {
      return;
    }

    const previousLiked = isLiked;
    const previousCount = likeCount;
    setIsLiked(!previousLiked);
    setLikeCount(previousLiked ? Math.max(previousCount - 1, 0) : previousCount + 1);

    try {
      const { data } = previousLiked
        ? await api.delete<LikeResponse>(`/posts/${post.id}/likes`)
        : await api.post<LikeResponse>(`/posts/${post.id}/likes`);

      setIsLiked(data.isLiked);
      setLikeCount(data.likeCount);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      setError(apiError.message || "Action impossible");
    }
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = commentContent.trim();
    if (!content || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      const { data } = await api.post<CommentResponse>(`/posts/${post.id}/comments`, { content });
      setComments((currentComments) => [...currentComments, data.comment]);
      setCommentCount(data.commentCount);
      setCommentContent("");
      setIsCommentsOpen(true);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Commentaire impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      const { data } = await api.delete<DeleteCommentResponse>(`/posts/${post.id}/comments/${commentId}`);
      setComments((currentComments) => currentComments.filter((comment) => comment.id !== commentId));
      setCommentCount(data.commentCount);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Suppression impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const saveEdit = async () => {
    const content = editContent.trim();
    if (!content || isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      const { data } = await api.patch<PostResponse>(`/posts/${post.id}`, { content });
      setEditContent(data.post.content);
      setIsEditing(false);
      onPostUpdated?.(data.post);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Modification impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const deletePost = async () => {
    if (!window.confirm("Supprimer cette publication ?")) {
      return;
    }

    try {
      setIsBusy(true);
      setError(null);
      await api.delete(`/posts/${post.id}`);
      onPostDeleted?.(post.id);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Suppression impossible");
    } finally {
      setIsBusy(false);
    }
  };

  const sharePost = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/feed#post-${post.id}`);
      onToast?.("Lien de publication copie");
    } catch {
      onToast?.("Lien pret a partager");
    }
  };

  return (
    <motion.article
      id={`post-${post.id}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#121212]/82 p-5 shadow-2xl shadow-black/24 backdrop-blur-2xl transition hover:border-white/[0.14] hover:shadow-[0_24px_70px_rgba(255,107,0,0.10)]"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar user={post.user} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-sm font-black text-white">
              <span className="truncate">{displayName}</span>
              {post.user.isVerified ? <Sparkles className="h-3.5 w-3.5 text-[#3B82F6]" fill="#3B82F6" /> : null}
            </div>
            <div className="truncate text-xs font-bold text-[#FF8A1F]">@{post.user.username}</div>
            <time className="text-xs font-semibold text-[#9CA3AF]" dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="hover:text-[#FF8A1F]" aria-label="Options publication">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      {(isEditing || hasTextContent) ? (
      <div className="mt-5 rounded-[24px] border border-white/[0.06] bg-black/20 p-5">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(event) => setEditContent(event.target.value)}
              className="min-h-32 w-full resize-none rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none focus:border-[#FF6B00]/70"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => { setEditContent(post.content); setIsEditing(false); }}>
                <X className="h-4 w-4" /> Annuler
              </Button>
              <Button type="button" size="sm" onClick={saveEdit} disabled={isBusy}>
                <Check className="h-4 w-4" /> Enregistrer
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-base leading-7 text-white/92">{editContent}</p>
        )}
      </div>
      ) : null}

      {mediaItems.length > 0 ? (
        <div className={(isEditing || hasTextContent ? "mt-4 " : "mt-5 ") + "grid gap-3 " + (mediaItems.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {mediaItems.map((media, index) => (
            <motion.figure
              key={media.id}
              whileHover={{ scale: 1.01 }}
              className={(mediaItems.length === 1 ? "max-h-[620px] " : "aspect-square ") + "group overflow-hidden rounded-[26px] border border-white/[0.08] bg-black/28"}
            >
              <img
                src={media.url}
                alt={`Media ${index + 1} de la publication`}
                className={(mediaItems.length === 1 ? "max-h-[620px] w-full " : "h-full w-full ") + "object-cover transition duration-500 group-hover:scale-[1.035]"}
                loading="lazy"
              />
            </motion.figure>
          ))}
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm font-semibold text-red-200">{error}</p> : null}

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-4 text-[#B7B7B7]">
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={toggleLike}
            className={(isLiked ? "text-[#FF6B00]" : "") + " inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-sm font-bold transition hover:border-[#FF6B00]/45 hover:bg-[#FF6B00]/13 hover:text-[#FF8A1F]"}
          >
            <Heart className={(isLiked ? "fill-[#FF6B00] " : "") + "h-4 w-4"} />
            {likeCount}
          </motion.button>
          <button
            type="button"
            onClick={() => setIsCommentsOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.045] px-3 py-2 text-sm font-bold transition hover:border-[#FF6B00]/45 hover:bg-[#FF6B00]/13 hover:text-[#FF8A1F]"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount}
          </button>
          <motion.button whileTap={{ scale: 0.94 }} type="button" onClick={sharePost} className="rounded-full border border-white/[0.08] bg-white/[0.045] p-2 transition hover:border-[#FF6B00]/45 hover:bg-[#FF6B00]/13 hover:text-[#FF8A1F]" aria-label="Partager">
            <Share2 className="h-5 w-5" />
          </motion.button>
          <button type="button" className="rounded-full border border-white/[0.06] bg-white/[0.035] p-2 opacity-50" disabled title="Sauvegardes non encore persistées">
            <Bookmark className="h-5 w-5" />
          </button>
        </div>

        {post.canEdit || post.canDelete ? (
          <div className="flex items-center gap-2">
            {post.canEdit ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4" /> Modifier
              </Button>
            ) : null}
            {post.canDelete ? (
              <Button type="button" variant="ghost" size="sm" onClick={deletePost} disabled={isBusy} className="hover:text-red-300">
                <Trash2 className="h-4 w-4" /> Supprimer
              </Button>
            ) : null}
          </div>
        ) : null}
      </footer>

      {isCommentsOpen ? (
        <section className="mt-4 space-y-3 border-t border-white/[0.08] pt-4">
          {comments.length === 0 ? (
            <p className="rounded-2xl border border-white/[0.06] bg-black/18 p-4 text-sm text-[#9CA3AF]">Aucun commentaire pour le moment.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 rounded-2xl border border-white/[0.06] bg-black/18 p-4">
                <Avatar user={comment.user} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-black text-white">{comment.user.displayName || comment.user.username}</span>
                    <span className="font-bold text-[#FF8A1F]">@{comment.user.username}</span>
                    <time className="text-xs text-[#9CA3AF]" dateTime={comment.createdAt}>{formatDateTime(comment.createdAt)}</time>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/88">{comment.content}</p>
                </div>
                {comment.user.id === currentUserId ? (
                  <button type="button" onClick={() => deleteComment(comment.id)} className="self-start rounded-full p-2 text-[#9CA3AF] transition hover:bg-red-500/10 hover:text-red-300" aria-label="Supprimer le commentaire">
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))
          )}

          <form onSubmit={submitComment} className="flex gap-2">
            <input
              value={commentContent}
              onChange={(event) => setCommentContent(event.target.value)}
              placeholder="Ajouter un commentaire..."
              className="min-h-11 flex-1 rounded-full border border-white/[0.08] bg-black/24 px-4 text-sm text-white outline-none placeholder:text-[#9CA3AF] focus:border-[#FF6B00]/70"
            />
            <Button type="submit" size="sm" disabled={isBusy || !commentContent.trim()}>
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </section>
      ) : null}
    </motion.article>
  );
}
