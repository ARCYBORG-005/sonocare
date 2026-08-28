import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { Helmet } from 'react-helmet-async';
import { toast, ToastContainer } from '../../components/Toast';
import { Users, Plus, Eye, Pencil, Trash2, Search, Filter } from 'lucide-react';
import { mockTerritoryMasterData } from './mockCustomers';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Customer.css';

const CustomerList = ({ customers, setCustomers }) => {
  const navigate = useNavigate();

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // --- MODAL STATES ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // --- FILTERED DATA ---
  const filteredCustomers = useMemo(() => {
    return (customers || []).filter((cust) => {
      // 1. Search Query Filter (Customer ID, Customer Name, City, Primary Contact, Phone)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const primaryContact = cust.contacts && cust.contacts.find((c) => c.contactType === 'Primary');
        const matchId = cust.customerId && cust.customerId.toLowerCase().includes(q);
        const matchName = cust.customerName && cust.customerName.toLowerCase().includes(q);
        const matchCity = cust.city && cust.city.toLowerCase().includes(q);
        const matchPhone = primaryContact && primaryContact.phone1 && primaryContact.phone1.includes(q);
        const matchContactName = primaryContact && primaryContact.contactPerson && primaryContact.contactPerson.toLowerCase().includes(q);

        if (!matchId && !matchName && !matchCity && !matchPhone && !matchContactName) {
          return false;
        }
      }

      // 2. Customer Type Filter
      if (typeFilter && cust.customerType !== typeFilter) {
        return false;
      }

      // 3. Territory Filter
      if (territoryFilter && cust.territoryId !== territoryFilter && cust.territoryName !== territoryFilter) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter && cust.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [customers, searchQuery, typeFilter, territoryFilter, statusFilter]);

  // --- DELETE HANDLERS ---
  const handleOpenDeleteModal = (cust) => {
    setSelectedCustomer(cust);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) => prev.filter((item) => item.id !== selectedCustomer.id && item.customerId !== selectedCustomer.customerId));
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
    toast.success('Customer deleted successfully.');
  };

  // --- IN-TABLE STATUS TOGGLE ---
  const handleStatusChange = (customerId, newStatus) => {
    setCustomers((prev) =>
      prev.map((item) => (item.customerId === customerId ? { ...item, status: newStatus } : item))
    );
    toast.success('Customer status updated successfully.');
  };

  // --- TABLE COLUMNS CONFIGURATION ---
  const columns = [
    {
      key: 'customerId',
      title: 'CUSTOMER ID',
      sortable: true,
      render: (val) => <span className="badge bg-secondary font-monospace">{val}</span>
    },
    {
      key: 'customerType',
      title: 'CUSTOMER TYPE',
      sortable: true,
      render: (val) => <span className="badge bg-light text-dark border">{val}</span>
    },
    {
      key: 'customerName',
      title: 'CUSTOMER NAME',
      sortable: true,
      render: (val) => <span className="fw-bold text-dark">{val}</span>
    },
    {
      key: 'primaryContact',
      title: 'PRIMARY CONTACT',
      sortable: true,
      render: (_, row) => {
        const primary = (row.contacts || []).find((c) => c.contactType === 'Primary') || (row.contacts || [])[0];
        return primary ? (
          <div>
            <div className="fw-semibold text-dark">{primary.contactPerson}</div>
            <span className="small text-muted">{primary.role || 'Primary'}</span>
          </div>
        ) : (
          <span className="text-muted">—</span>
        );
      }
    },
    {
      key: 'phone',
      title: 'PHONE',
      sortable: true,
      render: (_, row) => {
        const primary = (row.contacts || []).find((c) => c.contactType === 'Primary') || (row.contacts || [])[0];
        return primary && primary.phone1 ? (
          <span className="font-monospace text-dark">{primary.phone1}</span>
        ) : (
          <span className="text-muted">—</span>
        );
      }
    },
    {
      key: 'territoryName',
      title: 'TERRITORY',
      sortable: true,
      render: (val) => <span className="text-dark">{val || '—'}</span>
    },
    {
      key: 'city',
      title: 'CITY',
      sortable: true,
      render: (val) => <span className="text-dark">{val || '—'}</span>
    },
    {
      key: 'status',
      title: 'STATUS',
      sortable: true,
      align: 'center',
      render: (val, row) => (
        <select
          className={`table-status-select ${row.status === 'Active' ? 'active' : 'inactive'}`}
          value={row.status || 'Active'}
          onChange={(e) => handleStatusChange(row.customerId, e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      )
    },
    {
      key: 'createdDate',
      title: 'CREATED DATE',
      sortable: true,
      render: (val) => <span className="small text-muted">{val ? val.split(' ')[0] : '—'}</span>
    }
  ];

  // Table Action Buttons (View, Edit, Delete)
  const tableActions = (row) => (
    <div className="category-actions-container">
      <button
        type="button"
        className="category-action-btn view-btn"
        title="View Customer"
        aria-label={`View ${row.customerName}`}
        onClick={() => navigate(`/masters/customers/${row.customerId}/view`)}
      >
        <Eye size={15} color="#2563EB" />
      </button>

      <button
        type="button"
        className="category-action-btn edit-btn"
        title="Edit Customer"
        aria-label={`Edit ${row.customerName}`}
        onClick={() => navigate(`/masters/customers/${row.customerId}/edit`)}
      >
        <Pencil size={15} color="#16A34A" />
      </button>

      <button
        type="button"
        className="category-action-btn delete-btn"
        title="Delete Customer"
        aria-label={`Delete ${row.customerName}`}
        onClick={() => handleOpenDeleteModal(row)}
      >
        <Trash2 size={15} color="#DC2626" />
      </button>
    </div>
  );

  return (
    <div className="customer-master-page container-fluid px-0 px-md-1">
      <Helmet>
        <title>Customer Master | Sonocare CRM</title>
        <meta name="description" content="Manage healthcare customers, hospitals, and clinics in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* 1. TOP HEADER SECTION */}
      <div className="category-page-header">
        <div className="category-page-title-group">
          <Users size={28} style={{ color: '#2E3192' }} />
          <h1 className="category-page-title">Customer Master</h1>
        </div>

        <button
          type="button"
          className="category-add-btn"
          onClick={() => navigate('/masters/customers/add')}
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* 2. MAIN CARD CONTAINER */}
      <div className="category-card">
        {/* Card Header & Search / Filters */}
        <div className="category-card-header pb-3 border-bottom">
          <h2 className="category-card-title">Customer Register List</h2>

          {/* Search Box */}
          <div className="category-search-wrapper">
            <Search size={16} className="category-search-icon" />
            <input
              type="text"
              className="category-search-input"
              placeholder="Search by Customer ID, Name, Contact, Phone, City..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-light border-bottom">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto d-flex align-items-center text-muted small me-1">
              <Filter size={15} className="me-1" />
              <span className="fw-semibold">Filters:</span>
            </div>

            {/* Customer Type Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Customer Types</option>
                <option value="Hospital">Hospital</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
                <option value="Clinic">Clinic</option>
              </select>
            </div>

            {/* Territory Filter */}
            <div className="col-12 col-sm-6 col-md-3">
              <select
                className="form-select form-select-sm"
                value={territoryFilter}
                onChange={(e) => setTerritoryFilter(e.target.value)}
              >
                <option value="">All Territories</option>
                {mockTerritoryMasterData.map((t) => (
                  <option key={t.territoryId} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="col-12 col-sm-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {(typeFilter || territoryFilter || statusFilter || searchQuery) && (
              <div className="col-12 col-md-auto ms-auto">
                <button
                  type="button"
                  className="btn btn-sm btn-link text-decoration-none text-danger p-0 fw-semibold"
                  onClick={() => {
                    setTypeFilter('');
                    setTerritoryFilter('');
                    setStatusFilter('');
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="category-table-wrapper">
          <Table
            columns={columns}
            data={filteredCustomers}
            showSerialNumber={true}
            serialNumberHeader="S.No"
            actions={tableActions}
            actionHeader="ACTIONS"
            actionWidth="120px"
            emptyMessage="No customer records found"
            emptyIcon="bi-people"
            paginated={true}
            pageSizeOptions={[10, 25, 50]}
            defaultPageSize={10}
            tableClassName="category-custom-table"
            headerClassName=""
            bordered={false}
            striped={false}
            hover={true}
            minWidth="950px"
          />
        </div>
      </div>

      {/* 3. DELETE CUSTOMER CONFIRMATION MODAL */}
      <Modal
        show={isDeleteModalOpen}
        onHide={() => setIsDeleteModalOpen(false)}
        title="Delete Customer"
        size="md"
        centered={true}
        footer={
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        {selectedCustomer && (
          <div className="py-2">
            <p className="text-dark fs-6 mb-0">
              Are you sure you want to delete this customer?
            </p>
            <div className="alert alert-light border mt-3 mb-0 p-2 text-dark small">
              <strong>{selectedCustomer.customerId}</strong> - {selectedCustomer.customerName} ({selectedCustomer.customerType})
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CustomerList;
