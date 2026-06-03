import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';

function StatBox({ label, value, color = 'text-slate-800' }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value ?? 0}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/reports/dashboard');
        setData(res.data);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <Loader />;

  const ext = data?.extinguishers || {};
  const insp = data?.inspections || {};

  if (user.role === 'ADMIN') {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatBox label="Total Extinguishers" value={ext.total} />
          <StatBox label="Active" value={ext.active} color="text-green-600" />
          <StatBox label="Expired" value={ext.expired} color="text-red-600" />
          <StatBox label="Under Maintenance" value={ext.underMaintenance} color="text-blue-600" />
          <StatBox label="Total Users" value={data?.users?.total} />
          <StatBox label="Total Inspections" value={insp.total} />
        </div>
      </div>
    );
  }

  if (user.role === 'INSPECTOR') {
    const by = insp.byStatus || {};
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Inspector Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatBox label="Assigned (Scheduled)" value={by.SCHEDULED} />
          <StatBox label="Completed" value={by.COMPLETED} color="text-green-600" />
          <StatBox label="Pending" value={by.PENDING} color="text-amber-600" />
          <StatBox label="Upcoming" value={insp.upcomingScheduled} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">My Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatBox label="Extinguishers in System" value={ext.total} />
        <StatBox label="My Upcoming Inspections" value={insp.upcomingScheduled} />
        <StatBox label="Pending Inspections" value={insp.byStatus?.PENDING} />
        <StatBox label="Expired Units" value={ext.expired} color="text-red-600" />
      </div>
      <div className="mt-6">
        <Card title="Quick Actions">
          <p className="text-sm text-slate-600">
            Schedule inspections from the Inspections page and view maintenance history under Maintenance.
          </p>
        </Card>
      </div>
    </div>
  );
}
