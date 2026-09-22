import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhone, FiMenu, FiX } from "react-icons/fi";
import { CONTACT } from "../config/contact";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/heritage", label: "Heritage" },
  { to: "/gallery", label: "Gallery" },
  { to: "/distributors", label: "Distributors" },
  { to: "/contact", label: "Contact" },
];

function NavLink({ to, label, isActive, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative text-sm tracking-widest uppercase transition-colors duration-300 ${
        isActive ? "text-gold" : "text-white/70 hover:text-gold"
      }`}
    >
      {label}
      {isActive && (
        <motion.span
          layoutId="navIndicator"
          className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </Link>
  );
}

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.25 } },
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    return pathname.startsWith(to);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-darkbg/80 backdrop-blur-xl border-b border-gold/15 shadow-[0_1px_20px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="https://res.cloudinary.com/gufssbcd/image/upload/v1788566898/deltatrophies/logo.png"
            alt="Delta Industries"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
          />
          <span className="text-gold text-xl font-bold tracking-wider hidden sm:block">
            Delta Industries
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              label={link.label}
              isActive={isActive(link.to)}
            />
          ))}
        </div>

        {/* Call Now Button — Desktop */}
        <a
          href={`tel:${CONTACT.phone}`}
          className="hidden md:inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold via-amber-400 to-gold text-darkbg text-sm font-bold tracking-wider rounded-md shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:-translate-y-0.5 transition-all duration-300"
        >
          <FiPhone className="w-4 h-4" />
          Call Now
        </a>

        {/* Hamburger — Mobile */}
        <button
          className="md:hidden text-white/80 hover:text-gold transition-colors p-1"
          type="button"
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <FiX className="w-6 h-6" />
          ) : (
            <FiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu — Animated */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="md:hidden overflow-hidden border-t border-gold/15 bg-darkbg/95 backdrop-blur-xl"
          >
            <div className="px-6 py-5 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <motion.div key={link.to} variants={linkVariants}>
                  <Link
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={`block text-sm tracking-widest uppercase transition-all duration-200 hover:translate-x-1.5 ${
                      isActive(link.to)
                        ? "text-gold font-semibold"
                        : "text-white/70 hover:text-gold"
                    }`}
                  >
                    {isActive(link.to) && (
                      <span className="inline-block w-2 h-2 rounded-full bg-gold mr-3 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              {/* Call Now — Mobile */}
              <motion.div variants={linkVariants}>
                <a
                  href={`tel:${CONTACT.phone}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-gold via-amber-400 to-gold text-darkbg text-sm font-bold tracking-wider rounded-md shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all duration-300 mt-2 w-full"
                >
                  <FiPhone className="w-4 h-4" />
                  Call Now
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;
