/** Licensing options from pro/strategy/pro-strategy.md */

export const PRO_LICENSING_URL = "/pro/licensing/";

/**
 * Portal origin that starts Lemon checkout.
 * Set `PUBLIC_LOOMI_PORTAL_URL` in docs `.env` (e.g. https://pro.loomiui.test).
 *
 * This is inlined at build time, so an unset variable in CI would ship a site
 * whose every Pro CTA points at localhost. Fail the build instead — a broken
 * paid path is not something to discover from the live site.
 */
const portalOrigin = import.meta.env.PUBLIC_LOOMI_PORTAL_URL;

if (!portalOrigin && import.meta.env.PROD) {
  throw new Error(
    "PUBLIC_LOOMI_PORTAL_URL is required for production builds — " +
      "every Pro checkout CTA is built from it. Set it in the deploy environment.",
  );
}

export const PRO_PORTAL_URL = (portalOrigin ?? "http://localhost:4830").replace(/\/$/, "");

function portalCheckout(plan, billing) {
  return `${PRO_PORTAL_URL}/pro/${plan}?billing=${billing}`;
}

export const PRO_BILLING_OPTIONS = {
  monthly: {
    label: "Monthly",
    suffix: "/mo",
  },
  annual: {
    label: "Annual",
    suffix: "/yr",
  },
};

export const PRO_INCLUDED = [
  {
    label: "Pro components",
    detail: "Advanced composed workflows built on the same Web Component foundation.",
    icon: "squares-plus",
    tone: "blue",
  },
  {
    label: "Application templates",
    detail: "Real routes, states, layout patterns, and mock data for product teams.",
    icon: "rectangle-stack",
    tone: "green",
  },
  {
    label: "Theme and Figma assets",
    detail: "Design tokens, presets, Figma kit, and brand-ready theme files.",
    icon: "swatch",
    tone: "violet",
  },
  {
    label: "Private docs and updates",
    detail: "Member-only examples, release notes, package access, and ongoing fixes.",
    icon: "lock-closed",
    tone: "amber",
  },
];

export const PRO_AFTER_CHECKOUT = [
  {
    label: "License workspace",
    detail: "Manage license details, seats, and account access from the customer portal.",
    icon: "identification",
    tone: "blue",
  },
  {
    label: "Private package setup",
    detail: "Get authenticated install instructions and per-user package tokens.",
    icon: "command-line",
    tone: "green",
  },
  {
    label: "Downloads and docs",
    detail: "Access templates, assets, Pro documentation, and guided examples.",
    icon: "arrow-down-tray",
    tone: "violet",
  },
  {
    label: "Billing controls",
    detail: "Open subscription management, invoices, payment details, and renewals.",
    icon: "credit-card",
    tone: "amber",
  },
];

export const PRO_LICENSE_PLANS = [
  {
    key: "solo",
    name: "Solo",
    tagline: "One developer, unlimited projects.",
    icon: "user",
    featured: false,
    pricing: {
      monthly: {
        amount: "$19",
        detail: "per developer",
      },
      annual: {
        amount: "$190",
        detail: "per developer, billed yearly",
      },
    },
    checkout: {
      monthly: portalCheckout("solo", "monthly"),
      annual: portalCheckout("solo", "annual"),
    },
    features: [
      "Licensed to one human developer",
      "Unlimited projects built by that developer",
      "Personal npm and download tokens tied to your account",
      "No sharing with other developers",
      "No redistribution of Pro source, packages, templates, or Figma assets",
    ],
    cta: "Choose Solo",
  },
  {
    key: "team",
    name: "Team",
    tagline: "Active seats for growing product teams.",
    icon: "users",
    featured: true,
    pricing: {
      monthly: {
        amount: "$59",
        detail: "per seat",
      },
      annual: {
        amount: "$590",
        detail: "per seat, billed yearly",
      },
    },
    checkout: {
      monthly: portalCheckout("team", "monthly"),
      annual: portalCheckout("team", "annual"),
    },
    features: [
      "Licensed by active seats (for example, 5 seats = 5 active users)",
      "Admins can remove a user and invite another",
      "Removed users lose portal, download, docs, and package access",
      "Per-user npm and download tokens, revoked when a seat is freed",
      "Audit logs and seat rotation monitoring",
    ],
    cta: "Choose Team",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "Custom terms for larger organizations.",
    icon: "building-library",
    featured: false,
    pricing: {
      monthly: {
        amount: "Custom",
        detail: "volume pricing",
      },
      annual: {
        amount: "Custom",
        detail: "annual invoice",
      },
    },
    features: [
      "Custom seat count or unlimited seats",
      "Invoice billing",
      "Optional SSO / SAML",
      "Domain-based access requests",
      "Dedicated support terms and custom legal terms",
      "Optional private registry mirroring",
    ],
    cta: "Contact sales",
    contact: true,
  },
];

export const PRO_LICENSING_NOTES = [
  "Licensing is enforced at the account, entitlement, package access, and support layer, not with runtime checks inside UI components.",
  "Checkout is handled by Lemon Squeezy. After payment, you land in the customer portal with install instructions and downloads.",
  "Premium source stays private. Access depends on authenticated portal access, per-user package tokens, and license terms, not obfuscation inside shipped bundles.",
];
