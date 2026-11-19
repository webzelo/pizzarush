import Link from "next/link"
import { ExternalLink, Mail, MapPin, Phone } from "lucide-react"

import { Container } from "@/components/container"
import { SiteLogo } from "@/components/site-logo"
import { contact, footerNav, siteConfig, socialLinks } from "@/lib/site-config"

const footerLinkClassName =
  "text-sm text-muted-foreground transition-colors hover:text-foreground"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <SiteLogo />
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h2 className="text-sm font-semibold">Explore</h2>
            <ul className="mt-4 space-y-3">
              {footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClassName}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <address className="mt-4 space-y-3 text-sm text-muted-foreground not-italic">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>{contact.address}</span>
              </p>
              <p>
                <a
                  href={`tel:${contact.phoneHref}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {contact.phone}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {contact.email}
                </a>
              </p>
            </address>
          </div>

          <div>
            <h2 className="text-sm font-semibold">Follow us</h2>
            <ul className="mt-4 space-y-3">
              {socialLinks.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${item.label} (opens in a new tab)`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {year} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}
