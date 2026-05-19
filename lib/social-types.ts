export type SocialUser = {
  id: string;
  email?: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  avatarPositionX: number;
  avatarPositionY: number;
  avatarScale: number;
  coverUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  postCount?: number;
  followerCount?: number;
  followingCount?: number;
  isMe?: boolean;
  isFollowing?: boolean;
};

export type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarPositionX?: number;
    avatarPositionY?: number;
    avatarScale?: number;
    isVerified: boolean;
  };
};

export type PostMedia = {
  id: string;
  url: string;
  mimeType: string;
  size: number;
  order: number;
  createdAt: string;
};

export type Post = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  media: PostMedia[];
  user: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    avatarPositionX?: number;
    avatarPositionY?: number;
    avatarScale?: number;
    isVerified: boolean;
  };
  comments: Comment[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type MeResponse = {
  user: SocialUser;
};

export type PostsResponse = {
  posts: Post[];
};

export type PostResponse = {
  post: Post;
};
