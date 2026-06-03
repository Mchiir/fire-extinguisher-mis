import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Table from '../components/Table.jsx';
import Modal from '../components/Modal.jsx';
import FormInput from '../components/FormInput.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';

const ACTIONS = [
  'Refilled',
  'PressureAdjusted',
  'ValveReplaced',
  'SafetyPinReplaced',
  'HoseReplaced',
  'GaugeReplaced',
  'BodyCleaned',
  'Retired',
];

export default function MaintenancePage() {
  const { user } = useAuth();
  const canCreate = user.role === 'ADMIN' || user.role === 'INSPECTOR';
  const [items, setItems] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    extinguisherId: '',
    inspectionId: '',
    actionTaken: ACTIONS[0],
    conditionFound: '',
    maintenanceDate: new Date().toISOString().slice(0, 16),
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/maintenance?page=${page}&limit=10`);
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
    apiFetch('/extinguishers?limit=100').then((r) => setExtinguishers(r.data.items || []));
  }, [page]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        maintenanceDate: new Date(form.maintenanceDate).toISOString(),
      };
      if (!payload.inspectionId) delete payload.inspectionId;
      await apiFetch('/maintenance', { method: 'POST', body: JSON.stringify(payload) });
      toast.success('Maintenance logged');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    { key: 'extinguisherId', label: 'Extinguisher', render: (r) => r.extinguisherId?.slice(-6) },
    { key: 'actionTaken', label: 'Action' },
    { key: 'conditionFound', label: 'Condition' },
    { key: 'maintenanceDate', label: 'Date', render: (r) => new Date(r.maintenanceDate).toLocaleDateString() },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Maintenance History</h1>
        {canCreate && (
          <button type="button" onClick={() => setModalOpen(true)} className="rounded-lg bg-brand-600 px-4 py-2 text-sm text-white">
            Log Maintenance
          </button>
        )}
      </div>
      <Card>
        {loading ? <Loader /> : <Table columns={columns} rows={items} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Log Maintenance" wide>
        <form onSubmit={submit}>
          <FormInput
            label="Extinguisher"
            name="extinguisherId"
            as="select"
            value={form.extinguisherId}
            onChange={(e) => setForm({ ...form, extinguisherId: e.target.value })}
            required
            options={[{ value: '', label: 'Select...' }, ...extinguishers.map((e) => ({ value: e._id, label: e.serialNumber }))]}
          />
          <FormInput label="Inspection ID (optional)" name="inspectionId" value={form.inspectionId} onChange={(e) => setForm({ ...form, inspectionId: e.target.value })} />
          <FormInput
            label="Action Taken"
            name="actionTaken"
            as="select"
            value={form.actionTaken}
            onChange={(e) => setForm({ ...form, actionTaken: e.target.value })}
            options={ACTIONS.map((a) => ({ value: a, label: a }))}
          />
          <FormInput label="Condition Found" name="conditionFound" value={form.conditionFound} onChange={(e) => setForm({ ...form, conditionFound: e.target.value })} required />
          <FormInput label="Maintenance Date" name="maintenanceDate" type="datetime-local" value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })} required />
          {user.role === 'ADMIN' && (
            <FormInput label="Inspector ID" name="inspectorId" value={form.inspectorId || ''} onChange={(e) => setForm({ ...form, inspectorId: e.target.value })} />
          )}
          <button type="submit" className="w-full rounded-lg bg-brand-600 py-2 text-white">Save</button>
        </form>
      </Modal>
    </div>
  );
}
