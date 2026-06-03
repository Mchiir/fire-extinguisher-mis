import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import FormInput from '../components/FormInput.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success(res.message);
      if (res.data?.resetToken) setToken(res.data.resetToken);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-4 text-xl font-bold">Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <FormInput label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Send Reset Link</button>
        </form>
        {token && (
          <p className="mt-4 rounded bg-amber-50 p-3 text-xs text-amber-800">
            Dev reset token: <code>{token}</code> — use on reset page.
          </p>
        )}
        <p className="mt-4 text-center text-sm">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
