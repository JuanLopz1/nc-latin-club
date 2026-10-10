// Public contact details supplied by club leadership.
// Keep links together so the future CMS can provide the same settings.
export const clubLinks = {
  joinEmail: "dgonzalezaceved1@ncstudents.niagaracollege.ca",
  instagramUrl: "https://www.instagram.com/nclat1nclub/" as string | null,
};

export const joinEmailHref = `mailto:${clubLinks.joinEmail}?subject=${encodeURIComponent("Join NC Latin Club")}&body=${encodeURIComponent("hey! I want to join to NCLatin Club!")}`;
