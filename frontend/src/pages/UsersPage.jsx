import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import Card from '../components/Card.jsx';
import Table from '../components/Table.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import { confirmAction } from '../components/ConfirmDialog.jsx';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'INSPECTOR',
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/users?page=${page}&limit=10`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const createInspector = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/users', { method: 'POST', body: JSON.stringify(form) });
      toast.success('User created');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    const ok = await confirmAction({ title: 'Delete user?' });
    if (!ok) return;
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' });
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <Badge value={r.role} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <button type="button" className="text-sm text-red-600" onClick={() => remove(r._id)}>
          Delete
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <button type="button" onClick={() => setModalOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
          Register Inspector
        </button>
      </div>
      <Card>
        {loading ? <Loader /> : <Table columns={columns} rows={users} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Inspector" wide>
        <form onSubmit={createInspector}>
          <FormInput label="First Name" name="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <FormInput label="Last Name" name="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          <FormInput label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <FormInput label="Password" name="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <FormInput
            label="Role"
            name="role"
            as="select"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'INSPECTOR', label: 'Inspector' },
              { value: 'USER', label: 'User' },
            ]}
          />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Create</button>
        </form>
      </Modal>
    </div>
  );
}
