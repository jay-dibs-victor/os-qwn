import { useEffect, useState } from 'react';
import { Users, Truck, User, Building2, Search, Plus, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { customersApi } from '../api/customers';
import { useTenantValidation } from '../hooks/useTenantValidation';
import type { Customer, CustomerStats } from '../api/customers';

type CustomerType = 'driver' | 'rider' | 'partner';
type CustomerStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending_verification';

export default function CustomersManagement() {
  const { isValid } = useTenantValidation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | CustomerType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const pageSize = 20;

  useEffect(() => {
    fetchData();
  }, [activeTab, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats
      const statsData = await customersApi.getStats();
      setStats(statsData);

      // Fetch customers
      let data;
      if (activeTab === 'all') {
        data = await customersApi.listCustomers(page * pageSize, pageSize);
      } else {
        data = await customersApi.listByType(activeTab, page * pageSize, pageSize);
      }
      setCustomers(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await customersApi.verifyCustomer(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify customer');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await customersApi.suspendCustomer(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to suspend customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customersApi.deleteCustomer(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCustomerIcon = (type: CustomerType) => {
    switch (type) {
      case 'driver':
        return <Truck size={16} />;
      case 'rider':
        return <User size={16} />;
      case 'partner':
        return <Building2 size={16} />;
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return 'rgba(16,185,129,0.1)';
      case 'pending_verification':
        return 'rgba(255,184,0,0.1)';
      case 'suspended':
        return 'rgba(239,68,68,0.1)';
      default:
        return 'rgba(107,114,128,0.1)';
    }
  };

  const getStatusTextColor = (status: CustomerStatus) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending_verification':
        return '#fbbf24';
      case 'suspended':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '2rem' }}>
      <style>{`
        .customers-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .customers-title {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          font-family: var(--font-outfit);
        }
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          border: none;
          border-radius: 0.75rem;
          color: #000;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .add-btn:hover {
          background: rgba(255,184,0,0.9);
          transform: translateY(-2px);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 1.5rem;
          text-align: center;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--primary);
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--foreground-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          overflow-x: auto;
        }
        .tab {
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--foreground-muted);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
        }
        .search-box input {
          flex: 1;
          background: none;
          border: none;
          color: #fff;
          outline: none;
          font-size: 0.95rem;
        }
        .search-box input::placeholder {
          color: var(--foreground-muted);
        }
        .customers-table {
          width: 100%;
          border-collapse: collapse;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          overflow: hidden;
        }
        .customers-table th {
          background: rgba(255,255,255,0.04);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--foreground-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .customers-table td {
          padding: 1rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          color: #fff;
        }
        .customers-table tr:hover {
          background: rgba(255,255,255,0.02);
        }
        .customer-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
        }
        .customer-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.8rem;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 0.5rem;
          font-size: 0.8rem;
          color: #3b82f6;
          font-weight: 600;
        }
        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          padding: 0.4rem 0.8rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.4rem;
          color: #fff;
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .action-btn:hover {
          background: rgba(255,255,255,0.08);
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        .pagination button {
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.5rem;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pagination button:hover {
          background: rgba(255,255,255,0.08);
        }
        .pagination button.active {
          background: var(--primary);
          color: #000;
          border-color: var(--primary);
        }
      `}</style>

      {/* Header */}
      <div className="customers-header">
        <div>
          <div className="customers-title">Customers Management</div>
          <p style={{ color: 'var(--foreground-muted)', margin: '0.5rem 0 0 0' }}>
            Manage drivers, riders, and partners
          </p>
        </div>
        <button className="add-btn" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.drivers}</div>
            <div className="stat-label">Drivers</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.riders}</div>
            <div className="stat-label">Riders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.partners}</div>
            <div className="stat-label">Partners</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setPage(0); }}
        >
          <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          All Customers
        </button>
        <button
          className={`tab ${activeTab === 'driver' ? 'active' : ''}`}
          onClick={() => { setActiveTab('driver'); setPage(0); }}
        >
          <Truck size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Drivers
        </button>
        <button
          className={`tab ${activeTab === 'rider' ? 'active' : ''}`}
          onClick={() => { setActiveTab('rider'); setPage(0); }}
        >
          <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Riders
        </button>
        <button
          className={`tab ${activeTab === 'partner' ? 'active' : ''}`}
          onClick={() => { setActiveTab('partner'); setPage(0); }}
        >
          <Building2 size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
          Partners
        </button>
      </div>

      {/* Search */}
      <div className="search-box">
        <Search size={18} style={{ color: 'var(--foreground-muted)' }} />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>
          Loading customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--foreground-muted)' }}>
          No customers found
        </div>
      ) : (
        <>
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-name">
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td>
                    <div className="customer-type-badge">
                      {getCustomerIcon(customer.customerType as CustomerType)}
                      {customer.customerType}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <div
                      className="status-badge"
                      style={{
                        background: getStatusColor(customer.status as CustomerStatus),
                        color: getStatusTextColor(customer.status as CustomerStatus),
                      }}
                    >
                      {customer.status}
                    </div>
                  </td>
                  <td>
                    <div className="actions">
                      {customer.status === 'pending_verification' && (
                        <button
                          className="action-btn"
                          onClick={() => handleVerify(customer.id)}
                          title="Verify"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                      {customer.status === 'active' && (
                        <button
                          className="action-btn"
                          onClick={() => handleSuspend(customer.id)}
                          title="Suspend"
                        >
                          <AlertCircle size={14} />
                        </button>
                      )}
                      <button
                        className="action-btn"
                        onClick={() => setEditingId(customer.id)}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => handleDelete(customer.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <button className="active">{page + 1}</button>
            <button onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
