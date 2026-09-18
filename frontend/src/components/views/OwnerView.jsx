'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OwnerAPI } from '../../services/api';

export default function OwnerView() {
  const {
    currentUser,
    setIsAddPropertyModalOpen,
    setIsUtilityVerificationModalOpen,
    setIsProofVaultModalOpen,
    setIsStripePaymentModalOpen,
    showToast
  } = useApp();

  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [maintenanceTickets, setMaintenanceTickets] = useState([
    {
      id: 'maint-101',
      tenant: 'Current Resident (You)',
      property: 'Palm Grove Luxury Living - Flat 402',
      issue: 'Geyser dripping into drain',
      category: 'Plumbing',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: '2 hours ago',
      description: 'Minor drip from the inlet valve during morning water heating cycle.'
    },
    {
      id: 'maint-102',
      tenant: 'Aarav Sharma',
      property: 'Sunrise Heights SG Highway',
      issue: 'AC Master bedroom filter service',
      category: 'Appliance',
      status: 'New',
      priority: 'Low',
      createdAt: '1 day ago',
      description: 'Pre-summer servicing and filter dust cleaning required.'
    }
  ]);

  // Modals for Owner Actions
  const [confirmStatusModal, setConfirmStatusModal] = useState(null); // { id, title, currentStatus, nextStatus }
  const [editingProperty, setEditingProperty] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', rent: 0, deposit: 0, status: 'Active', locality: '' });

  const loadDashboard = () => {
    OwnerAPI.getDashboard().then(res => {
      if (res && res.data) {
        setData(res.data);
      }
    });
  };

  const loadApplications = () => {
    setLoadingApps(true);
    OwnerAPI.getApplications().then(res => {
      if (res && res.data) {
        setApplications(res.data);
      }
    }).finally(() => {
      setLoadingApps(false);
    });
  };

  useEffect(() => {
    loadDashboard();
    loadApplications();
  }, []);

  const openConfirmStatus = (p) => {
    const nextStatus = p.status === 'Occupied' || p.status === 'Found' ? 'Active' : 'Found';
    setConfirmStatusModal({
      id: p.id,
      title: p.title,
      currentStatus: p.status,
      nextStatus
    });
  };

  const executeStatusChange = async () => {
    if (!confirmStatusModal) return;
    const { id, nextStatus } = confirmStatusModal;
    try {
      await OwnerAPI.toggleListingStatus(id, nextStatus);
      showToast(
        nextStatus === 'Found'
          ? 'Listing marked as FOUND/OCCUPIED. Hidden from tenant search results.'
          : 'Listing marked as ACTIVE. Now accepting new applications.',
        nextStatus === 'Found' ? 'info' : 'success'
      );
      setConfirmStatusModal(null);
      loadDashboard();
    } catch (e) {
      showToast('Error updating status', 'error');
    }
  };

  const openEditModal = (p) => {
    setEditingProperty(p);
    setEditForm({
      title: p.title,
      rent: p.rent,
      deposit: p.deposit || p.rent * 2,
      status: p.status,
      locality: p.locality
    });
  };

  const handleSavePropertyEdit = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;
    try {
      await OwnerAPI.updateProperty(editingProperty.id, editForm);
      showToast(`Property "${editForm.title}" updated successfully!`, 'success');
      setEditingProperty(null);
      loadDashboard();
    } catch (err) {
      showToast('Failed to save property updates.', 'error');
    }
  };

  const handleApplicationAction = async (appId, action) => {
    try {
      const res = await OwnerAPI.updateApplicationStatus(appId, action);
      if (res && res.success) {
        showToast(
          action === 'accept'
            ? 'Application ACCEPTED! Lease agreement dispatched to tenant.'
            : action === 'reject'
            ? 'Application rejected.'
            : 'Information request sent to applicant via WhatsApp & SMS.',
          action === 'accept' ? 'success' : 'info'
        );
        loadApplications();
      }
    } catch (err) {
      showToast('Failed to update application.', 'error');
    }
  };

  const handleMaintenanceStatusUpdate = async (ticketId, nextStatus) => {
    try {
      await OwnerAPI.updateMaintenanceStatus(ticketId, nextStatus);
      setMaintenanceTickets(prev =>
        prev.map(t => (t.id === ticketId ? { ...t, status: nextStatus } : t))
      );
      showToast(`Maintenance ticket ${ticketId} status updated to "${nextStatus}".`, 'success');
    } catch (err) {
      showToast('Failed to update ticket status.', 'error');
    }
  };

  const stats = data?.stats || {
    activeProperties: 8,
    occupiedUnits: 7,
    occupancyRate: '87.5%',
    monthlyRevenue: 142000,
    pendingMaintenance: 2,
    onTimePayments: '94%'
  };

  const properties = data?.properties || [];
  const ownerName = currentUser?.fullName || 'Landlord Partner';

  return (
    <section className="view-panel active" id="view-owner">
      <div className="container" style={{ padding: '32px 24px 80px' }}>
        {/* Dynamic Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>LANDLORD &amp; PROPERTY HOST HUB</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Greetings, {ownerName} 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
              Direct portfolio oversight, live applications, automated escrow payouts, and maintenance relay resolution.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsUtilityVerificationModalOpen(true)}
            >
              📄 Utility OCR Verify
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setIsProofVaultModalOpen(true)}
            >
              📦 Proof Vault Handover
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddPropertyModalOpen(true)}
            >
              + List New Property
            </button>
          </div>
        </div>

        {/* Dynamic KPI Overview */}
        <div className="tenant-kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Active Portfolio Units</div>
            <div className="kpi-value">{stats.activeProperties} Units</div>
            <div className="kpi-subtext" style={{ color: 'var(--accent-emerald-dark)' }}>
              {stats.occupiedUnits} Currently Occupied
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Portfolio Occupancy</div>
            <div className="kpi-value">{stats.occupancyRate}</div>
            <div className="kpi-subtext">Avg time to lease: 6 days</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Monthly Gross Revenue</div>
            <div className="kpi-value" style={{ color: 'var(--primary)' }}>
              ₹{Number(stats.monthlyRevenue).toLocaleString('en-IN')}
            </div>
            <div className="kpi-subtext">Automated direct bank payout</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Pending Maintenance</div>
            <div className="kpi-value" style={{ color: 'var(--accent-amber)' }}>
              {maintenanceTickets.filter(t => t.status !== 'Resolved').length} Tickets
            </div>
            <div className="kpi-subtext">Relay bot SLA &lt; 48h</div>
          </div>
        </div>

        {/* SECTION 1: PROPERTIES MANAGEMENT TABLE */}
        <div className="owner-table-card" style={{ marginTop: '36px' }}>
          <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Managed Living Units &amp; Availability Controls</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', margin: 0 }}>
                Click status badge to toggle Active vs Found. Use Edit to adjust rental pricing or terms.
              </p>
            </div>
            <span className="badge badge-verified">Direct Supabase Sync Active</span>
          </div>

          <div className="table-responsive">
            <table className="owner-table">
              <thead>
                <tr>
                  <th>Property / Unit</th>
                  <th>Locality</th>
                  <th>Tenant</th>
                  <th>Rent / Mo</th>
                  <th>Listing Status</th>
                  <th>Rent Collection</th>
                  <th>Verification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.title}</strong>
                    </td>
                    <td>{p.locality}</td>
                    <td>{p.tenant || 'Unoccupied'}</td>
                    <td>
                      <strong>₹{p.rent?.toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <button
                        onClick={() => openConfirmStatus(p)}
                        className={`badge ${p.status === 'Occupied' || p.status === 'Found' ? 'badge-amber' : 'badge-emerald'}`}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to change availability status (requires confirmation)"
                      >
                        {p.status === 'Occupied' || p.status === 'Found' ? '🔒 Found (Reserved)' : '🟢 Active (Open)'}
                      </button>
                    </td>
                    <td>
                      <span className={`badge ${p.paymentStatus?.includes('Paid') ? 'badge-verified' : 'badge-rose'}`}>
                        {p.paymentStatus || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <span
                        onClick={() => setIsUtilityVerificationModalOpen(true)}
                        style={{ cursor: 'pointer', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.8rem' }}
                      >
                        ✓ OCR Verified
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setIsProofVaultModalOpen(true)}
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Proof
                        </button>
                        <button
                          onClick={() => setIsStripePaymentModalOpen(true)}
                          className="btn btn-sm btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: INTERACTIVE APPLICANT MANAGEMENT */}
        <div className="owner-table-card" style={{ marginTop: '36px' }}>
          <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Incoming Rental Applications ({applications.length})</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', margin: 0 }}>
                Review prospective tenants, verified KYC IDs, requested duration, and accept or reject with immediate sync.
              </p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={loadApplications}>
              🔄 Refresh Applications
            </button>
          </div>

          <div style={{ padding: '16px' }}>
            {loadingApps ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--slate-500)' }}>
                Loading rental applications...
              </div>
            ) : applications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div>
                <strong>No pending applications right now.</strong>
                <p style={{ fontSize: '0.85rem', margin: '4px 0 0' }}>
                  New tenant applications submitted via the checkout flow will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {applications.map(app => (
                  <div
                    key={app.id}
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid var(--slate-200)',
                      borderRadius: '12px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--slate-900)' }}>{app.applicant_name}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>{app.applicant_email}</div>
                        </div>
                        <span className={`badge ${app.status === 'accepted' ? 'badge-emerald' : app.status === 'rejected' ? 'badge-rose' : 'badge-amber'}`}>
                          {app.status?.toUpperCase()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: '6px' }}>
                        📅 <strong>Move-in:</strong> {app.move_in_date || 'Immediate'} • <strong>Duration:</strong> {app.duration || '3 Months'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: '12px' }}>
                        💰 <strong>Rent:</strong> ₹{Number(app.monthly_rent || 18000).toLocaleString('en-IN')}/mo • <strong>Deposit:</strong> ₹{Number(app.deposit || 36000).toLocaleString('en-IN')}
                      </div>
                    </div>

                    {app.status === 'pending' || !app.status ? (
                      <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--slate-200)', paddingTop: '12px' }}>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'accept')}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, padding: '6px' }}
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'reject')}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '6px', color: 'var(--rose-600)' }}
                        >
                          ✕ Reject
                        </button>
                        <button
                          onClick={() => handleApplicationAction(app.id, 'info')}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, padding: '6px' }}
                          title="Ask for university ID or guarantor details"
                        >
                          💬 More Info
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', borderTop: '1px solid var(--slate-200)', paddingTop: '8px' }}>
                        Status recorded in Supabase on {new Date(app.created_at || Date.now()).toLocaleDateString('en-IN')}.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: MAINTENANCE RELAY BOT TICKETS */}
        <div className="owner-table-card" style={{ marginTop: '36px' }}>
          <div className="owner-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Maintenance Relay Tickets</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', margin: 0 }}>
                Live repair issues logged by tenants through the AI bot with 48-hour resolution SLA.
              </p>
            </div>
            <span className="badge badge-emerald">WhatsApp &amp; Twilio Webhook Live</span>
          </div>

          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {maintenanceTickets.map(ticket => (
                <div
                  key={ticket.id}
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid var(--slate-200)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>{ticket.issue}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{ticket.property}</div>
                    </div>
                    <span className={`badge ${ticket.status === 'Resolved' ? 'badge-emerald' : ticket.status === 'In Progress' ? 'badge-amber' : 'badge-rose'}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '8px 0', lineHeight: 1.4 }}>
                    {ticket.description}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '12px' }}>
                    Tenant: <strong>{ticket.tenant}</strong> • Priority: <strong>{ticket.priority}</strong> • Logged: {ticket.createdAt}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--slate-200)', paddingTop: '10px' }}>
                    <button
                      onClick={() => handleMaintenanceStatusUpdate(ticket.id, 'In Progress')}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, padding: '5px' }}
                      disabled={ticket.status === 'In Progress'}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleMaintenanceStatusUpdate(ticket.id, 'Resolved')}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, padding: '5px' }}
                      disabled={ticket.status === 'Resolved'}
                    >
                      ✓ Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CONFIRM STATUS TOGGLE DIALOG */}
        {confirmStatusModal && (
          <div className="modal-overlay" style={{ display: 'flex', zIndex: 1250 }}>
            <div className="modal-container" style={{ maxWidth: '440px', padding: '24px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '10px' }}>
                Confirm Availability Change
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '20px' }}>
                Are you sure you want to mark <strong>&quot;{confirmStatusModal.title}&quot;</strong> as{' '}
                <strong style={{ color: confirmStatusModal.nextStatus === 'Found' ? 'var(--amber-600)' : 'var(--emerald-600)' }}>
                  {confirmStatusModal.nextStatus === 'Found' ? 'Found / Occupied' : 'Active (Open)'}
                </strong>?
                {confirmStatusModal.nextStatus === 'Found' && (
                  <span style={{ display: 'block', marginTop: '6px', fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                    This will immediately remove the property from public tenant search results.
                  </span>
                )}
              </p>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setConfirmStatusModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={executeStatusChange}
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROPERTY MODAL */}
        {editingProperty && (
          <div className="modal-overlay" style={{ display: 'flex', zIndex: 1250 }}>
            <div className="modal-container" style={{ maxWidth: '500px', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)', margin: 0 }}>
                  Edit Property Details
                </h3>
                <button
                  onClick={() => setEditingProperty(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--slate-400)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSavePropertyEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Listing Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                      Monthly Rent (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.rent}
                      onChange={e => setEditForm({ ...editForm, rent: Number(e.target.value) })}
                      className="search-input"
                      style={{ width: '100%', padding: '9px 12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                      Security Deposit (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={editForm.deposit}
                      onChange={e => setEditForm({ ...editForm, deposit: Number(e.target.value) })}
                      className="search-input"
                      style={{ width: '100%', padding: '9px 12px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Locality &amp; Address
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.locality}
                    onChange={e => setEditForm({ ...editForm, locality: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-700)', display: 'block', marginBottom: '4px' }}>
                    Listing Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="search-input"
                    style={{ width: '100%', padding: '9px 12px' }}
                  >
                    <option value="Active">🟢 Active (Open to Applications)</option>
                    <option value="Found">🔒 Found (Reserved/Hidden)</option>
                    <option value="Occupied">🏢 Occupied</option>
                    <option value="Inactive">⏸️ Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => setEditingProperty(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Save to Supabase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
