import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Card from '../components/Card.jsx';
import Table from '../components/Table.jsx';
import Badge from '../components/Badge.jsx';
import Pagination from '../components/Pagination.jsx';
import Loader from '../components/Loader.jsx';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const query = `page=${page}&limit=10`;
      const res = await apiFetch(`/notifications?${query}`);
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

  const columns = [
    { key: 'title', label: 'Title' },
    { key: 'message', label: 'Message' },
    { key: 'status', label: 'Status', render: (r) => <Badge value={r.status} /> },
    { key: 'sentAt', label: 'Sent', render: (r) => (r.sentAt ? new Date(r.sentAt).toLocaleString() : '—') },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Notifications</h1>
      <Card>
        {loading ? <Loader /> : <Table columns={columns} rows={items} />}
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </Card>
    </div>
  );
}
