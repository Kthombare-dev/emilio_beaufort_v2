"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetClose,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';


const navItems = [
  { name: 'Philosophy', href: '#philosophy' },
  { name: 'The House', href: '#house' },
  { name: 'Journal', href: '#journal' },
  { name: 'Meet The Brains', href: '#team' },
  {name: 'Products', href: '/products'},
  { name: 'Career', href: '/careers' },
  // { name: 'Alliances', href: '#alliances' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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

  // Effect to handle scrolling when redirected with a hash
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

  const handlePartnerClick = async () => {
    setIsOpen(false);
    
    if (isHomePage) {
      const alliancesSection = document.querySelector('#alliances');
      if (alliancesSection) {
        alliancesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      await router.push('/#alliances');
    }
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-premium ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md border-b border-premium shadow-premium' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="container-premium">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo - Left Side */}
          <motion.div
            className={`heading-premium text-xl sm:text-2xl lg:text-2xl cursor-pointer transition-colors duration-300 ${isHomePage && !isScrolled ? 'text-white' : 'text-premium'}`}
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Emilio Beaufort
          </motion.div>

          {/* Desktop Navigation - Visible on tablet and larger screens */}
          <div className="hidden sm:flex items-center justify-center space-x-4 lg:space-x-6 xl:space-x-8 flex-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                className={`font-sans-medium text-xs lg:text-sm xl:text-base transition-premium relative group ${isHomePage && !isScrolled ? 'text-white hover:text-gold' : 'text-premium hover:text-gold'}`}
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

          {/* Partner Button - Visible on tablet and larger screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="hidden sm:block"
          >
            <Button
              onClick={handlePartnerClick}
              className="bg-black hover:bg-gray-800 text-white text-xs lg:text-sm xl:text-base px-3 lg:px-4 xl:px-6 transition-colors duration-300"
              size="sm"
            >
              Partner With Us
            </Button>
          </motion.div>

          {/* Mobile Navigation - Only visible on mobile screens */}
          <div className="sm:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button className={`transition-premium ${isHomePage && !isScrolled ? 'text-white hover:text-gold' : 'text-premium hover:text-gold'}`}>
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] bg-white border-l border-premium p-0"
                hideCloseButton
              >
                <SheetHeader className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <SheetTitle className="font-serif text-lg">Menu</SheetTitle>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-gray-500 hover:text-gray-900 transition-premium rounded-full hover:bg-gray-100 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </SheetHeader>
                <nav className="flex flex-col p-4" aria-label="Mobile Navigation">
                  {navItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className="font-sans-medium text-base text-premium hover:text-gold transition-premium text-left py-3 border-b border-gray-100 last:border-none"
                    >
                      {item.name}
                    </button>
                  ))}
                  <Button
                    onClick={handlePartnerClick}
                    className="bg-black hover:bg-gray-800 text-white w-full mt-6 py-4 text-sm transition-colors duration-300"
                  >
                    Partner With Us
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 



