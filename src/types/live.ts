export type LiveEventType = 'comment' | 'gift' | 'follow' | 'like';

export type GiftTier = 'rose' | 'medium' | 'large';

export type LiveEvent = {
  id: string;
  type: LiveEventType;
  username: string;
  displayName: string;
  avatarUrl?: string;
  message?: string;
  giftTier?: GiftTier;
  giftName?: string;
  giftCount?: number;
  likeCount?: number;
  createdAt: number;
};

export type LiveViewer = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  scale: number;
  gifts: number;
  likes: number;
  isFollowing: boolean;
  joinedAt: number;
  highlightUntil?: number;
};

export type LiveStats = {
  comments: number;
  gifts: number;
  follows: number;
  likes: number;
};
