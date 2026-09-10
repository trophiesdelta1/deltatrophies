import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', credentials);
      localStorage.setItem('adminToken', res.data.token);
      navigate('/admin/dashboard');
    } catch {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="bg-darkbg min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <span className="text-white text-2xl font-bold tracking-wider">Delta.</span>
          <span className="text-gold text-xs tracking-[0.3em] uppercase ml-2">Admin</span>
        </div>

        <div className="border border-gold/20 p-8">
          <h1 className="text-white text-xl font-bold mb-6 tracking-wider">Sign In</h1>

          {error && (
            <p className="text-red-400 text-sm mb-4 bg-red-400/10 px-4 py-2">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              required
              className="bg-white/5 border border-gold/20 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              required
              className="bg-white/5 border border-gold/20 px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-gold text-sm"
            />
            <button
              type="submit"
              className="bg-gold text-darkbg font-bold py-3 tracking-widest uppercase text-sm hover:bg-gold/90 transition-colors">
              Sign In
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
