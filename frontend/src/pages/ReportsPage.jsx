import { useState, useEffect, useCallback } from 'react'; // Added useEffect and useCallback
import toast from 'react-hot-toast';
import { apiFetch } from '../api/client.js';
import Card from '../components/Card.jsx';
import FormInput from '../components/FormInput.jsx';
import Table from '../components/Table.jsx';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('inventory');
  const [params, setParams] = useState({ period: 'daily', status: 'PENDING', groupBy: 'date', expiryType: 'expiring' });

  // 1. Wrapped in useCallback so it only recreates when type or params change
  const generate = useCallback(async () => {
    setLoading(true);
    try {
      let path = '';
      if (type === 'inventory') path = `/reports/inventory?period=${params.period}`;
      if (type === 'inspection') path = `/reports/inspections${params.status ? `?status=${params.status}` : ''}`;
      if (type === 'maintenance') path = `/reports/maintenance?groupBy=${params.groupBy}`;
      if (type === 'expiry') path = `/reports/expiry?type=${params.expiryType}`;
      
      const res = await apiFetch(path);
      setReport(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, params]);

  // 2. Automatically run generate() whenever type or specific params update
  useEffect(() => {
    generate();
  }, [generate]);

  // --- Column Definitions for Tables ---
  const extinguisherCols = [
    { key: '_id', label: 'ID', render: (row) => row.qrCode || row._id?.slice(-6) || 'N/A' },
    { key: 'type', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'expiryDate', label: 'Expiry Date', render: (row) => row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A' }
  ];

  const inspectionCols = [
    { key: '_id', label: 'ID', render: (row) => row._id?.slice(-6) || 'N/A' },
    { key: 'extinguisherId', label: 'Extinguisher ID', render: (row) => row.extinguisherId?.slice(-6) || 'N/A' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date', render: (row) => {
        const d = row.scheduledDate || row.createdAt;
        return d ? new Date(d).toLocaleDateString() : 'N/A';
    }}
  ];

  const maintenanceCols = [
    { key: '_id', label: 'ID', render: (row) => row._id?.slice(-6) || 'N/A' },
    { key: 'extinguisherId', label: 'Extinguisher ID', render: (row) => row.extinguisherId?.slice(-6) || 'N/A' },
    { key: 'inspectorId', label: 'Inspector ID', render: (row) => row.inspectorId?.slice(-6) || 'N/A' },
    { key: 'maintenanceDate', label: 'Maintenance Date', render: (row) => row.maintenanceDate ? new Date(row.maintenanceDate).toLocaleDateString() : 'N/A' }
  ];

  // --- Helper to Render Summary Metrics ---
  const SummaryStat = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-800">{value}</p>
    </div>
  );

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reports</h1>
      
      <Card title="Generate Report">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2 text-white disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Force Refresh'}
          </button>
        </div>
      </Card>

      {/* --- Visual Data Presentation Section --- */}
      {report && (
        <div className="mt-6 flex flex-col gap-6">
          
          {/* 1. Summary Cards Layer */}
          <Card title={`${type.charAt(0).toUpperCase() + type.slice(1)} Report Summary`}>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              
              {type === 'inventory' && (
                <>
                  <SummaryStat label="Total in System" value={report.totalInSystem} />
                  <SummaryStat label={`Added (${report.period})`} value={report.addedInPeriod} />
                  <SummaryStat label="Active" value={report.byStatus?.ACTIVE || 0} />
                  <SummaryStat label="Expired/Retired" value={(report.byStatus?.EXPIRED || 0) + (report.byStatus?.RETIRED || 0)} />
                </>
              )}

              {type === 'inspection' && (
                <>
                  <SummaryStat label="Total Inspections" value={report.total} />
                  {Object.entries(report.byStatus || {}).map(([status, count]) => (
                    <SummaryStat key={status} label={status} value={count} />
                  ))}
                </>
              )}

              {type === 'maintenance' && (
                <>
                  <SummaryStat label="Total Records" value={report.total} />
                  <SummaryStat label={`Grouped by (${report.groupBy})`} value={report.groups?.length || 0} />
                </>
              )}

              {type === 'expiry' && (
                <>
                  <SummaryStat label={`Total ${report.type}`} value={report.total} />
                </>
              )}
            </div>
            <div className="mt-4 text-xs text-slate-400">
              Generated at: {new Date(report.generatedAt).toLocaleString()}
            </div>
          </Card>

          {/* 2. Detail Data Table Layer */}
          <Card title="Detailed Records">
            {type === 'inventory' && (
              <Table columns={extinguisherCols} rows={report.items} emptyMessage="No inventory items found for this period." />
            )}
            {type === 'inspection' && (
              <Table columns={inspectionCols} rows={report.items} emptyMessage="No inspections match the selected status." />
            )}
            {type === 'maintenance' && (
              <Table columns={maintenanceCols} rows={report.items} emptyMessage="No maintenance records found." />
            )}
            {type === 'expiry' && (
              <Table columns={extinguisherCols} rows={report.items} emptyMessage={`No ${report.type} records found.`} />
            )}
          </Card>

        </div>
      )}
    </div>
  );
}