import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { InputField, Dropdown } from '../../components/FormInputs';
import { toast, ToastContainer } from '../../components/Toast';
import {
  Wrench,
  ArrowLeft,
  UserCheck,
  PackageCheck,
  Plus,
  Save,
  AlertTriangle
} from 'lucide-react';
import { initialMockTickets } from './mockTicketData';
import '../../styles/Category.css';
import '../../styles/Product.css';
import '../../styles/Lead.css';

// Master List of Customers (Customer Master reference)
const CUSTOMER_MASTER_LIST = [
  {
    customerName: 'Apollo Hospitals',
    contactPerson: 'Dr. A. K. Sharma',
    mobile: '9840112233',
    email: 'apollo.service@apollo.com',
    territory: 'Chennai, Tamil Nadu'
  },
  {
    customerName: 'Fortis Healthcare',
    contactPerson: 'Dr. Priya Nair',
    mobile: '9811223344',
    email: 'service@fortis.com',
    territory: 'Bengaluru, Karnataka'
  },
  {
    customerName: 'Max Healthcare',
    contactPerson: 'Dr. Rajiv Malhotra',
    mobile: '9733114422',
    email: 'rajiv@max.com',
    territory: 'Delhi NCR, New Delhi'
  },
  {
    customerName: 'Manipal Hospital',
    contactPerson: 'Dr. Suresh Rao',
    mobile: '9740556677',
    email: 'suresh@manipal.com',
    territory: 'Hyderabad, Telangana'
  }
];

/**
 * AddTicket Component
 * Create new service ticket form page.
 * Route: /service/tickets/add
 */
