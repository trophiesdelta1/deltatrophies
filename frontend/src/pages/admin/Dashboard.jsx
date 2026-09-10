import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function Dashboard() {
  const [stats, setStats] = useState({ products: 0, leads: 0, inquiries: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchStats = async () => {
      try {
        const response = await API.get('/admin/stats', { signal: controller.signal });
        setStats({
          products: response.data.stats.products,
          leads: response.data.stats.leads,
          inquiries: response.data.stats.inquiries
        });
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') console.error(error);
      }
    };
    void fetchStats();
    return () => controller.abort();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  return (
    <div className="bg-darkbg min-h-screen pt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-gold text-xs tracking-[0.4em] uppercase mb-1">Admin Panel</p>
            <h1 className="text-white text-3xl font-bold">Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="border border-gold/20 text-white/50 hover:text-gold hover:border-gold px-6 py-2 text-sm tracking-wider uppercase transition-colors">
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total Products', value: stats.products },
            { label: 'Total Leads', value: stats.leads },
            { label: 'Total Inquiries', value: stats.inquiries },
          ].map((stat, i) => (
            <div key={i} className="border border-gold/20 p-6">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-2">{stat.label}</p>
              <p className="text-gold text-4xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/products"
            className="border border-gold/20 hover:border-gold p-6 transition-colors group">
            <p className="text-gold text-xs tracking-widest uppercase mb-2">Manage</p>
            <h3 className="text-white group-hover:text-gold text-xl font-bold transition-colors">
              Products →
            </h3>
            <p className="text-white/30 text-sm mt-2">Add, edit or delete products</p>
          </Link>
          <Link to="/admin/leads"
            className="border border-gold/20 hover:border-gold p-6 transition-colors group">
            <p className="text-gold text-xs tracking-widest uppercase mb-2">View</p>
            <h3 className="text-white group-hover:text-gold text-xl font-bold transition-colors">
              Leads & Inquiries →
            </h3>
            <p className="text-white/30 text-sm mt-2">Customer data from popup and forms</p>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
