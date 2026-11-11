export type Consent = { analytics: boolean; marketing: boolean; decided: boolean };
export const COOKIE = "finasto_consent";
export const DEFAULT: Consent = { analytics: false, marketing: false, decided: false };

export function readConsent(): Consent {
  if (typeof document === "undefined") return DEFAULT;
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  if (!m) return DEFAULT;
  try { return { ...DEFAULT, ...JSON.parse(decodeURIComponent(m[1])), decided: true }; }
  catch { return DEFAULT; }
}

export function writeConsent(c: Omit<Consent, "decided">) {
  const v = encodeURIComponent(JSON.stringify(c));
  document.cookie = `${COOKIE}=${v}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax; Secure`;
}