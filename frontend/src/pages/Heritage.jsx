import { motion } from "framer-motion";
import SeoHead from "../components/SeoHead";

const founders = [
  {
    name: "Gurdeep Singh",
    role: "Founder",
    image:
      "https://res.cloudinary.com/gufssbcd/image/upload/v1788566962/deltatrophies/founders/founder_male_1.jpg",
    slogan:
      "Excellence is not a destination — it is the standard we set every single day.",
    bio: "Since founding Delta Industries in 1998, Gurdeep Singh has guided its growth as a trophy and awards manufacturer serving customers from Jalandhar, Punjab.",
  },
];

function Heritage() {
  return (
    <div className="bg-darkbg w-full min-h-screen text-white">
      <SeoHead
        title="Our Heritage | Trophy Manufacturer Since 1998 | Delta Industries"
        description="Discover the history of Delta Industries, a Jalandhar trophy and awards manufacturer established in 1998."
        canonicalPath="/heritage"
      />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <p className="text-gold text-xs tracking-[0.4em] uppercase mb-2 font-semibold">
            Our Story
          </p>
          <h1 className="text-white text-5xl font-bold">Heritage</h1>
        </motion.div>

        {/* Founders */}
        <div className="flex flex-col gap-24 mb-24">
          {founders.map((founder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center"
            >
              {/* Photo */}
              <div className={index % 2 === 1 ? "md:order-2" : ""}>
                <div className="relative">
                  <div className="absolute -inset-2 border border-gold/20" />
                  <div className="absolute -inset-4 border border-gold/10" />
                  <img
                    src={founder.image}
                    alt={founder.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-square object-cover object-top relative z-10"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
                    <p className="text-gold text-xs tracking-widest uppercase">
                      {founder.role}
                    </p>
                    <p className="text-white text-xl font-bold">
                      {founder.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "md:order-1" : ""}>
                <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4 font-semibold">
                  {founder.role}
                </p>
                <h2 className="text-white text-3xl font-bold mb-6">
                  {founder.name}
                </h2>
                <blockquote className="text-white/80 text-xl italic border-l-2 border-gold pl-6 mb-6 leading-relaxed">
                  "{founder.slogan}"
                </blockquote>
                <p className="text-white/50 text-sm leading-relaxed">
                  {founder.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="border-t border-gold/20 pt-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-white text-3xl font-bold mb-12 text-center"
          >
            Our Journey
          </motion.h2>
          <div className="flex flex-col gap-8 max-w-2xl mx-auto">
            {[
              {
                year: "1998",
                text: "Delta Industries founded in Jalandhar, Punjab by Gurdeep Singh",
              },
              {
                year: "2000",
                text: "Launched new product lines including acrylic trophies",
              },
              {
                year: "2005",
                text: "Started importing different designs of trophies of different materials from another countries",
              },
              {
                year: "2008",
                text: "Initated manufacturing of plastic trophies",
              },
              {
                year: "2020",
                text: "New factory was set up to launch new product lines including fiber and wooden trophies",
              },
              {
                year: "2024",
                text: "Serving all 29 states with 500+ unique designs and 259 catalogue products",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <p className="text-gold font-bold text-lg w-16 shrink-0">
                  {item.year}
                </p>
                <div className="flex-1 border-l border-gold/20 pl-6 pb-4">
                  <p className="text-white/70 text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Heritage;
