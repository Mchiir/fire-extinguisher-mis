import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import Card from '../components/Card.jsx';
import FormInput from '../components/FormInput.jsx';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('inventory');
  const [params, setParams] = useState({ period: 'daily', status: 'PENDING', groupBy: 'date', expiryType: 'expiring' });

  const generate = async () => {
    setLoading(true);
    setReport(null);
    try {
      let path = '';
      if (type === 'inventory') path = `/reports/inventory?period=${params.period}`;
      if (type === 'inspection') path = `/reports/inspections${params.status ? `?status=${params.status}` : ''}`;
      if (type === 'maintenance') path = `/reports/maintenance?groupBy=${params.groupBy}`;
      if (type === 'expiry') path = `/reports/expiry?type=${params.expiryType}`;
      const res = await apiFetch(path);
      setReport(res.data);
      toast.success('Report generated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      <Card title="Generate Report">
        <FormInput
          label="Report Type"
          name="type"
          as="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'inventory', label: 'Inventory' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'expiry', label: 'Expiry' },
          ]}
        />
        {type === 'inventory' && (
          <FormInput
            label="Period"
            name="period"
            as="select"
            value={params.period}
            onChange={(e) => setParams({ ...params, period: e.target.value })}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        )}
        {type === 'inspection' && (
          <FormInput
            label="Status"
            name="status"
            as="select"
            value={params.status}
            onChange={(e) => setParams({ ...params, status: e.target.value })}
            options={['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((v) => ({ value: v, label: v }))}
          />
        )}
        {type === 'maintenance' && (
          <FormInput
            label="Group By"
            name="groupBy"
            as="select"
            value={params.groupBy}
            onChange={(e) => setParams({ ...params, groupBy: e.target.value })}
            options={[
              { value: 'date', label: 'Date' },
              { value: 'inspector', label: 'Inspector' },
              { value: 'extinguisher', label: 'Extinguisher' },
            ]}
          />
        )}
        {type === 'expiry' && (
          <FormInput
            label="Expiry Type"
            name="expiryType"
            as="select"
            value={params.expiryType}
            onChange={(e) => setParams({ ...params, expiryType: e.target.value })}
            options={[
              { value: 'expiring', label: 'Expiring Soon' },
              { value: 'expired', label: 'Expired' },
              { value: 'retired', label: 'Retired' },
            ]}
          />
        )}
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-6 py-2 text-white disabled:opacity-60"
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </Card>
      {report && (
        <div className="mt-6">
          <Card title="Report Output">
            <pre className="max-h-96 overflow-auto rounded bg-slate-900 p-4 text-xs text-green-300">
              {JSON.stringify(report, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
}
