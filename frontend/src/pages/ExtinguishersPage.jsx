import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Table from '../components/Table.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import { confirmAction } from '../components/ConfirmDialog.jsx';

const emptyForm = {
  serialNumber: '',
  location: '',
  type: 'ABC Dry Chemical',
  size: '5kg',
  installationDate: '',
  expiryDate: '',
  status: 'ACTIVE',
};

export default function ExtinguishersPage() {
  const { user } = useAuth();
  const isAdmin = user.role === 'ADMIN';
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/extinguishers?page=${page}&limit=10`);
      setItems(res.data.items || []);
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

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditId(row._id);
    setForm({
      serialNumber: row.serialNumber,
      location: row.location,
      type: row.type,
      size: row.size,
      installationDate: row.installationDate?.slice(0, 10),
      expiryDate: row.expiryDate?.slice(0, 10),
      status: row.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await apiFetch(`/extinguishers/${editId}`, { method: 'PUT', body: JSON.stringify(form) });
        toast.success('Extinguisher updated');
      } else {
        await apiFetch('/extinguishers', { method: 'POST', body: JSON.stringify(form) });
        toast.success('Extinguisher created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirmAction({ title: 'Delete extinguisher?' });
    if (!ok) return;
    try {
      await apiFetch(`/extinguishers/${id}`, { method: 'DELETE' });
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'serialNumber', label: 'Serial' },
    { key: 'location', label: 'Location' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          {(isAdmin || user.role === 'INSPECTOR') && (
            <button type="button" onClick={() => openEdit(r)} className="text-sm text-brand-600">
              Edit
            </button>
          )}
          {isAdmin && (
            <button type="button" onClick={() => handleDelete(r._id)} className="text-sm text-red-600">
              Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Fire Extinguishers</h1>
        {isAdmin && (
          <button type="button" onClick={openCreate} className="flex items-center gap-1 rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            <Plus size={16} /> Add
          </button>
        )}
      </div>
      <Card>
        {loading ? <Loader /> : <Table columns={columns} rows={items} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? 'Edit Extinguisher' : 'New Extinguisher'} wide>
        <form onSubmit={handleSubmit}>
          <FormInput label="Serial Number" name="serialNumber" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} required />
          <FormInput label="Location" name="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
          <FormInput label="Type" name="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
          <FormInput label="Size" name="size" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} required />
          <FormInput label="Installation Date" name="installationDate" type="date" value={form.installationDate} onChange={(e) => setForm({ ...form, installationDate: e.target.value })} required />
          <FormInput label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} required />
          {editId && (
            <FormInput
              label="Status"
              name="status"
              as="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={['ACTIVE', 'INSPECTION_DUE', 'UNDER_MAINTENANCE', 'EXPIRED', 'RETIRED'].map((v) => ({ value: v, label: v }))}
            />
          )}
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Save</button>
        </form>
      </Modal>
    </div>
  );
}
