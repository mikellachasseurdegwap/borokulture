"use client";

import { type FormEvent, useState } from "react";
import api, { type ApiError } from "@/lib/api";

type Post = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string | null;
  };
};

type CreatePostResponse = {
  post: Post;
};

type CreatePostProps = {
  onPostCreated?: (post: Post) => void;
};

export function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const cleanContent = content.trim();

    if (!cleanContent) {
      setError("Le contenu du post est requis");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const { data } = await api.post<CreatePostResponse>("/posts", {
        content: cleanContent
      });

      if (!data.post) {
        throw new Error("Réponse API invalide");
      }

      setContent("");
      onPostCreated?.(data.post);
    } catch (requestError) {
      const apiError = requestError as Partial<ApiError>;
      setError(apiError.message || "Impossible de créer le post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);

    if (error) {
      setError(null);
    }
  };

  return (
    <form className="create-post" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="post-content">Nouveau post</label>
        <textarea
          id="post-content"
          name="content"
          placeholder="Écrire un post..."
          value={content}
          onChange={(event) => handleContentChange(event.target.value)}
          disabled={isSubmitting}
          rows={4}
          required
        />
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <button className="button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Publication..." : "Publier"}
      </button>
    </form>
  );
}
