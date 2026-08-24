import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Layers,
  Search,
  LogOut,
  ShieldAlert,
  AlertCircle,
  FileText,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import './index.css';

// Types corresponding to models.ts & DB schema
interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority: string;
  status: string;
  imageUrl?: string | null;
  latitude: number;
  longitude: number;
  reportCount: number;
  department?: string | null;
  assignedOfficer?: string | null;
  aiConfidence?: number | null;
  slaDeadline?: string | null;
  createdAt: string;
  updatedAt: string;
  nagarsevakName?: string | null;
  wardNumber?: string | null;
  aiReasons?: string[];
}

interface Stats {
  total: number;
  unresolved: number;
  inProgress: number;
  resolved: number;
  highPriority: number;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  severityBreakdown: Record<string, number>;
  trends: Array<{ date: string; count: number }>;
  wardBreakdown: Record<string, number>;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  'REPORTED': ['ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED'],
  'ACKNOWLEDGED': ['IN_PROGRESS', 'RESOLVED'],
  'IN_PROGRESS': ['RESOLVED'],
  'RESOLVED': ['VERIFIED', 'REOPENED'],
  'VERIFIED': ['REOPENED'],
  'REOPENED': ['IN_PROGRESS', 'RESOLVED']
};

export default function App() {
  const [token, setToken] = useState<string | null>(sessionStorage.getItem('nagarx_token'));
  const [user, setUser] = useState<any>(JSON.parse(sessionStorage.getItem('nagarx_user') || 'null'));

  // Nav State
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'map'>('overview');

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Issues Data
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Municipal Action Form
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [assignOfficerId, setAssignOfficerId] = useState<string>('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Leaflet Map Ref
  const mapRef = useRef<any>(null);

  // Load stats & issues
  const fetchData = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [issuesRes, statsRes] = await Promise.all([
        axios.get('/api/issues', { headers }),
        axios.get('/api/issues/stats', { headers })
      ]);
      if (issuesRes.data.success) setIssues(issuesRes.data.data);
      if (statsRes.data.success) setStats(statsRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  // Leaflet Map render
  useEffect(() => {
    if (activeTab === 'map') {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const L = (window as any).L;
      if (!L) return;

      // Center on Pune
      const map = L.map('leaflet-map').setView([18.5204, 73.8567], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      const markers: any[] = [];

      issues.forEach((issue) => {
        if (!issue.latitude || !issue.longitude) return;

        let markerColor = '#10B981'; // Green
        if (issue.priority === 'CRITICAL') markerColor = '#E11D48';
        else if (issue.priority === 'HIGH') markerColor = '#F97316';
        else if (issue.priority === 'MEDIUM') markerColor = '#F59E0B';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${markerColor}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.3)"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        const marker = L.marker([issue.latitude, issue.longitude], { icon: customIcon }).addTo(map);
        markers.push(marker);

        const popupContent = `
          <div style="font-family: 'Outfit', sans-serif; font-size: 13px; padding: 4px; max-width: 220px; color: #1E293B;">
            <h4 style="margin: 0 0 6px 0; color: #0D2240; font-weight: 800; font-size: 14px;">${issue.title}</h4>
            ${issue.imageUrl ? `<img src="${issue.imageUrl}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 6px; margin-bottom: 8px; border: 1px solid #E2E8F0;" />` : ''}
            <div style="margin-bottom: 4px;"><strong>Location:</strong> Lat: ${issue.latitude.toFixed(4)}, Long: ${issue.longitude.toFixed(4)}</div>
            <div style="margin-bottom: 4px;"><strong>Severity:</strong> <span style="color: ${issue.severity === 'CRITICAL' || issue.severity === 'HIGH' ? '#E11D48' : '#F59E0B'}; font-weight: 700;">${issue.severity}</span></div>
            <div style="margin-bottom: 6px;"><strong>Status:</strong> ${issue.status}</div>
            <button id="marker-btn-${issue.id}" style="background-color: #1F509E; color: white; border: none; padding: 6px; border-radius: 4px; width: 100%; font-weight: 700; cursor: pointer; transition: background-color 0.2s;">Inspect Case</button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`marker-btn-${issue.id}`);
          if (btn) {
            btn.onclick = () => {
              setSelectedIssue(issue);
            };
          }
        });
      });

      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15 });
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeTab, issues]);

  // Auth Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success && response.data.data) {
        const { token: userToken, user: userData } = response.data.data;
        if (userData.role === 'CITIZEN') {
          setLoginError('Access denied: Citizens do not have access to the Municipal Operations Dashboard.');
          return;
        }
        sessionStorage.setItem('nagarx_token', userToken);
        sessionStorage.setItem('nagarx_user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
      }
    } catch (err: any) {
      setLoginError(err.response?.data?.message || 'Login connection failed. Check credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('nagarx_token');
    sessionStorage.removeItem('nagarx_user');
    setToken(null);
    setUser(null);
  };

  const selectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
  };

  // Municipal Actions handlers
  const handleUpdateIssue = async () => {
    if (!selectedIssue || !token) return;
    setUpdateError(null);
    setUpdateLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      let updatedIssue = { ...selectedIssue };

      // Apply status change
      if (updateStatus && updateStatus !== selectedIssue.status) {
        const statusRes = await axios.patch(`/api/issues/${selectedIssue.id}/status`, { status: updateStatus }, { headers });
        if (statusRes.data.success) updatedIssue = statusRes.data.data;
      }

      // Apply officer assignment
      if (assignOfficerId && assignOfficerId !== selectedIssue.assignedOfficer) {
        const assignRes = await axios.patch(`/api/issues/${selectedIssue.id}/assign`, { assignedOfficer: assignOfficerId }, { headers });
        if (assignRes.data.success) updatedIssue = assignRes.data.data;
      }

      setSelectedIssue(updatedIssue);
      setUpdateStatus('');
      setAssignOfficerId('');
      fetchData(); // reload
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Failed to update issue properties.');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Filtering issues list
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.wardNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || issue.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || issue.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || issue.priority === filterPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const getSeverityColor = (severity: string) => {
    switch ((severity || '').toUpperCase()) {
      case 'CRITICAL': return 'var(--color-critical)';
      case 'HIGH': return 'var(--color-high)';
      case 'MEDIUM': return 'var(--color-medium)';
      default: return 'var(--color-low)';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch ((priority || '').toUpperCase()) {
      case 'CRITICAL': return 'badge-critical';
      case 'HIGH': return 'badge-high';
      case 'MEDIUM': return 'badge-medium';
      default: return 'badge-low';
    }
  };

  const getStatusClass = (status: string) => {
    return `status-pill status-${(status || 'reported').toLowerCase()}`;
  };

  const getAiRecommendation = (category: string, severity: string) => {
    const isHigh = severity === 'HIGH' || severity === 'CRITICAL';
    switch (category) {
      case 'POTHOLE':
        return isHigh ? 'Emergency road filling required. Deploy cold-mix asphalt patch team immediately.' : 'Schedule standard road repaving during the weekly ward maintenance cycle.';
      case 'GARBAGE':
      case 'ILLEGAL_DUMPING':
        return 'Dispatch sanitation dumper. Verify if waste contains toxic or commercial construction refuse.';
      case 'WATER_LEAKAGE':
        return isHigh ? 'Main pipeline pressure drop detected. Shut off localized supply valves and send hydraulic repair unit.' : 'Schedule plumbing valve inspections at off-peak hours.';
      case 'DRAINAGE':
      case 'SEWAGE':
        return 'Sewer backup hazard. Send high-pressure vacuum jetting truck to clear storm drain obstructions.';
      case 'STREETLIGHT':
        return 'Schedule bulb replacement and check wiring relays at electrical substation.';
      default:
        return 'Deploy ward officer to inspect reported civic issue and log status updates.';
    }
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <img src="/vjti_logo.png" alt="VJTI Logo" className="login-logo" />
          <h2 className="login-title">NAGAR-X Portal</h2>
          <p className="login-subtitle">Veermata Jijabai Technological Institute (VJTI)<br />Municipal Authority Operations Portal</p>
          
          {loginError && <div className="login-error">{loginError}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Government Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="officer@nagarx.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn" disabled={loginLoading}>
              {loginLoading ? 'Authenticating...' : 'Sign In to Operations Portal'}
            </button>
          </form>

          <div className="preset-container">
            <div className="preset-title">Select Preset Officer Account:</div>
            <div className="preset-row">
              <button className="preset-badge" onClick={() => selectPreset('officer@nagarx.gov')}>Officer</button>
              <button className="preset-badge" onClick={() => selectPreset('admin@nagarx.gov')}>Admin</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/vjti_logo.png" alt="VJTI Logo" className="sidebar-logo" />
          <div className="sidebar-brand-group">
            <h1 className="sidebar-brand">NAGAR-X</h1>
            <p className="sidebar-subbrand">VJTI MUNICIPAL</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} /> Overview Dashboard
          </button>
          <button
            className={`sidebar-link ${activeTab === 'issues' ? 'active' : ''}`}
            onClick={() => setActiveTab('issues')}
          >
            <FileText size={18} /> Issues & Grievances
          </button>
          <button
            className={`sidebar-link ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            <MapPin size={18} /> Geographic Map View
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {(user?.name || 'O')[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-content">
        <header className="top-header">
          <div className="header-title-section">
            <h2 className="header-main-title">Veermata Jijabai Technological Institute (VJTI) - Municipal Operations Dashboard</h2>
            <div className="header-gov-badge">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Flag_of_India.svg" alt="India flag" className="gov-flag" />
              <span className="gov-text">Gov of India</span>
            </div>
          </div>
          
          <button className="logout-btn" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} onClick={() => fetchData()}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </header>

        <main className="page-body">
          {activeTab === 'overview' && (
            <>
              {/* Summary Cards */}
              <section className="summary-grid">
                <div className="metric-card">
                  <div className="metric-accent-stripe" />
                  <div className="metric-info">
                    <span className="metric-label">Total Reported Cases</span>
                    <span className="metric-value">{stats?.total || 0}</span>
                  </div>
                  <div className="metric-icon-wrapper">
                    <Layers size={22} color="var(--primary)" />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-accent-stripe stripe-critical" />
                  <div className="metric-info">
                    <span className="metric-label">Critical & High Priority</span>
                    <span className="metric-value">{stats?.highPriority || 0}</span>
                  </div>
                  <div className="metric-icon-wrapper" style={{ backgroundColor: '#FFF1F2' }}>
                    <ShieldAlert size={22} color="var(--color-critical)" />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-accent-stripe stripe-pending" />
                  <div className="metric-info">
                    <span className="metric-label">Pending / Unresolved</span>
                    <span className="metric-value">{stats?.unresolved || 0}</span>
                  </div>
                  <div className="metric-icon-wrapper" style={{ backgroundColor: '#FFFBEB' }}>
                    <Clock size={22} color="var(--color-medium)" />
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-accent-stripe stripe-resolved" />
                  <div className="metric-info">
                    <span className="metric-label">Resolved / Closed</span>
                    <span className="metric-value">{stats?.resolved || 0}</span>
                  </div>
                  <div className="metric-icon-wrapper" style={{ backgroundColor: '#ECFDF5' }}>
                    <CheckCircle size={22} color="var(--color-resolved)" />
                  </div>
                </div>
              </section>

              {/* Alert Notification for critical issues */}
              {issues.some(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'VERIFIED') && (
                <div className="detail-section-card" style={{ padding: '16px 20px', borderLeft: '5px solid var(--color-critical)', backgroundColor: '#FFF1F2', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <AlertCircle color="var(--color-critical)" size={24} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontWeight: '800', color: '#991B1B', fontSize: '14px' }}>CRITICAL SEVERITY INCIDENT ALERT DETECTED</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#B91C1C' }}>
                        AI has flagged a severe public-safety risk in Ward 12 requiring immediate ward engineer intervention.
                      </p>
                    </div>
                    <button className="action-btn-primary" style={{ flex: 'none', padding: '6px 12px', backgroundColor: 'var(--color-critical)' }} onClick={() => {
                      const criticalIssue = issues.find(i => i.priority === 'CRITICAL' && i.status !== 'RESOLVED');
                      if (criticalIssue) setSelectedIssue(criticalIssue);
                    }}>
                      Inspect Now
                    </button>
                  </div>
                </div>
              )}

              <div className="dashboard-layout">
                {/* 1. Categorized Distribution */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title"><BarChart3 size={18} /> Grievances Breakdown by Category</h3>
                  </div>
                  <div className="trend-bars">
                    {stats?.categoryBreakdown && Object.entries(stats.categoryBreakdown).map(([category, count]) => {
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div className="bar-row" key={category}>
                          <div className="bar-label-row">
                            <span>{category.replace('_', ' ')}</span>
                            <span>{count} ({percentage.toFixed(0)}%)</span>
                          </div>
                          <div className="bar-bg">
                            <div className="bar-fill" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Ward breakdown & Severity */}
                <div className="dashboard-card">
                  <div className="card-header">
                    <h3 className="card-title"><Layers size={18} /> Priority & Severity Split</h3>
                  </div>
                  <div className="trend-bars">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {stats?.severityBreakdown && Object.entries(stats.severityBreakdown).map(([sev, count]) => {
                        const color = getSeverityColor(sev);
                        return (
                          <div key={sev} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px' }}>{sev} SEVERITY</span>
                            <span style={{ fontWeight: '800', color }}>{count} cases</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'issues' && (
            <>
              {/* Filter bar */}
              <section className="filter-bar">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by ID, category, ward, description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="ALL">All Categories</option>
                  <option value="POTHOLE">Potholes</option>
                  <option value="GARBAGE">Garbage & Waste</option>
                  <option value="WATER_LEAKAGE">Water Leakage</option>
                  <option value="DRAINAGE">Drainage</option>
                  <option value="SEWAGE">Sewage Overflow</option>
                  <option value="STREETLIGHT">Streetlight</option>
                  <option value="ILLEGAL_DUMPING">Illegal Dumping</option>
                  <option value="OTHER">Other</option>
                </select>

                <select
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="REPORTED">Reported</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REOPENED">Reopened</option>
                </select>

                <select
                  className="filter-select"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </section>

              {/* Table Card */}
              <div className="table-card">
                <div className="table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Photo</th>
                        <th>Issue Reference</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>AI Confidence</th>
                        <th>Status</th>
                        <th>Ward</th>
                        <th>Date Reported</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.map((issue) => (
                        <tr key={issue.id} onClick={() => setSelectedIssue(issue)}>
                          <td>
                            {issue.imageUrl ? (
                              <img src={issue.imageUrl} className="table-thumbnail" alt="thumbnail" />
                            ) : (
                              <div className="table-placeholder-thumb">
                                <Layers size={16} />
                              </div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: '700', color: 'var(--sidebar-bg)' }}>{issue.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ID: #{issue.id.slice(0, 8)}...</div>
                          </td>
                          <td>
                            <span style={{ fontWeight: '600' }}>{issue.category.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <span className={`badge ${getPriorityBadgeClass(issue.priority)}`}>
                              <span className="badge-dot" /> {issue.priority}
                            </span>
                          </td>
                          <td>
                            {issue.aiConfidence !== null && issue.aiConfidence !== undefined ? (
                              <span className="ai-confidence-pill">
                                {Math.round(issue.aiConfidence * 100)}%
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                            )}
                          </td>
                          <td>
                            <span className={getStatusClass(issue.status)}>
                              {issue.status}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: '700' }}>Ward {issue.wardNumber || '12'}</span>
                          </td>
                          <td>
                            {new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                        </tr>
                      ))}
                      {filteredIssues.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                            No citizen-reported grievances matching filter options.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'map' && (
            <div className="map-view-card">
              <div className="card-header">
                <h3 className="card-title"><MapPin size={18} /> Geographic plotting of reported issues</h3>
              </div>
              <div id="leaflet-map" className="map-container" />
            </div>
          )}
        </main>
      </div>

      {/* Issues Detail Modal View */}
      {selectedIssue && (
        <div className="modal-overlay">
          <div className="modal-card">
            <header className="modal-header">
              <div className="modal-title-group">
                <h3 className="modal-title">{selectedIssue.title}</h3>
                <p className="modal-subtitle">Grievance Ref ID: #{selectedIssue.id}</p>
              </div>
              <button className="close-btn" onClick={() => setSelectedIssue(null)}>
                <ArrowLeft size={20} />
              </button>
            </header>

            <div className="modal-body">
              {updateError && <div className="login-error">{updateError}</div>}
              
              <div className="modal-grid-layout">
                {/* Left panel: Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="detail-section-card">
                    <h4 className="section-card-title">Citizen Submission</h4>
                    
                    {selectedIssue.imageUrl ? (
                      <img src={selectedIssue.imageUrl} className="detail-image" alt="Evidence" />
                    ) : (
                      <div className="detail-image" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-primary)' }}>
                        <AlertTriangle size={32} color="var(--text-secondary)" />
                      </div>
                    )}

                    <div className="detail-row">
                      <span className="detail-label">Report Description</span>
                      <span className="detail-value">{selectedIssue.description}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Report Location (Coordinates)</span>
                      <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="var(--primary)" /> Lat: {selectedIssue.latitude.toFixed(6)}, Long: {selectedIssue.longitude.toFixed(6)}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Submission Date</span>
                      <span className="detail-value">{new Date(selectedIssue.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Right panel: AI & Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="detail-section-card" style={{ border: '1.5px solid #BFDBFE', backgroundColor: '#F8FAFC' }}>
                    <h4 className="section-card-title" style={{ borderBottomColor: '#BFDBFE', color: 'var(--primary)' }}>AI Analysis Results</h4>

                    <div className="detail-row">
                      <span className="detail-label">Detected Category</span>
                      <span className="detail-value" style={{ fontWeight: '800' }}>{selectedIssue.category.replace('_', ' ')}</span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">AI Model Confidence</span>
                      <span className="detail-value">
                        {selectedIssue.aiConfidence !== null && selectedIssue.aiConfidence !== undefined
                          ? `${Math.round(selectedIssue.aiConfidence * 100)}%`
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="detail-row">
                      <span className="detail-label">Risk Severity</span>
                      <span className="detail-value" style={{ color: getSeverityColor(selectedIssue.severity), fontWeight: '800' }}>
                        {selectedIssue.severity}
                      </span>
                    </div>

                    {selectedIssue.aiReasons && selectedIssue.aiReasons.length > 0 && (
                      <div className="detail-row">
                        <span className="detail-label">AI Reasoning Justification</span>
                        <span className="detail-value" style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {selectedIssue.aiReasons[0]}
                        </span>
                      </div>
                    )}

                    <div className="ai-recommendation-box">
                      <div style={{ flex: 1 }}>
                        <h5 className="ai-recommendation-title">Recommended Action</h5>
                        <p className="ai-recommendation-text">
                          {getAiRecommendation(selectedIssue.category, selectedIssue.severity)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section-card">
                    <h4 className="section-card-title">Municipal Authority Actions</h4>

                    <div className="detail-row">
                      <span className="detail-label">Current Status</span>
                      <span className="detail-value">
                        <span className={getStatusClass(selectedIssue.status)}>
                          {selectedIssue.status}
                        </span>
                      </span>
                    </div>

                    <div className="form-group" style={{ marginTop: '14px' }}>
                      <label className="form-label">Update Status</label>
                      <select
                        className="filter-select"
                        style={{ width: '100%' }}
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                      >
                        <option value="">-- No Change --</option>
                        {ALLOWED_TRANSITIONS[selectedIssue.status]?.map((target) => (
                          <option key={target} value={target}>
                            {target === 'ACKNOWLEDGED' && 'Acknowledge'}
                            {target === 'IN_PROGRESS' && 'Set In Progress'}
                            {target === 'RESOLVED' && 'Resolve'}
                            {target === 'VERIFIED' && 'Verify'}
                            {target === 'REOPENED' && 'Reopen'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Assign Department Engineer</label>
                      <select
                        className="filter-select"
                        style={{ width: '100%' }}
                        value={assignOfficerId}
                        onChange={(e) => setAssignOfficerId(e.target.value)}
                      >
                        <option value="">-- No Change --</option>
                        {/* We use a preset user ID matching seed officer for prototype demonstration */}
                        <option value="seed-officer-uuid-placeholder-1">Ward 12 Engineer (Sub-Station 1)</option>
                        <option value="seed-officer-uuid-placeholder-2">Ward 12 Engineer (Sub-Station 2)</option>
                      </select>
                    </div>

                    <div className="action-row">
                      <button className="action-btn-primary" onClick={handleUpdateIssue} disabled={updateLoading}>
                        {updateLoading ? 'Saving...' : 'Apply Modifications'}
                      </button>
                      <button className="action-btn-secondary" onClick={() => setSelectedIssue(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
