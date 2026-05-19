type AvatarCrop = {
  avatarPositionX?: number | null;
  avatarPositionY?: number | null;
  avatarScale?: number | null;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const getAvatarImageStyle = (user?: AvatarCrop | null) => {
  const x = clamp(user?.avatarPositionX ?? 50, 0, 100);
  const y = clamp(user?.avatarPositionY ?? 50, 0, 100);
  const scale = clamp(user?.avatarScale ?? 1, 1, 2);

  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${scale})`
  };
};
