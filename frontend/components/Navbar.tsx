"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import PartnershipFormDialog from './ui/PartnershipFormDialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

// --- Sub-components --- //
type LogoProps = {
  isHomePage: boolean;
  isScrolled: boolean;
  onClick: () => void;
};

function Logo({ isHomePage, isScrolled, onClick }: LogoProps) {
  return (
    <motion.div
      className={`
        heading-premium text-2xl cursor-pointer transition-colors duration-300
        ${isHomePage && !isScrolled ? 'text-black' : 'text-premium'}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      Emilio Beaufort
    </motion.div>
  );
}

type PartnerButtonProps = {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
};

function PartnerButton({ onClick, className = "", size = "sm" }: PartnerButtonProps) {
  return (
    <Button
      onClick={onClick}
      className={`btn-primary-premium ${className}`}
      size={size}
    >
      Partner With Us
    </Button>
  );
}

// --- Main Navbar --- //
const navItems = [
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'The House', href: '#house' },
  { name: 'Journal', href: '#journal' },
  { name: 'Meet The Brains', href: '#team' },
  { name: 'Products', href: '/products' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isPartnerDialogOpen, setIsPartnerDialogOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to handle scrolling to anchor when on home
  useEffect(() => {
    if (isHomePage && window.location.hash) {
      const element = document.querySelector(window.location.hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [isHomePage]);

  const handleNavigation = async (href: string) => {
    setIsOpen(false);

    // If it's a hash link (anchor), handle scroll
    if (isHomePage && href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    // If not on home page but it's a hash link, go to home with hash
    if (href.startsWith('#')) {
      await router.push(`/${href}`);
      return;
    }
    // For all other links (pages)
    await router.push(href);
  };

  const handleLogoClick = async () => {
    if (isHomePage) {
      const heroSection = document.querySelector('#hero');
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      await router.push('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePartnerClick = () => {
    setIsOpen(false);
    setIsPartnerDialogOpen(true);
  };

  return (
    <>
      {/* Nav bar, fixed with always visible white glass effect */}
      <motion.nav
        className="
          fixed top-0 left-0 right-0 z-40 
          bg-white/70 backdrop-blur-lg border border-white/30 shadow-lg
          transition-premium
        "
        style={{ height: 56 }} // 56px = h-14
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Logo pinned to left edge */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50">
          <Logo isHomePage={isHomePage} isScrolled={isScrolled} onClick={handleLogoClick} />
        </div>

        {/* Centered nav items */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center gap-12">
          {navItems.map((item, index) => (
            <motion.button
              key={item.name}
              className={`font-sans-medium transition-premium relative group ${
                isHomePage && !isScrolled ? 'text-black hover:text-gold' : 'text-premium hover:text-gold'
              }`}
              onClick={() => handleNavigation(item.href)}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -2 }}
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold transition-premium group-hover:w-full"></span>
            </motion.button>
          ))}
        </div>

        {/* Partner button pinned to right edge (desktop) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:block z-50">
          <PartnerButton onClick={handlePartnerClick} />
        </div>

        {/* Mobile: Hamburger menu pinned to right edge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex md:hidden z-50">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button className={`transition-premium ${isHomePage && !isScrolled ? 'text-white hover:text-gold' : 'text-premium hover:text-gold'}`}>
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] bg-white border-l border-premium p-0"
              hideCloseButton
            >
              <SheetHeader className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <SheetTitle className="font-serif text-xl">Menu</SheetTitle>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-900 transition-premium rounded-full hover:bg-gray-100 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </SheetHeader>
              <nav className="flex flex-col p-6" aria-label="Mobile Navigation">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.href)}
                    className="font-sans-medium text-lg text-premium hover:text-gold transition-premium text-left py-4 border-b border-gray-100 last:border-none"
                  >
                    {item.name}
                  </button>
                ))}
                <PartnerButton onClick={handlePartnerClick} className="w-full mt-8 py-6" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </motion.nav>

      {/* Modal dialog */}
      <PartnershipFormDialog
        isOpen={isPartnerDialogOpen}
        onClose={() => setIsPartnerDialogOpen(false)}
      />
    </>
  );
}

