import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, ShieldCheck, UserCircle, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [role, setRole] = useState<'student' | 'staff' | 'admin'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const getPlaceholder = () => {
    if (role === 'student') return 'e.g. BSS/2026/001';
    if (role === 'staff') return 'e.g. b.amaka@biseni.edu.ng';
    return 'e.g. admin@biseni.edu.ng';
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your credentials.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password }
      );

      const { token, user } = response.data;

      // Check if role matches selected tab
      if (user.role !== role) {
        setError(`Invalid credentials for ${role} login. Please select the correct role.`);
        return;
      }

      login(user, token);

      // Navigate based on role
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/portal/dashboard');

    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid credentials. Please check your ID and password.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">

        {/* Header */}
        <div className="bg-primary p-8 text-center text-white">
          <div className="inline-block p-3 bg-white/10 rounded-xl mb-4">
            <GraduationCap className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight">School Portal</h1>
          <p className="text-white/70 text-sm mt-1">Select your access level to continue</p>
        </div>

        <div className="p-8">
          {/* Role Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
            {(['student', 'staff', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRole(r); setError(''); setEmail(''); setPassword(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
                  role === r ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Role Hint */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
            {role === 'student' && (
              <div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Student Login</p>
                <p className="text-xs text-gray-500">Use your <strong>Admission Number</strong> as ID and your <strong>surname</strong> as password.</p>
              </div>
            )}
            {role === 'staff' && (
              <div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Staff Login</p>
                <p className="text-xs text-gray-500">Use your <strong>school email address</strong> and the password provided by the admin.</p>
              </div>
            )}
            {role === 'admin' && (
              <div>
                <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Admin Login</p>
                <p className="text-xs text-gray-500">Use your <strong>admin email</strong> and password to access the control panel.</p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 font-bold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {role === 'student' ? 'Admission Number' : 'Email Address'}
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                  placeholder={getPlaceholder()}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-primary transition-all text-sm"
                  placeholder={role === 'student' ? 'Your surname (lowercase)' : '••••••••'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {role === 'student' && (
                <p className="text-[10px] text-gray-400 mt-1 ml-1">
                  Default password is your surname in lowercase e.g. <strong>jonah</strong>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading
                ? <><Loader2 className="animate-spin" size={18} /> Logging in...</>
                : `Login as ${role.toUpperCase()}`
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;