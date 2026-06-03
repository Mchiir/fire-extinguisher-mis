import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import FormInput from '../components/FormInput.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-brand-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-brand-700">
          <Flame size={32} />
          <h1 className="text-2xl font-bold">Fire Extinguisher MIS</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
          <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} required />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          No account? <Link to="/register" className="text-brand-600 hover:underline">Register</Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/forgot-password" className="text-slate-500 hover:underline">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
}
