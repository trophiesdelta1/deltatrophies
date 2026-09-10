import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiMessageSquare,
  FiSend,
  FiCheckCircle,
  FiPhoneCall,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import API from "../api/axios";
import { CONTACT } from "../config/contact";
import SeoHead from "../components/SeoHead";

const salesTeam = [
  { name: "Komal", phone: "92165-77789" },
  { name: "Navneet", phone: "87596-66665" },
  { name: "Nidhi", phone: "95924-13333" },
  { name: "Pooja Sharma", phone: "77194-36916" },
  { name: "Sweety", phone: "95179-11665" },
];

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/inquiries", formData);
      setSubmitted(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.error ||
          "Unable to send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0b0c10] text-white min-h-screen selection:bg-gold selection:text-black">
      <SeoHead
        title="Contact Delta Industries | Trophy Manufacturer in Jalandhar"
        description="Contact Delta Industries for custom trophy orders, bulk enquiries and dealership information in Jalandhar, Punjab."
        canonicalPath="/contact"
      />

      {/* Decorative subtle background radial glow */}
      <div className="relative overflow-hidden pt-32 pb-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-gold text-xs font-semibold tracking-[0.35em] uppercase px-3 py-1 bg-gold/10 rounded-full border border-gold/20 inline-block mb-4">
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Let's Craft Something{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-200 to-gold">
              Remarkable
            </span>
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            Have a question about custom trophies, bulk corporate orders, or
            dealership opportunities? Connect directly with our team.
          </p>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info, Sales Team & WhatsApp */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 flex flex-col gap-6"
          >
            {/* Quick Contact Cards */}
            <div className="bg-[#121318] border border-white/[0.08] rounded-2xl p-6 shadow-xl space-y-5">
              <h2 className="text-xs font-bold tracking-widest text-gold uppercase mb-2">
                Direct Channels
              </h2>

              <a
                href={`tel:${CONTACT.phone}`}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
              >
                <div className="p-3 bg-gold/10 text-gold rounded-xl border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                  <FiPhone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Phone Support
                  </p>
                  <p className="text-white font-medium text-sm md:text-base group-hover:text-gold transition-colors">
                    {CONTACT.phoneDisplay}
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
              >
                <div className="p-3 bg-gold/10 text-gold rounded-xl border border-gold/20 group-hover:bg-gold group-hover:text-black transition-all">
                  <FiMail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Email Enquiries
                  </p>
                  <p className="text-white font-medium text-sm md:text-base group-hover:text-gold transition-colors">
                    {CONTACT.email}
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4 p-3 rounded-xl">
                <div className="p-3 bg-gold/10 text-gold rounded-xl border border-gold/20">
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider font-semibold">
                    Headquarters
                  </p>
                  <p className="text-white font-medium text-sm">
                    Jalandhar, Punjab, India
                  </p>
                </div>
              </div>

              {/* WhatsApp Quick Trigger */}
              <a
                href={`https://wa.me/${CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-[#25D366]/30 font-semibold py-3.5 px-4 rounded-xl transition-all duration-300 group shadow-md"
              >
                <FaWhatsapp className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm tracking-wide">
                  Quick Chat on WhatsApp
                </span>
              </a>
            </div>

            {/* Sales Representatives */}
            <div className="bg-[#121318] border border-white/[0.08] rounded-2xl p-6 shadow-xl">
              <h2 className="text-xs font-bold tracking-widest text-gold uppercase mb-4">
                Dedicated Sales Representatives
              </h2>
              <div className="space-y-3">
                {salesTeam.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-gold/30 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {member.name}
                        </p>
                        <p className="text-white/40 text-xs">{member.phone}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:+91${member.phone.replace(/\D/g, "")}`}
                      className="inline-flex items-center gap-1.5 text-gold hover:text-black border border-gold/30 hover:bg-gold px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-200"
                    >
                      <FiPhoneCall className="w-3.5 h-3.5" />
                      <span>Call</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form & Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 flex flex-col gap-6"
          >
            {/* Inquiry Form */}
            <div className="bg-[#121318] border border-white/[0.08] rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">
                  Send Us a Message
                </h2>
                <p className="text-white/50 text-xs mt-1">
                  Fill out the form below and we will respond within 24 business
                  hours.
                </p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gold/5 border border-gold/20 rounded-xl p-8 text-center my-8"
                >
                  <FiCheckCircle className="text-gold w-14 h-14 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">
                    Inquiry Received
                  </h3>
                  <p className="text-white/60 text-sm max-w-sm mx-auto">
                    Thank you for reaching out. Our team will review your
                    requirements and get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-xs text-gold uppercase tracking-widest underline hover:text-white transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="text-xs font-semibold tracking-wider text-white/70 uppercase"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="e.g. Rahul Sharma"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                          className="w-full bg-[#181a20] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="email"
                        className="text-xs font-semibold tracking-wider text-white/70 uppercase"
                      >
                        Email Address
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="e.g. rahul@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                          className="w-full bg-[#181a20] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone"
                      className="text-xs font-semibold tracking-wider text-white/70 uppercase"
                    >
                      Phone / Mobile Number
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        className="w-full bg-[#181a20] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="text-xs font-semibold tracking-wider text-white/70 uppercase"
                    >
                      Message / Custom Requirement
                    </label>
                    <div className="relative">
                      <FiMessageSquare className="absolute left-3.5 top-3.5 text-white/30 w-4 h-4" />
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Tell us about the trophy type, quantity, or specific customization needed..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                        className="w-full bg-[#181a20] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold via-amber-400 to-gold text-black font-bold py-3.5 px-6 rounded-xl uppercase tracking-widest text-xs hover:opacity-95 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Google Map Section */}
            <div className="bg-[#121318] border border-white/[0.08] rounded-2xl p-4 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-2 pb-3">
                <p className="text-xs font-semibold tracking-widest text-gold uppercase">
                  Manufacturing Facility Location
                </p>
                <span className="text-[11px] text-white/40">
                  Jalandhar, Punjab
                </span>
              </div>
              <div className="w-full h-64 rounded-xl overflow-hidden border border-white/[0.05]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3405.4571601665684!2d75.51642477488356!3d31.401528274268564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391a4f64b7c9fb9f%3A0xc86f38e473824c27!2sDelta%20Souvenirs%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1787626418363!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Delta Industries Location"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
