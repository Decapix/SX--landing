// Site mode + feature flags.
// Full Mode shows the live browse sections (Collections + Stylists/posts).
// Soft Mode (pre-launch) disables them entirely — hidden from nav and routing.
//
// Controlled by NEXT_PUBLIC_SITE_MODE ("full" | "soft"). Defaults to "soft".

export type SiteMode = "full" | "soft";

export const SITE_MODE: SiteMode =
  process.env.NEXT_PUBLIC_SITE_MODE === "full" ? "full" : "soft";

export const features = {
  /** Collections browse (formerly "Runway"). */
  collections: SITE_MODE === "full",
  /** Stylists / discovery feed (posts, formerly "Discover"). */
  posts: SITE_MODE === "full",
} as const;

export type FeatureKey = keyof typeof features;

export type NavKey =
  | "collections"
  | "stylists"
  | "platform"
  | "pricing"
  | "about"
  | "contact";

export interface NavDef {
  key: NavKey;
  href: string;
  /** Hidden unless this feature is enabled. */
  requires?: FeatureKey;
}

export const NAV: NavDef[] = [
  { key: "collections", href: "/runway", requires: "collections" },
  { key: "stylists", href: "/discover", requires: "posts" },
  { key: "platform", href: "/platform" },
  { key: "pricing", href: "/pricing" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

/** Nav items available in the current mode. */
export function visibleNav(): NavDef[] {
  return NAV.filter((n) => !n.requires || features[n.requires]);
}

/** Where to point a "browse collections" CTA given the mode. */
export const collectionsHref = features.collections ? "/runway" : "/platform";
/** Where to point a "browse stylists" CTA given the mode. */
export const stylistsHref = features.posts ? "/discover" : "/platform";
