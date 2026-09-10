import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function NotFound() {
  return (
    <div className="bg-darkbg w-full min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Helmet>
        <title>Page Not Found | Delta Industries</title>
        <meta name="robots" content="noindex,follow" />
      </Helmet>
      <p className="text-gold text-xs tracking-[0.4em] uppercase mb-4">404</p>
      <h1 className="text-white text-3xl font-bold mb-4">Page Not Found</h1>
      <p className="text-white/50 text-sm mb-8">
        The page you're looking for doesn't exist.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="bg-gold text-darkbg font-bold px-6 py-3 text-xs tracking-widest uppercase"
        >
          Home
        </Link>
        <Link
          to="/collections"
          className="border border-gold/30 text-gold px-6 py-3 text-xs tracking-widest uppercase"
        >
          Collections
        </Link>
      </div>
    </div>
  );
}
export default NotFound;