const AddTicket = () => {
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    customerName: 'Apollo Hospitals',
    contactPerson: 'Dr. A. K. Sharma',
    mobile: '9840112233',
    email: 'apollo.service@apollo.com',
    territory: 'Chennai, Tamil Nadu',
    productName: 'Sonoscape P20 Expert Diagnostic Ultrasound System',
    category: 'Ultrasound Diagnostic Scanner',
    serialNumber: 'SN-P20-2026-4412',
    type: 'CAMC', // Subscription / Service Type (SAMC, CAMC, Subscription)
    priority: 'Critical', // Severity Type (Critical, High, Medium, Low)
    dateCreated: new Date().toISOString().split('T')[0],
    targetResolutionDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    issueSummary: 'Transducer probe signal intermittent loss during cardiac Doppler examination.'
  });

  // Handle Customer Selection from Customer Master
  const handleCustomerChange = (selectedName) => {
    const matched = CUSTOMER_MASTER_LIST.find((c) => c.customerName === selectedName);
    if (matched) {
      setFormState((prev) => ({
        ...prev,
        customerName: matched.customerName,
        contactPerson: matched.contactPerson,
        mobile: matched.mobile,
        email: matched.email,
        territory: matched.territory
      }));
    } else {
      setFormState((prev) => ({ ...prev, customerName: selectedName }));
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!formState.customerName.trim()) {
      toast.error('Please select or enter Customer Name!');
      return;
    }
    if (!formState.issueSummary.trim()) {
      toast.error('Please enter Problem / Issue Summary!');
      return;
    }

    const generatedId = `TCK-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket = {
      id: generatedId,
      ticketId: generatedId,
      ...formState,
      status: 'New', // Default status on creation
      assignedEngineer: 'Unassigned', // Assigned later in Ticket Operations
      feedback: 'Pending Feedback',
      feedbackRating: 0,
      resolutionNotes: 'Ticket created and queued for assignment.'
    };

    try {
      let list = [...initialMockTickets];
      const stored = JSON.parse(localStorage.getItem('app_service_tickets') || '[]');
      if (stored.length > 0) list = stored;

      list.unshift(newTicket);
      localStorage.setItem('app_service_tickets', JSON.stringify(list));
    } catch (err) {
      console.error(err);
    }

    toast.success(`Ticket ${generatedId} created successfully with status NEW!`);
    setTimeout(() => {
      navigate('/service/tickets');
    }, 1200);
  };

  return (
    <div className="order-fulfilment-page container-fluid px-0 px-md-2 py-2">
      <Helmet>
        <title>Create Ticket | Sonocare CRM</title>
        <meta name="description" content="Create new Service Ticket in Sonocare CRM." />
      </Helmet>
      <ToastContainer />

      {/* HEADER BAR */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 py-1">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary p-1"
            onClick={() => navigate('/service/tickets')}
            title="Back to Ticket Register"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <Wrench size={26} color="#2E3192" />
            <div>
              <h2 className="fs-5 fw-bold mb-0 text-dark">
                Create New Service Ticket
              </h2>
              <span className="small text-muted">Log customer breakdown problem, severity type, and service subscription specifications</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="d-flex flex-column gap-4 mb-4">
          
          {/* CARD 1: CUSTOMER MASTER INFORMATION */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <UserCheck size={18} color="#2E3192" />
              <span>Customer Master Information & Location</span>
            </div>
            <div className="p-3">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Customer / Hospital Name (From Customer Master) *"
                    options={CUSTOMER_MASTER_LIST.map((c) => c.customerName)}
                    value={formState.customerName}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Contact Person (Auto-populated)"
                    value={formState.contactPerson}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Mobile Number (Auto-populated)"
                    value={formState.mobile}
                    onChange={(e) => setFormState({ ...formState, mobile: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Email Address (Auto-populated)"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Territory / Location (Auto-populated)"
                    value={formState.territory}
                    onChange={(e) => setFormState({ ...formState, territory: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: PRODUCT & COMPLAINT DETAILS */}
          <div className="category-card shadow-sm border bg-white" style={{ borderRadius: '10px' }}>
            <div className="section-card-title-bar">
              <PackageCheck size={18} color="#2E3192" />
              <span>Product Equipment, Severity & Complaint Specifications</span>
            </div>

            <div className="p-3 d-flex flex-column gap-4">
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Product Equipment Name "
                    options={[
                      'Sonoscape P20 Expert Diagnostic Ultrasound System',
                      'Mindray DC-70 X-Insight Ultrasound Scanner',
                      'GE Voluson E10 Diagnostic Ultrasound Scanner',
                      'Samsung HS50 Ultrasound Diagnostics System'
                    ]}
                    value={formState.productName}
                    onChange={(e) => setFormState({ ...formState, productName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Product Category "
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <InputField
                    label="Product Serial Number "
                    value={formState.serialNumber}
                    onChange={(e) => setFormState({ ...formState, serialNumber: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Severity / Priority Type "
                    options={['Critical', 'High', 'Medium', 'Low']}
                    value={formState.priority}
                    onChange={(e) => setFormState({ ...formState, priority: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Dropdown
                    label="Subscription / Service Type *"
                    options={['SAMC', 'CAMC', 'Subscription']}
                    value={formState.type}
                    onChange={(e) => setFormState({ ...formState, type: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Date Created"
                    type="date"
                    value={formState.dateCreated}
                    onChange={(e) => setFormState({ ...formState, dateCreated: e.target.value })}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <InputField
                    label="Target SLA Resolution Date"
                    type="date"
                    value={formState.targetResolutionDate}
                    onChange={(e) => setFormState({ ...formState, targetResolutionDate: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold text-dark mb-1">
                    Problem / Issue Summary & Customer Complaint *
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Describe problem reported by customer..."
                    value={formState.issueSummary}
                    onChange={(e) => setFormState({ ...formState, issueSummary: e.target.value })}
                  />
                </div>
              </div>

              {/* CARD BOTTOM FOOTER */}
              <div className="d-flex gap-2 justify-content-end border-top pt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 fw-semibold"
                  onClick={() => navigate('/service/tickets')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-5 fw-bold shadow-sm d-inline-flex align-items-center gap-2"
                  style={{ backgroundColor: '#2E3192', borderColor: '#2E3192' }}
                >
                  <Save size={18} />
                  <span>Create Ticket</span>
                </button>
              </div>

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default AddTicket;
