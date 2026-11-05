// Press has no accounts of its own yet; Instagram is September's account.
export const instagramHref = "https://www.instagram.com/septembercompany/";

// TODO: Placeholders. These point to the platforms' home pages, not Press
// accounts; replace each href once the real account URLs are confirmed.
export const followLinks = [
  { label: "Instagram", href: instagramHref },
  { label: "Substack", href: "https://substack.com/" },
  { label: "YouTube", href: "https://www.youtube.com/" },
  { label: "TikTok", href: "https://www.tiktok.com/" },
] as const;
