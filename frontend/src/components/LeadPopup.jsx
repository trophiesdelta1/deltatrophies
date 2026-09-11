import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";

function LeadPopup() {
  const location = useLocation();
  const isExcludedPage =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/bulk-enquiry";
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (isExcludedPage) return;

    const alreadySeen = localStorage.getItem("leadPopupSeen");
    if (!alreadySeen) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isExcludedPage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await API.post("/inquiries/lead", formData);
      localStorage.setItem("leadPopupSeen", "true");
      setSubmitted(true);
      setTimeout(() => setShow(false), 2000);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to submit. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem("leadPopupSeen", "true");
    setShow(false);
  };

  if (!show || isExcludedPage) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="bg-darkbg border border-gold/30 rounded-lg p-8 w-full max-w-md relative">
        <button
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 text-white/50 hover:text-gold text-xl"
        >
          ✕
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <p className="text-gold text-2xl mb-2">✓</p>
            <p className="text-white text-lg">Thank you!</p>
            <p className="text-white/50 text-sm mt-1">
              We'll be in touch soon.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl font-bold mb-1">
              Welcome to <span className="text-gold">Delta Industries</span>
            </h2>
            <p className="text-white/50 text-sm mb-6">
              Get exclusive catalogue access and special offers.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div>
                <label htmlFor="popup-name" className="sr-only">
                  Your Name
                </label>
                <input
                  id="popup-name"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-gold/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <div>
                <label htmlFor="popup-email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="popup-email"
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-gold/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <div>
                <label htmlFor="popup-phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="popup-phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-white/5 border border-gold/20 rounded px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gold text-darkbg font-bold py-3 rounded tracking-widest uppercase text-sm hover:bg-gold/90 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Get Access"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default LeadPopup;
