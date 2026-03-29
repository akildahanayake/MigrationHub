export const getProfilePic = (fullName?: string, photoUrl?: string) => {
  if (photoUrl) return photoUrl;
  const name = fullName || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true`;
};
