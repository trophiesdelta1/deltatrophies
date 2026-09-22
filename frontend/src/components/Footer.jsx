import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { CONTACT } from "../config/contact";

const QUICK_LINKS = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/heritage", label: "Heritage" },
  { to: "/gallery", label: "Gallery" },
  { to: "/distributors", label: "Distributors" },
  { to: "/contact", label: "Contact" },
  { to: "/bulk-enquiry", label: "Bulk Enquiry" },
];

function Footer() {
  return (
    <footer className="relative bg-darkbg mt-20 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gold/[0.04] blur-[140px] rounded-full" />

      {/* Top gradient divider line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img
                src="https://res.cloudinary.com/gufssbcd/image/upload/v1788566898/deltatrophies/logo.png"
                alt="Delta Industries"
                className="h-10 w-auto"
              />
              <span className="text-gold text-xl font-bold tracking-wider hidden sm:block">
                Delta Industries
              </span>
            </div>
            <p className="text-white/45 text-sm leading-relaxed max-w-xs">
              Crafting trophies, awards and mementos for recognition events
              since 1998. Where achievement meets artistry.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
              <span className="text-gold/80 text-[10px] tracking-[0.2em] uppercase font-semibold">
                Handcrafted in Jalandhar
              </span>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-gold text-xs tracking-[0.25em] uppercase mb-5 font-semibold">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white/45 hover:text-gold text-sm transition-all duration-200 hover:translate-x-1.5 inline-flex items-center gap-0 hover:gap-1.5 group"
                >
                  <span className="opacity-0 group-hover:opacity-100 text-gold text-xs transition-opacity duration-200">
                    →
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-gold text-xs tracking-[0.25em] uppercase mb-5 font-semibold">
              Get in Touch
            </h3>
            <div className="flex flex-col gap-4">
              <a
                href={`tel:${CONTACT.phone}`}
                className="flex items-center gap-3 text-white/45 hover:text-gold text-sm transition-all duration-200 group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-gold/20 bg-gold/[0.06] group-hover:bg-gold group-hover:text-darkbg transition-all duration-300">
                  <FiPhone className="w-3.5 h-3.5" />
                </span>
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 text-white/45 hover:text-gold text-sm transition-all duration-200 group"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-gold/20 bg-gold/[0.06] group-hover:bg-gold group-hover:text-darkbg transition-all duration-300">
                  <FiMail className="w-3.5 h-3.5" />
                </span>
                {CONTACT.email}
              </a>
              <div className="flex items-center gap-3 text-white/45 text-sm">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-gold/20 bg-gold/[0.06]">
                  <FiMapPin className="w-3.5 h-3.5 text-gold" />
                </span>
                Jalandhar, Punjab, India
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent absolute left-0" />
          <p className="text-white/25 text-xs tracking-wider relative pt-6">
            © {new Date().getFullYear()} Delta Industries. All rights reserved.
          </p>
          <p className="text-white/25 text-xs tracking-wider relative pt-6 md:pt-6">
            Est. 1998 · Jalandhar, Punjab
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
