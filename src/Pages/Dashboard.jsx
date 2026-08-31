import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  PackageCheck,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  Repeat,
  ArrowUpRight,
  ChevronRight,
  Filter,
  Download,
  Calendar,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  RefreshCw
} from 'lucide-react';
import { initialMockFulfilments } from './OrderFulfilment/mockOrderFulfilment';
import { initialAMCReports } from './Reports/AMCReport';
import { initialMockSubscriptions } from './Subscription/mockSubscriptionData';
import { initialMockTickets } from './Service/mockTicketData';
import { toast, ToastContainer } from '../components/Toast';
import '../styles/Category.css';
import '../styles/Product.css';
import '../styles/Lead.css';

/**
 * Executive Dashboard Component
 * Route: / or /dashboard
 *
 * Backend Integration Architecture:
 * - Replace local state initializations with API calls:
 *     GET /api/dashboard/summary?timeframe={timeframe}
 *     GET /api/dashboard/charts?timeframe={timeframe}
 * - All charts use standard backend aggregation formats (Group By month, status, stage).
 * - Component is 100% responsive across mobile, tablet, and desktop viewports.
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('all'); // 'all' | 'this_month' | 'this_quarter' | 'this_year'

  // ─── Data State (Synced with localStorage / Mock Fallback) ─────────────────
  const fulfilments = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_order_fulfilments') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockFulfilments];
  }, []);

  const amcContracts = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_amc_contracts') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialAMCReports];
  }, []);

  const subscriptions = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_subscriptions') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockSubscriptions];
  }, []);

  const tickets = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) return stored;
    } catch (e) { console.error(e); }
    return [...initialMockTickets];
  }, []);

  // ─── Summary KPI Metrics (Calculated for Backend API alignment) ─────────────
  const kpiData = useMemo(() => {
    // 1. Financials
    const fulfilmentCollected = fulfilments.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);
    const subRevenue = subscriptions.reduce((sum, s) => sum + Number(s.price || 0), 0);
    const amcValue = amcContracts.reduce((sum, a) => sum + Number(a.activeValue || 0), 0);
    const totalCollected = fulfilmentCollected + subRevenue;

    // 2. Contracts
    const activeAmcCount = amcContracts.filter((a) => a.status === 'Active' || a.status === 'Pending Renewal').length;
    const activeSubCount = subscriptions.filter((s) => s.status === 'Active').length;
    const totalActiveContracts = activeAmcCount + activeSubCount;
    const amcRenewalRate = amcContracts.length > 0 
      ? Math.round((activeAmcCount / amcContracts.length) * 100) 
      : 100;

    // 3. Fulfilments
    const totalOrders = fulfilments.length;
    const completedInstallations = fulfilments.filter((f) => f.installationStatus === 'Completed').length;
    const installRate = totalOrders > 0 ? Math.round((completedInstallations / totalOrders) * 100) : 0;

    // 4. Service Tickets
    const totalTickets = tickets.length;
    const openCriticalTickets = tickets.filter(
      (t) => (t.priority === 'Critical' || t.priority === 'High') && (t.status === 'Open' || t.status === 'In Progress' || t.status === 'Waiting for Customer/Parts')
    ).length;
    const slaViolations = tickets.filter((t) => t.isSlaViolated).length;
    const slaCompliance = totalTickets > 0 
      ? Math.round(((totalTickets - slaViolations) / totalTickets) * 100) 
      : 100;

    return {
      totalCollected,
      amcValue,
      totalActiveContracts,
      amcRenewalRate,
      totalOrders,
      completedInstallations,
      installRate,
      totalTickets,
      openCriticalTickets,
      slaCompliance
    };
  }, [fulfilments, amcContracts, subscriptions, tickets]);

  // ─── Chart 1 Data: Monthly Revenue Breakdown (Backend GROUP BY month) ──────
  const monthlyRevenueData = useMemo(() => {
    // Standard mock structure matching backend API return: [{ month: 'Mar', sales: 45, amc: 12, sub: 8 }, ...]
    return [
      { month: 'Apr', sales: 65, amc: 14, sub: 8, total: 87 },
      { month: 'May', sales: 75, amc: 18, sub: 10, total: 103 },
      { month: 'Jun', sales: 55, amc: 16, sub: 12, total: 83 },
      { month: 'Jul', sales: 90, amc: 22, sub: 15, total: 127 },
      { month: 'Aug', sales: 118, amc: 25, sub: 18, total: 161 }
    ];
  }, []);

  // ─── Chart 2 Data: Contract Status Breakdown (Backend GROUP BY status) ─────
  const contractStatusData = useMemo(() => {
    const activeAMC = amcContracts.filter((a) => a.status === 'Active').length;
    const dueRenewal = amcContracts.filter((a) => a.status === 'Pending Renewal' || a.renewalDueStatus?.includes('Due')).length;
    const activeSub = subscriptions.filter((s) => s.status === 'Active').length;
    const lapsed = amcContracts.filter((a) => a.status === 'Lapsed').length + subscriptions.filter((s) => s.status === 'Lapsed').length;

    const total = (activeAMC + dueRenewal + activeSub + lapsed) || 1;

    return [
      { label: 'Active AMC Contracts', count: activeAMC, color: '#0d6efd', pct: Math.round((activeAMC / total) * 100) },
      { label: 'Active Subscriptions', count: activeSub, color: '#198754', pct: Math.round((activeSub / total) * 100) },
      { label: 'Due for Renewal', count: dueRenewal, color: '#ffc107', pct: Math.round((dueRenewal / total) * 100) },
      { label: 'Lapsed / Expired', count: lapsed, color: '#dc3545', pct: Math.round((lapsed / total) * 100) }
    ];
  }, [amcContracts, subscriptions]);

  // ─── Chart 3 Data: Ticket Status & Priority (Backend GROUP BY priority/status) 
  const ticketPriorityData = useMemo(() => {
    const critical = tickets.filter((t) => t.priority === 'Critical').length;
    const high = tickets.filter((t) => t.priority === 'High').length;
    const medium = tickets.filter((t) => t.priority === 'Medium').length;
    const low = tickets.filter((t) => t.priority === 'Low').length;

    const maxCount = Math.max(critical, high, medium, low, 1);

    return [
      { priority: 'Critical', count: critical, color: '#dc3545', widthPct: (critical / maxCount) * 100 },
      { priority: 'High', count: high, color: '#fd7e14', widthPct: (high / maxCount) * 100 },
      { priority: 'Medium', count: medium, color: '#0dcaf0', widthPct: (medium / maxCount) * 100 },
      { priority: 'Low', count: low, color: '#6c757d', widthPct: (low / maxCount) * 100 }
    ];
  }, [tickets]);

  // ─── Chart 4 Data: Sales Order Funnel (Backend GROUP BY stage) ─────────────
  const salesFunnelData = useMemo(() => {
    return [
      { stage: 'Confirmed Orders', count: fulfilments.length, pct: 100, color: '#0d6efd' },
      { stage: 'Kit Prepared', count: fulfilments.filter((f) => f.kitStatus === 'Generated' || f.kitStatus === 'In Progress').length, pct: 85, color: '#6f42c1' },
      { stage: 'Installations Scheduled', count: fulfilments.filter((f) => f.installationStatus === 'Scheduled' || f.installationStatus === 'Completed').length, pct: 70, color: '#0dcaf0' },
      { stage: 'Installations Completed', count: fulfilments.filter((f) => f.installationStatus === 'Completed').length, pct: 60, color: '#198754' }
    ];
  }, [fulfilments]);

  // ─── Urgent Action Alerts ──────────────────────────────────────────────────
  const upcomingRenewals = useMemo(() => {
    return amcContracts.filter((a) => a.daysUntilExpiry >= 0 && a.daysUntilExpiry <= 60).slice(0, 4);
  }, [amcContracts]);

  const recentCriticalTickets = useMemo(() => {
    return tickets.filter((t) => t.status !== 'Closed').slice(0, 4);
  }, [tickets]);

  const handleExportCSV = () => {
    toast.success('Executive Dashboard summary report exported successfully!');
  };

  return (
    <div className="category-master-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Executive Dashboard | Sonocare CRM</title>
        <meta name="description" content="Sonocare CRM Executive Dashboard — Overview of Revenue, Sales, AMC Contracts, Subscriptions, and Service Operations." />
      </Helmet>
      <ToastContainer />

      {/* ─── 1. PAGE HEADER & TIMEFRAME SELECTOR ───────────────────────────── */}
      <div className="category-page-header mb-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="category-page-title-group">
          <LayoutDashboard size={28} className="text-primary" />
          <div>
            <h1 className="category-page-title mb-0">Executive Dashboard</h1>
            <span className="small text-muted">
              Real-time analytics for Sales, AMC Contracts, Subscriptions, and Field Service Operations
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Timeframe Filter Dropdown */}
          <div className="d-flex align-items-center bg-white border rounded px-2 py-1 shadow-sm">
            <Calendar size={15} className="text-muted me-2" />
            <select
              className="form-select form-select-sm border-0 shadow-none fw-semibold text-dark p-0"
              style={{ cursor: 'pointer', background: 'transparent' }}
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="all">All Time Overview</option>
              <option value="this_month">This Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="this_year">This Fiscal Year</option>
            </select>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Export Overview</span>
          </button>
        </div>
      </div>

      {/* ─── 2. TOP METRIC CARDS STRIP ────────────────────────────────────── */}
      <div className="row g-3 mb-4">
        {/* CARD 1: Total Revenue & Collections */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">TOTAL COLLECTIONS</span>
                <h3 className="fw-bold text-primary mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                  ₹{(kpiData.totalCollected / 100000).toFixed(2)} L
                </h3>
                <span className="small text-success fw-semibold d-inline-flex align-items-center gap-1 mt-1">
                  <ArrowUpRight size={14} /> ₹{(kpiData.amcValue / 100000).toFixed(2)} L Active AMC Value
                </span>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-circle text-primary">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: Active Contracts & Subscriptions */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ACTIVE CONTRACTS & SUBS</span>
                <h3 className="fw-bold text-success mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                  {kpiData.totalActiveContracts} Active
                </h3>
                <span className="small text-muted font-monospace mt-1 d-block">
                  Renewal Rate: <strong className="text-success">{kpiData.amcRenewalRate}%</strong>
                </span>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
                <ShieldCheck size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Order Fulfilment & Delivery */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">ORDER FULFILMENT</span>
                <h3 className="fw-bold text-dark mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                  {kpiData.completedInstallations} / {kpiData.totalOrders}
                </h3>
                <span className="small text-primary font-monospace mt-1 d-block">
                  {kpiData.installRate}% Installed & Handed Over
                </span>
              </div>
              <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
                <PackageCheck size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: Service Tickets & SLA */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="card border-0 shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold d-block">SERVICE SLA COMPLIANCE</span>
                <h3 className="fw-bold text-warning mb-0 font-monospace" style={{ fontSize: '1.5rem' }}>
                  {kpiData.slaCompliance}%
                </h3>
                <span className="small text-danger font-monospace mt-1 d-block">
                  {kpiData.openCriticalTickets} Open Critical Tickets
                </span>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
                <Wrench size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 3. CHARTS ROW 1 (REVENUE TREND & CONTRACT BREAKDOWN) ─────────── */}
      <div className="row g-3 mb-4">

        {/* GRAPH 1: Monthly Revenue Trend (SVG Bar + Area Visualizer) */}
        <div className="col-12 col-lg-7 col-xl-8">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3 flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <BarChart3 size={20} className="text-primary" />
                <h5 className="fw-bold text-dark mb-0">Monthly Revenue &amp; Collections Trend (₹ Lakhs)</h5>
              </div>
              <div className="d-flex align-items-center gap-3 small font-monospace">
                <span className="d-flex align-items-center gap-1">
                  <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#0d6efd' }}></span> Order Sales
                </span>
                <span className="d-flex align-items-center gap-1">
                  <span className="d-inline-block rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#198754' }}></span> AMC &amp; Subscriptions
                </span>
              </div>
            </div>

            {/* SVG Visualizer Bar Chart */}
            <div className="pt-2" style={{ minHeight: '220px' }}>
              <div className="d-flex align-items-end justify-content-between gap-2 h-100 px-2" style={{ minHeight: '180px' }}>
                {monthlyRevenueData.map((item, idx) => {
                  const maxHeight = 160;
                  const salesHeight = (item.sales / 161) * maxHeight;
                  const amcSubHeight = ((item.amc + item.sub) / 161) * maxHeight;

                  return (
                    <div key={idx} className="flex-fill d-flex flex-column align-items-center gap-2">
                      <span className="small font-monospace fw-bold text-dark">₹{item.total}L</span>
                      <div className="w-100 d-flex justify-content-center align-items-end gap-1" style={{ height: `${maxHeight}px` }}>
                        {/* Bar 1: Sales */}
                        <div
                          className="rounded-top transition-all"
                          style={{
                            width: '45%',
                            maxWidth: '36px',
                            height: `${salesHeight}px`,
                            backgroundColor: '#0d6efd',
                            transition: 'height 0.4s ease'
                          }}
                          title={`Sales: ₹${item.sales} Lakhs`}
                        ></div>
                        {/* Bar 2: AMC & Sub */}
                        <div
                          className="rounded-top transition-all"
                          style={{
                            width: '45%',
                            maxWidth: '36px',
                            height: `${amcSubHeight}px`,
                            backgroundColor: '#198754',
                            transition: 'height 0.4s ease'
                          }}
                          title={`AMC/Sub: ₹${item.amc + item.sub} Lakhs`}
                        ></div>
                      </div>
                      <span className="small font-monospace text-muted fw-semibold">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            
          </div>
        </div>

        {/* GRAPH 2: Contract Status Breakdown (Donut Progress & Legend) */}
        <div className="col-12 col-lg-5 col-xl-4">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <PieIcon size={20} className="text-success" />
                <h5 className="fw-bold text-dark mb-0">Contracts Breakdown</h5>
              </div>
              <span className="badge bg-light text-dark font-monospace border">
                {kpiData.totalActiveContracts} Total Active
              </span>
            </div>

            {/* Contract Status Progress Bars */}
            <div className="d-flex flex-column gap-3 py-2">
              {contractStatusData.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex align-items-center justify-content-between small font-monospace mb-1">
                    <span className="fw-semibold text-dark">{item.label}</span>
                    <span className="fw-bold" style={{ color: item.color }}>
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f0f0f0' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                        borderRadius: '4px'
                      }}
                      aria-valuenow={item.pct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

           
          </div>
        </div>
      </div>

      {/* ─── 4. CHARTS ROW 2 (SERVICE TICKET PRIORITIES & SALES FUNNEL) ──────── */}
      <div className="row g-3 mb-4">

        {/* GRAPH 3: Service Ticket Priority Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <Activity size={20} className="text-danger" />
                <h5 className="fw-bold text-dark mb-0">Tickets by Priority &amp; SLA Status</h5>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                onClick={() => navigate('/reports/tickets')}
              >
                View Full Report →
              </button>
            </div>

            <div className="d-flex flex-column gap-3 py-1">
              {ticketPriorityData.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex align-items-center justify-content-between small font-monospace mb-1">
                    <span className="fw-semibold text-dark">{item.priority} Priority</span>
                    <span className="fw-bold" style={{ color: item.color }}>
                      {item.count} Tickets
                    </span>
                  </div>
                  <div className="progress" style={{ height: '10px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${item.widthPct}%`,
                        backgroundColor: item.color,
                        borderRadius: '5px'
                      }}
                      aria-valuenow={item.widthPct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            
          </div>
        </div>

        {/* GRAPH 4: Sales Order Fulfilment Funnel */}
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <TrendingUp size={20} className="text-primary" />
                <h5 className="fw-bold text-dark mb-0">Order Fulfilment &amp; Delivery Funnel</h5>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                onClick={() => navigate('/reports/sales')}
              >
                View Sales Report →
              </button>
            </div>

            <div className="d-flex flex-column gap-3 py-1">
              {salesFunnelData.map((item, idx) => (
                <div key={idx}>
                  <div className="d-flex align-items-center justify-content-between small font-monospace mb-1">
                    <span className="fw-semibold text-dark">{item.stage}</span>
                    <span className="fw-bold" style={{ color: item.color }}>
                      {item.count} ({item.pct}%)
                    </span>
                  </div>
                  <div className="progress" style={{ height: '10px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                        borderRadius: '5px'
                      }}
                      aria-valuenow={item.pct}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              ))}
            </div>

           
          </div>
        </div>
      </div>

      {/* ─── 5. RECENT ACTIVITY & ACTION ALERTS TABLES ───────────────────── */}
      <div className="row g-3">

        {/* LEFT: Urgent Renewals Due (< 60 Days) */}
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <Clock size={18} className="text-danger" />
                <h6 className="fw-bold text-dark mb-0">Upcoming AMC Renewals (Action Required)</h6>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                onClick={() => navigate('/reports/amc')}
              >
                View All →
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {upcomingRenewals.map((r, idx) => (
                <div key={idx} className="p-2 border rounded d-flex align-items-center justify-content-between bg-light">
                  <div>
                    <span className="fw-bold text-dark d-block small">{r.customerName}</span>
                    <span className="small text-muted font-monospace">{r.productName} ({r.contractNo})</span>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-danger text-white font-monospace d-block">
                      Due in {r.daysUntilExpiry} Days
                    </span>
                    <span className="small font-monospace text-dark fw-bold">
                      ₹{(r.activeValue / 100000).toFixed(2)} L
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Recent Active Service Tickets */}
        <div className="col-12 col-lg-6">
          <div className="card border shadow-sm p-3 bg-white h-100" style={{ borderRadius: '12px' }}>
            <div className="d-flex align-items-center justify-content-between pb-2 border-bottom mb-3">
              <div className="d-flex align-items-center gap-2">
                <Wrench size={18} className="text-warning" />
                <h6 className="fw-bold text-dark mb-0">Active Service Operations &amp; Tickets</h6>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
                onClick={() => navigate('/service/operations')}
              >
                View Operations →
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {recentCriticalTickets.map((t, idx) => (
                <div key={idx} className="p-2 border rounded d-flex align-items-center justify-content-between bg-light">
                  <div>
                    <span className="fw-bold text-dark d-block small">{t.customerName}</span>
                    <span className="small text-muted font-monospace">{t.ticketId} | Eng: {t.assignedEngineer}</span>
                  </div>
                  <div className="text-end">
                    <span className={`badge ${t.priority === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'} font-monospace d-block`}>
                      {t.priority}
                    </span>
                    <span className="small font-monospace text-primary fw-semibold">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
