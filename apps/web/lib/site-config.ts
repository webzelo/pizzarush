export type NavItem = {
  label: string
  href: string
}

export type SocialLink = {
  label: string
  href: string
}

export const siteConfig = {
  name: "PizzaHub",
  description:
    "Freshly baked pizza, made with quality ingredients and delivered hot to your door.",
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
]

export const authNav = {
  signIn: { label: "Sign In", href: "/sign-in" },
  signUp: { label: "Sign Up", href: "/sign-up" },
}

export const footerNav: NavItem[] = [...mainNav, authNav.signIn, authNav.signUp]

// Placeholder business details — replace before launch.
export const contact = {
  address: "123 Slice Street, Pizza City, PC 12345",
  phone: "+1 (555) 123-4567",
  phoneHref: "+15551234567",
  email: "hello@pizzahub.com",
}

export const socialLinks: SocialLink[] = [
  { label: "Instagram", href: "https://instagram.com/pizzahub" },
  { label: "Facebook", href: "https://facebook.com/pizzahub" },
  { label: "X", href: "https://x.com/pizzahub" },
]
