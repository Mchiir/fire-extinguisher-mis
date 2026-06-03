import { useEffect, useState } from 'react';
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

export default function InspectionsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ extinguisherId: '', scheduledDate: '', notes: '' });
  const [inspectorId, setInspectorId] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/inspections?page=${page}&limit=10`);
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
    if (user.role === 'USER' || user.role === 'ADMIN') {
      apiFetch('/extinguishers?limit=100').then((r) => setExtinguishers(r.data.items || []));
    }
    if (user.role === 'ADMIN') {
      apiFetch('/users?role=INSPECTOR&limit=100').then((r) => setInspectors(r.data.users || []));
    }
  }, [page, user.role]);

  const schedule = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/inspections', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          scheduledDate: new Date(form.scheduledDate).toISOString(),
        }),
      });
      toast.success('Inspection scheduled');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const assign = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/inspections/${selectedId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ inspectorId }),
      });
      toast.success('Inspector assigned');
      setAssignModal(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const complete = async (id) => {
    const ok = await confirmAction({ title: 'Mark inspection completed?' });
    if (!ok) return;
    try {
      await apiFetch(`/inspections/${id}/complete`, { method: 'PATCH', body: '{}' });
      toast.success('Inspection completed');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const cancel = async (id) => {
    const ok = await confirmAction({ title: 'Cancel this inspection?' });
    if (!ok) return;
    try {
      await apiFetch(`/inspections/${id}/cancel`, { method: 'PATCH', body: '{}' });
      toast.success('Cancelled');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'extinguisherId', label: 'Extinguisher', render: (r) => r.extinguisherId?.slice(-6) },
    { key: 'scheduledDate', label: 'Scheduled', render: (r) => new Date(r.scheduledDate).toLocaleString() },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          {user.role === 'ADMIN' && r.status === 'PENDING' && (
            <button type="button" className="text-sm text-brand-600" onClick={() => { setSelectedId(r._id); setAssignModal(true); }}>
              Assign
            </button>
          )}
          {user.role === 'INSPECTOR' && r.status === 'SCHEDULED' && (
            <button type="button" className="text-sm text-green-600" onClick={() => complete(r._id)}>Complete</button>
          )}
          {(user.role === 'USER' || user.role === 'ADMIN') && r.status !== 'COMPLETED' && r.status !== 'CANCELLED' && (
            <button type="button" className="text-sm text-red-600" onClick={() => cancel(r._id)}>Cancel</button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inspections</h1>
        {(user.role === 'USER' || user.role === 'ADMIN') && (
          <button type="button" onClick={() => setModalOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            Schedule Inspection
          </button>
        )}
      </div>
      <Card>
        {loading ? <Loader /> : <Table columns={columns} rows={items} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Inspection" wide>
        <form onSubmit={schedule}>
          <FormInput
            label="Extinguisher"
            name="extinguisherId"
            as="select"
            value={form.extinguisherId}
            onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}
            required
            options={[{ value: '', label: 'Select...' }, ...extinguishers.map((e) => ({ value: e._id, label: `${e.serialNumber} - ${e.location}` }))]}
          />
          <FormInput label="Date & Time" name="scheduledDate" type="datetime-local" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required />
          <FormInput label="Notes" name="notes" as="textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Schedule</button>
        </form>
      </Modal>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Inspector">
        <form onSubmit={assign}>
          <FormInput
            label="Inspector"
            name="inspectorId"
            as="select"
            value={inspectorId}
            onChange={(e) => setInspectorId(e.target.value)}
            required
            options={[{ value: '', label: 'Select...' }, ...inspectors.map((i) => ({ value: i._id, label: `${i.firstName} ${i.lastName}` }))]}
          />
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Assign</button>
        </form>
      </Modal>
    </div>
  );
}
