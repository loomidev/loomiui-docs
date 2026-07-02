/** Licensing options from pro/strategy/pro-strategy.md */

export const PRO_LICENSING_URL = "/pro/licensing/";

export const PRO_INCLUDED = [
  "Pro components and advanced composed workflows",
  "Application templates with real routes and mock data",
  "Figma kit and theme presets",
  "Private docs, examples, and ongoing updates",
];

export const PRO_AFTER_CHECKOUT = [
  "License details and seat management",
  "Private package install instructions",
  "Template and asset downloads",
  "Pro documentation and support access",
  "Billing and subscription management",
];

export const PRO_LICENSE_PLANS = [
  {
    key: "solo",
    name: "Solo",
    tagline: "One developer, unlimited projects.",
    icon: "user",
    featured: false,
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
    features: [
      "Custom seat count or unlimited seats",
      "Invoice billing",
      "Optional SSO / SAML",
      "Domain-based access requests",
      "Dedicated support terms and custom legal terms",
      "Optional private registry mirroring",
    ],
    cta: "Contact sales",
    href: "mailto:pro@loomidev.com?subject=LoomiUI%20Pro%20Enterprise",
  },
];

export const PRO_LICENSING_NOTES = [
  "Licensing is enforced at the account, entitlement, package access, and support layer — not with runtime checks inside UI components.",
  "Checkout is handled by Stripe (or Lemon Squeezy, Paddle, or Polar). After payment, you land in a customer portal with install instructions and downloads.",
  "Premium source stays private. Access depends on authenticated portal access, per-user package tokens, and license terms — not obfuscation inside shipped bundles.",
];
