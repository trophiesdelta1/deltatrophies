import { Link } from "react-router-dom";
import { CONTACT } from "../config/contact";

function Footer() {
  return (
    <footer className="bg-darkbg border-t border-gold/20 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="https://res.cloudinary.com/aunwcpnr/image/upload/v1786425474/deltatrophies/logo.png"
                alt="Delta Industries"
                className="h-10 w-auto"
              />
              <span className="text-yellow-400 text-xl font-bold tracking-wider hidden sm:block">
                Delta Industries
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Crafting trophies, awards and mementos for recognition events
              since 1998.
            </p>
          </div>

          <div>
            <h3 className="text-gold text-sm tracking-widest uppercase mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                to="/collections"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Collections
              </Link>
              <Link
                to="/heritage"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Heritage
              </Link>
              <Link
                to="/gallery"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Gallery
              </Link>
              <Link
                to="/distributors"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Distributors
              </Link>
              <Link
                to="/contact"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/bulk-enquiry"
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                Bulk Enquiry
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-gold text-sm tracking-widest uppercase mb-4">
              Contact Us
            </h3>
            <div className="flex flex-col gap-2">
              <a
                href={`tel:${CONTACT.phone}`}
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                {CONTACT.phoneDisplay}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-white/50 hover:text-gold text-sm transition-colors"
              >
                {CONTACT.email}
              </a>
              <p className="text-white/50 text-sm">Jalandhar, Punjab, India</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gold/20 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs tracking-wider">
            © {new Date().getFullYear()} Delta Industries. All rights reserved.
          </p>
          <p className="text-white/30 text-xs tracking-wider">
            Est. 1998 · Jalandhar, Punjab
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
