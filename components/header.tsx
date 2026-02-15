"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Settings, HelpCircle, DollarSign, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Add pricing to the menu items, before settings
  const menuItems = [
    { id: "pricing", href: "/pricing", label: "PRICING", icon: <DollarSign className="h-5 w-5" /> },
    { id: "settings", href: "/settings", label: "SETTINGS", icon: <Settings className="h-5 w-5" /> },
    { id: "help", href: "/help", label: "HELP", icon: <HelpCircle className="h-5 w-5" /> },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gold bg-black">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-3xl font-bold text-gold font-graffiti">
            <Code className="h-7 w-7 text-gold" />
            HUSTLER'S CODE
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <SignedIn>
            <UserButton afterSignOutUrl="/sign-in" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="border-gold text-gold hover:bg-gold/10">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="ghost" size="sm" className="text-gold hover:bg-gold/10">
                Sign up
              </Button>
            </SignUpButton>
          </SignedOut>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gold">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-black border-gold p-0 w-[300px]">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-gold">
                  <h2 className="text-2xl font-bold text-gold font-graffiti">HUSTLER'S CODE</h2>
                  <p className="text-sm text-gold/70">STACK PAPER. STAY SMART.</p>
                </div>

                <nav className="flex-1 overflow-auto">
                  <ul className="px-2 py-4 space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center px-3 py-2 rounded-md text-sm font-medium gangster-font",
                            pathname === item.href
                              ? "bg-gold/20 text-gold"
                              : "text-gold/70 hover:text-gold hover:bg-gold/10",
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          {item.icon}
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="p-6 border-t border-gold space-y-4">
                  <div className="text-xs text-gold/50 pt-2">
                    <p>HUSTLER'S CODE v2.0</p>
                    <p>© 2025 STREET ANALYTICS</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
