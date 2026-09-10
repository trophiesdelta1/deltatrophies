import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT } from '../config/contact';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-darkbg border-b border-gold/20 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-3">
  <img
  src="https://res.cloudinary.com/gufssbcd/image/upload/v1788566898/deltatrophies/logo.png"
  alt="Delta Industries"
  className="h-10 w-auto"
/>
  <span className="text-yellow-400 text-xl font-bold tracking-wider hidden sm:block">
    Delta Industries
  </span>
</Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Home
          </Link>
          <Link to="/collections" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Collections
          </Link>
          <Link to="/heritage" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Heritage
          </Link>
          <Link to="/gallery" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Gallery
          </Link>
          <Link to="/distributors" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Distributors
          </Link>
          <Link to="/contact" className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase transition-colors">
            Contact
          </Link>
        </div>

        <a
          href={`tel:${CONTACT.phone}`}
          className="hidden md:inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black text-sm font-semibold tracking-wider rounded-md hover:opacity-90 transition-opacity">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          Call Now
        </a>

        <button
          className="md:hidden text-white"
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

      </div>

      {menuOpen && (
        <div className="md:hidden bg-darkbg border-t border-gold/20 px-6 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Home</Link>
          <Link to="/collections" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Collections</Link>
          <Link to="/heritage" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Heritage</Link>
          <Link to="/gallery" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Gallery</Link>
          <Link to="/distributors" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Distributors</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="text-white/70 hover:text-yellow-400 text-sm tracking-widest uppercase">Contact</Link>

          {/* Call Now button in mobile menu */}
          <a
            href={`tel:${CONTACT.phone}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black text-sm font-semibold tracking-wider rounded-md hover:opacity-90 transition-opacity mt-2">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 24 24">
              <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
            Call Now
          </a>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
