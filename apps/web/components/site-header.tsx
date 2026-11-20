"use client"

import { useEffect, useState } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { AccountNav } from "@/components/auth/account-nav"
import { Container } from "@/components/container"
import { SiteLogo } from "@/components/site-logo"
import { mainNav } from "@/lib/site-config"

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function navLinkClassName(isActive: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground",
    isActive ? "bg-muted text-foreground" : "text-muted-foreground"
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between gap-4">
        <SiteLogo onClick={() => setIsOpen(false)} />

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {mainNav.map((item) => {
            const isActive = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={navLinkClassName(isActive)}
              >
                {item.label}
              </Link>
            )
          })}

          <span className="mx-2 h-5 w-px bg-border" aria-hidden="true" />

          <AccountNav />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <AccountNav variant="compact" onNavigate={() => setIsOpen(false)} />

          <button
            type="button"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsOpen((open) => !open)}
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            {isOpen ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      <nav
        id="mobile-navigation"
        hidden={!isOpen}
        aria-label="Mobile navigation"
        className="border-t md:hidden"
      >
        <Container className="flex flex-col gap-1 py-4">
          {mainNav.map((item) => {
            const isActive = isActivePath(pathname, item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={navLinkClassName(isActive)}
              >
                {item.label}
              </Link>
            )
          })}

          <AccountNav variant="menu" onNavigate={() => setIsOpen(false)} />
        </Container>
      </nav>
    </header>
  )
}
