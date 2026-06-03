import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import FormInput from '../components/FormInput.jsx';

export default function ProfilePage() {
  const { user, reloadUser } = useAuth();
  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) });
      toast.success('Profile updated');
      reloadUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/auth/change-password', { method: 'PUT', body: JSON.stringify(passwords) });
      toast.success('Password changed — please login again');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Profile">
        <form onSubmit={saveProfile}>
          <FormInput label="First Name" name="firstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
          <FormInput label="Last Name" name="lastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
          <FormInput label="Email" name="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">Save Profile</button>
        </form>
      </Card>
      <Card title="Change Password">
        <form onSubmit={changePassword}>
          <FormInput label="Current Password" name="currentPassword" type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
          <FormInput label="New Password" name="newPassword" type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-white">Update Password</button>
        </form>
      </Card>
    </div>
  );
}
