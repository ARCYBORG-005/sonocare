import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './Pages/Login';
import Layout from './Layouts/Layout';
import Category from './Pages/Masters/Category';
import Department from './Pages/Masters/Department';
import Role from './Pages/Masters/Role';
import EmployeeList from './Pages/Masters/EmployeeList';
import AddEmployee from './Pages/Masters/AddEmployee';
import EditEmployee from './Pages/Masters/EditEmployee';
import ViewEmployee from './Pages/Masters/ViewEmployee';
import Territory from './Pages/Masters/Territory';
import CityMaster from './Pages/Masters/CityMaster';
import Source from './Pages/Masters/Source';
import Campaign from './Pages/Masters/Campaign';
import CampaignContacts from './Pages/Masters/CampaignContacts';
import Enquiry from './Pages/Masters/Enquiry';
import AddEnquiry from './Pages/Masters/AddEnquiry';
import EditEnquiry from './Pages/Masters/EditEnquiry';
import ViewEnquiry from './Pages/Masters/ViewEnquiry';
import ProductList from './Pages/Masters/ProductList';
import AddProduct from './Pages/Masters/AddProduct';
import EditProduct from './Pages/Masters/EditProduct';
import ViewProduct from './Pages/Masters/ViewProduct';
import KitList from './Pages/Masters/KitList';
import AddKit from './Pages/Masters/AddKit';
import EditKit from './Pages/Masters/EditKit';
import ViewKit from './Pages/Masters/ViewKit';
import PartMaster from './Pages/Masters/PartMaster';
import CustomerList from './Pages/Masters/CustomerList';
import AddCustomer from './Pages/Masters/AddCustomer';
import EditCustomer from './Pages/Masters/EditCustomer';
import ViewCustomer from './Pages/Masters/ViewCustomer';
import LogOutreach from './Pages/Masters/LogOutreach';
import AddLogOutreach from './Pages/Masters/AddLogOutreach';
import EditLogOutreach from './Pages/Masters/EditLogOutreach';
import OutreachHistory from './Pages/Masters/OutreachHistory';
import Lead from './Pages/Lead/Lead';
import AddLead from './Pages/Lead/AddLead';
import EditLead from './Pages/Lead/EditLead';
import ViewLead from './Pages/Lead/ViewLead';
import PIPage from './Pages/Lead/PIPage';
import PIVersionManagement from './Pages/Lead/PIVersionManagement';
import LeadFollowUpHistory from './Pages/Lead/LeadFollowUpHistory';
import AddLeadFollowUp from './Pages/Lead/AddLeadFollowUp';
import LeadDemo from './Pages/Lead/LeadDemo';
import OrderFulfilment from './Pages/OrderFulfilment/OrderFulfilment';
import KitGeneration from './Pages/OrderFulfilment/KitGeneration';
import TaxInvoiceEWayBill from './Pages/OrderFulfilment/TaxInvoiceEWayBill';
import InstallationTaskAssignment from './Pages/OrderFulfilment/InstallationTaskAssignment';
import TransactionHistory from './Pages/OrderFulfilment/TransactionHistory';
import OrderCancellation from './Pages/OrderFulfilment/OrderCancellation';
import ViewCancellation from './Pages/OrderFulfilment/ViewCancellation';
import EditCancellation from './Pages/OrderFulfilment/EditCancellation';
import TicketManagement from './Pages/Service/TicketManagement';
import AddTicket from './Pages/Service/AddTicket';
import ViewTicket from './Pages/Service/ViewTicket';
import EditTicket from './Pages/Service/EditTicket';
import TicketServiceOperations from './Pages/Service/TicketServiceOperations';
import AssignTicket from './Pages/Service/AssignTicket';
import TechnicalEscalation from './Pages/Service/TechnicalEscalation';
import Dashboard from './Pages/Dashboard';
import WaitingForCustomerOrParts from './Pages/Service/WaitingForCustomerOrParts';
import CampaignReport from './Pages/Reports/CampaignReport';
import LeadReport from './Pages/Reports/LeadReport';
import SalesReport from './Pages/Reports/SalesReport';
import AMCReport from './Pages/Reports/AMCReport';
import SubscriptionReport from './Pages/Reports/SubscriptionReport';
import TicketReport from './Pages/Reports/TicketReport';
import AccessPrivilege from './Pages/Settings/AccessPrivilege';
import AMCManagement from './Pages/AMC/AMCManagement';
import EditAMCContract from './Pages/AMC/EditAMCContract';
import ViewAMCContract from './Pages/AMC/ViewAMCContract';
import AMCRenewal from './Pages/AMC/AMCRenewal';
import AMCRenewalPI from './Pages/AMC/AMCRenewalPI';
import AMCRenewalInvoice from './Pages/AMC/AMCRenewalInvoice';
import SubscriptionManagement from './Pages/Subscription/SubscriptionManagement';
import ViewSubscription from './Pages/Subscription/ViewSubscription';
import EditSubscription from './Pages/Subscription/EditSubscription';
import SubscriptionRenewal from './Pages/Subscription/SubscriptionRenewal';
import SubscriptionRenewalPI from './Pages/Subscription/SubscriptionRenewalPI';
import SubscriptionRenewalInvoice from './Pages/Subscription/SubscriptionRenewalInvoice';
import InventoryManagement from './Pages/Masters/InventoryManagement';
import AddInventory from './Pages/Masters/AddInventory';
import EditInventory from './Pages/Masters/EditInventory';
import ViewInventory from './Pages/Masters/ViewInventory';
import { initialMockInventory } from './Pages/Masters/mockInventory';
import { initialMockProducts } from './Pages/Masters/mockProducts';
import { initialMockKits } from './Pages/Masters/mockKits';
import { initialMockParts } from './Pages/Masters/mockParts';
import { initialMockCustomers } from './Pages/Masters/mockCustomers';
import { initialMockEmployees } from './Pages/Masters/mockEmployees';
import { initialMockEnquiries } from './Pages/Masters/mockEnquiry';
import { initialMockOutreachLogs } from './Pages/Masters/mockOutreachLogs';
import {
  initialMockLeads,
  initialMockFollowUps,
  initialMockDemos,
  initialMockPIs
} from './Pages/Lead/mockLead';
import { toast } from './components/Toast';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [inventory, setInventory] = useState(initialMockInventory);
  const [products, setProducts] = useState(initialMockProducts);
  const [kits, setKits] = useState(initialMockKits);
  const [parts, setParts] = useState(initialMockParts);
  const [customers, setCustomers] = useState(initialMockCustomers);
  const [employees, setEmployees] = useState(initialMockEmployees);
  const [enquiries, setEnquiries] = useState(initialMockEnquiries);
  const [outreachLogs, setOutreachLogs] = useState(initialMockOutreachLogs);
  const [leads, setLeads] = useState(initialMockLeads);
  const [followUps, setFollowUps] = useState(initialMockFollowUps);
  const [demos, setDemos] = useState(initialMockDemos);
  const [pis, setPIs] = useState(initialMockPIs);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/our-stock/master/general-categories');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/login');
  };

  // Product Handlers
  const handleStatusChange = (id, newStatus) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success(`Product status updated to ${newStatus}`);
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === updatedProduct.id ? updatedProduct : item))
    );
  };

  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Kit Handlers
  const handleKitStatusChange = (id, newStatus) => {
    setKits((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    toast.success(`Kit status updated to ${newStatus}`);
  };

  const handleAddKit = (newKit) => {
    setKits((prev) => [newKit, ...prev]);
  };

  const handleUpdateKit = (updatedKit) => {
    setKits((prev) =>
      prev.map((item) => (item.id === updatedKit.id ? updatedKit : item))
    );
  };

  const handleDeleteKit = (id) => {
    setKits((prev) => prev.filter((item) => item.id !== id));
  };

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {location.pathname === '/login' ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Layout
          activePage={location.pathname}
          onLogout={handleLogout}
          currentUser={{ name: 'Admin User', role: 'MEDIALOGIC Executive' }}
        >
          <Routes>
            {/* Default Dashboard Routes */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Inventory Master Register Routes */}
            <Route
              path="/inventory"
              element={<InventoryManagement inventory={inventory} setInventory={setInventory} />}
            />
            <Route
              path="/inventory/add"
              element={
                <AddInventory
                  inventory={inventory}
                  setInventory={setInventory}
                  products={products}
                  kits={kits}
                />
              }
            />
            <Route
              path="/inventory/edit/:id"
              element={
                <EditInventory
                  inventory={inventory}
                  setInventory={setInventory}
                  products={products}
                  kits={kits}
                />
              }
            />
            <Route
              path="/inventory/view/:id"
              element={
                <ViewInventory
                  inventory={inventory}
                  setInventory={setInventory}
                />
              }
            />

            {/* Category Master Routes */}
            <Route path="/our-stock/master/general-categories" element={<Category />} />
            <Route path="/our-stock/master/general-categories/add" element={<Category />} />
            <Route path="/our-stock/master/general-categories/edit/:id" element={<Category />} />
            <Route path="/our-stock/master/general-categories/view/:id" element={<Category />} />

            {/* Department Master Route */}
            <Route path="/our-stock/master/department" element={<Department />} />

            {/* Role Master Route */}
            <Route path="/our-stock/master/role" element={<Role />} />

            {/* Employee Master Routes */}
            <Route
              path="/masters/employees"
              element={<EmployeeList employees={employees} setEmployees={setEmployees} />}
            />
            <Route
              path="/our-stock/master/employee"
              element={<EmployeeList employees={employees} setEmployees={setEmployees} />}
            />
            <Route
              path="/masters/employees/add"
              element={<AddEmployee employees={employees} setEmployees={setEmployees} />}
            />
            <Route
              path="/masters/employees/:id/view"
              element={<ViewEmployee employees={employees} setEmployees={setEmployees} />}
            />
            <Route
              path="/masters/employees/:id/edit"
              element={<EditEmployee employees={employees} setEmployees={setEmployees} />}
            />

            {/* Territory Master Route */}
            <Route path="/our-stock/master/territory" element={<Territory />} />

            {/* City Master Routes */}
            <Route path="/our-stock/master/city" element={<CityMaster />} />
            <Route path="/masters/cities" element={<CityMaster />} />

            {/* Source Master Route */}
            <Route path="/our-stock/master/source" element={<Source />} />

            {/* Campaign Master Routes */}
            <Route path="/our-stock/master/campaign" element={<Campaign />} />
            <Route path="/masters/campaigns" element={<Campaign />} />
            <Route path="/masters/campaign-contacts" element={<CampaignContacts />} />
            <Route path="/our-stock/master/campaign-contacts" element={<CampaignContacts />} />
            <Route
              path="/campaign/log-outreach"
              element={
                <LogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                  employees={employees}
                  enquiries={enquiries}
                  setEnquiries={setEnquiries}
                />
              }
            />
            <Route
              path="/masters/log-outreach"
              element={
                <LogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                  employees={employees}
                  enquiries={enquiries}
                  setEnquiries={setEnquiries}
                />
              }
            />
            <Route
              path="/campaign/log-outreach/add"
              element={
                <AddLogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                  employees={employees}
                />
              }
            />
            <Route
              path="/masters/log-outreach/add"
              element={
                <AddLogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                  employees={employees}
                />
              }
            />
            <Route
              path="/campaign/log-outreach/:id/edit"
              element={
                <EditLogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                />
              }
            />
            <Route
              path="/masters/log-outreach/:id/edit"
              element={
                <EditLogOutreach
                  outreachLogs={outreachLogs}
                  setOutreachLogs={setOutreachLogs}
                />
              }
            />
            <Route
              path="/campaign/log-outreach/:contactId/history"
              element={
                <OutreachHistory
                  outreachLogs={outreachLogs}
                />
              }
            />
            <Route
              path="/masters/log-outreach/:contactId/history"
              element={
                <OutreachHistory
                  outreachLogs={outreachLogs}
                />
              }
            />

            {/* Lead Management Operational Routes */}
            <Route
              path="/leads"
              element={
                <Lead
                  leads={leads}
                  setLeads={setLeads}
                  followUps={followUps}
                  setFollowUps={setFollowUps}
                  demos={demos}
                  setDemos={setDemos}
                  pis={pis}
                  setPIs={setPIs}
                />
              }
            />
            <Route
              path="/leads/add"
              element={
                <AddLead
                  leads={leads}
                  setLeads={setLeads}
                  employees={employees}
                />
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <EditLead
                  leads={leads}
                  setLeads={setLeads}
                  employees={employees}
                />
              }
            />
            <Route
              path="/leads/:id/view"
              element={
                <ViewLead
                  leads={leads}
                  followUps={followUps}
                  demos={demos}
                  pis={pis}
                />
              }
            />
            <Route
              path="/proforma-invoice"
              element={
                <PIVersionManagement
                  leads={leads}
                  setLeads={setLeads}
                  pis={pis}
                  setPIs={setPIs}
                />
              }
            />
            <Route
              path="/proforma-invoice/:id/payments"
              element={
                <TransactionHistory
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/proforma-invoice/payments"
              element={
                <TransactionHistory
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-fulfilment"
              element={
                <OrderFulfilment
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-fulfilment/:id/kit"
              element={
                <KitGeneration
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                  kits={kits}
                />
              }
            />
            <Route
              path="/order-fulfilment/:id/tax-invoice"
              element={
                <TaxInvoiceEWayBill
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-fulfilment/:id/invoice"
              element={
                <TaxInvoiceEWayBill
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-fulfilment/:id/installation"
              element={
                <InstallationTaskAssignment
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-fulfilment/:id/transactions"
              element={
                <TransactionHistory
                  pis={pis}
                  setPIs={setPIs}
                  leads={leads}
                />
              }
            />
            <Route
              path="/order-cancellation"
              element={<OrderCancellation pis={pis} leads={leads} />}
            />
            <Route
              path="/order-cancellation/:id/view"
              element={<ViewCancellation pis={pis} leads={leads} />}
            />
            <Route
              path="/order-cancellation/:id/edit"
              element={<EditCancellation pis={pis} leads={leads} />}
            />
            <Route
              path="/service/tickets"
              element={<TicketManagement pis={pis} leads={leads} />}
            />
            <Route
              path="/service/tickets/add"
              element={<AddTicket pis={pis} leads={leads} />}
            />
            <Route
              path="/service/tickets/:id/view"
              element={<ViewTicket pis={pis} leads={leads} />}
            />
            <Route
              path="/service/tickets/:id/edit"
              element={<EditTicket pis={pis} leads={leads} />}
            />
            <Route
              path="/service/operations"
              element={<TicketServiceOperations pis={pis} leads={leads} />}
            />
            <Route
              path="/service/operations/:id/assign"
              element={<AssignTicket pis={pis} leads={leads} />}
            />
            <Route
              path="/service/operations/:id/escalate"
              element={<TechnicalEscalation pis={pis} leads={leads} />}
            />
            <Route
              path="/service/operations/:id/waiting"
              element={<WaitingForCustomerOrParts pis={pis} leads={leads} />}
            />
            <Route
              path="/reports/campaign"
              element={<CampaignReport pis={pis} leads={leads} />}
            />
            <Route
              path="/reports/lead"
              element={<LeadReport pis={pis} leads={leads} />}
            />
            <Route
              path="/reports/sales"
              element={<SalesReport />}
            />
            <Route
              path="/reports/amc"
              element={<AMCReport pis={pis} leads={leads} />}
            />
            <Route
              path="/reports/subscription"
              element={<SubscriptionReport />}
            />
            <Route
              path="/reports/tickets"
              element={<TicketReport />}
            />
            <Route
              path="/settings/access-privilege"
              element={<AccessPrivilege />}
            />
            <Route
              path="/warranty-amc"
              element={
                <AMCManagement
                  pis={pis}
                  leads={leads}
                />
              }
            />
            <Route
              path="/warranty-amc/renewal"
              element={<AMCRenewal pis={pis} leads={leads} />}
            />
            <Route
              path="/warranty-amc/renewal/:id/pi"
              element={<AMCRenewalPI pis={pis} leads={leads} />}
            />
            <Route
              path="/warranty-amc/renewal/:id/invoice"
              element={<AMCRenewalInvoice pis={pis} leads={leads} />}
            />
            <Route
              path="/warranty-amc/:id/edit"
              element={<EditAMCContract pis={pis} leads={leads} />}
            />
            <Route
              path="/warranty-amc/:id/view"
              element={<ViewAMCContract pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription"
              element={<SubscriptionManagement pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription/renewal"
              element={<SubscriptionRenewal pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription/renewal/:id/pi"
              element={<SubscriptionRenewalPI pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription/renewal/:id/invoice"
              element={<SubscriptionRenewalInvoice pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription/:id/view"
              element={<ViewSubscription pis={pis} leads={leads} />}
            />
            <Route
              path="/subscription/:id/edit"
              element={<EditSubscription pis={pis} leads={leads} />}
            />
            <Route
              path="/leads/:id/pi"
              element={
                <PIPage
                  leads={leads}
                  setLeads={setLeads}
                  pis={pis}
                  setPIs={setPIs}
                  products={products}
                  enquiries={enquiries}
                />
              }
            />
            <Route
              path="/leads/follow-ups"
              element={
                <LeadFollowUpHistory
                  leads={leads}
                  followUps={followUps}
                  setFollowUps={setFollowUps}
                  setLeads={setLeads}
                />
              }
            />
            <Route
              path="/leads/:id/follow-ups"
              element={
                <LeadFollowUpHistory
                  leads={leads}
                  followUps={followUps}
                  setFollowUps={setFollowUps}
                  setLeads={setLeads}
                />
              }
            />
            <Route
              path="/leads/add-follow-up"
              element={
                <LeadFollowUpHistory
                  leads={leads}
                  followUps={followUps}
                  setFollowUps={setFollowUps}
                  setLeads={setLeads}
                />
              }
            />
            <Route
              path="/leads/:id/add-follow-up"
              element={
                <LeadFollowUpHistory
                  leads={leads}
                  followUps={followUps}
                  setFollowUps={setFollowUps}
                  setLeads={setLeads}
                />
              }
            />

            {/* Lead Demo Management Routes */}
            <Route
              path="/leads/demo"
              element={
                <LeadDemo
                  leads={leads}
                  setLeads={setLeads}
                  demos={demos}
                  setDemos={setDemos}
                  employees={employees}
                  products={products}
                />
              }
            />
            <Route
              path="/leads/:id/demo"
              element={
                <LeadDemo
                  leads={leads}
                  setLeads={setLeads}
                  demos={demos}
                  setDemos={setDemos}
                  employees={employees}
                  products={products}
                />
              }
            />
            <Route
              path="/leads/:id/add-demo"
              element={
                <LeadDemo
                  leads={leads}
                  setLeads={setLeads}
                  demos={demos}
                  setDemos={setDemos}
                  employees={employees}
                  products={products}
                />
              }
            />

            {/* Enquiry Master Routes */}
            <Route path="/masters/enquiries" element={<Enquiry enquiries={enquiries} setEnquiries={setEnquiries} leads={leads} setLeads={setLeads} />} />
            <Route path="/our-stock/master/enquiries" element={<Enquiry enquiries={enquiries} setEnquiries={setEnquiries} leads={leads} setLeads={setLeads} />} />
            <Route path="/masters/enquiries/add" element={<AddEnquiry enquiries={enquiries} setEnquiries={setEnquiries} employees={employees} />} />
            <Route path="/our-stock/master/enquiries/add" element={<AddEnquiry enquiries={enquiries} setEnquiries={setEnquiries} employees={employees} />} />
            <Route path="/masters/enquiries/:id/edit" element={<EditEnquiry enquiries={enquiries} setEnquiries={setEnquiries} employees={employees} />} />
            <Route path="/our-stock/master/enquiries/:id/edit" element={<EditEnquiry enquiries={enquiries} setEnquiries={setEnquiries} employees={employees} />} />
            <Route path="/masters/enquiries/:id/view" element={<ViewEnquiry enquiries={enquiries} setEnquiries={setEnquiries} />} />
            <Route path="/our-stock/master/enquiries/:id/view" element={<ViewEnquiry enquiries={enquiries} setEnquiries={setEnquiries} />} />

            {/* Customer Master Routes */}
            <Route
              path="/masters/customers"
              element={<CustomerList customers={customers} setCustomers={setCustomers} />}
            />
            <Route
              path="/our-stock/master/customer"
              element={<CustomerList customers={customers} setCustomers={setCustomers} />}
            />
            <Route
              path="/masters/customers/add"
              element={<AddCustomer customers={customers} setCustomers={setCustomers} />}
            />
            <Route
              path="/masters/customers/:id/view"
              element={<ViewCustomer customers={customers} setCustomers={setCustomers} />}
            />
            <Route
              path="/masters/customers/:id/edit"
              element={<EditCustomer customers={customers} setCustomers={setCustomers} />}
            />

            {/* Product Master Routes */}
            <Route
              path="/our-stock/master/products"
              element={
                <ProductList
                  products={products}
                  onStatusChange={handleStatusChange}
                  onDeleteProduct={handleDeleteProduct}
                />
              }
            />
            <Route
              path="/our-stock/master/products/add"
              element={
                <AddProduct
                  onAddProduct={handleAddProduct}
                />
              }
            />
            <Route
              path="/our-stock/master/products/edit/:id"
              element={
                <EditProduct
                  products={products}
                  onUpdateProduct={handleUpdateProduct}
                />
              }
            />
            <Route
              path="/our-stock/master/products/view/:id"
              element={
                <ViewProduct
                  products={products}
                />
              }
            />

            {/* Kit Master Routes */}
            <Route
              path="/masters/kits"
              element={
                <KitList
                  kits={kits}
                  products={products}
                  onStatusChange={handleKitStatusChange}
                  onDeleteKit={handleDeleteKit}
                />
              }
            />
            <Route
              path="/masters/kits/add"
              element={
                <AddKit
                  products={products}
                  onAddKit={handleAddKit}
                />
              }
            />
            <Route
              path="/masters/kits/:id/edit"
              element={
                <EditKit
                  kits={kits}
                  products={products}
                  onUpdateKit={handleUpdateKit}
                />
              }
            />
            <Route
              path="/masters/kits/:id/view"
              element={
                <ViewKit
                  kits={kits}
                  products={products}
                />
              }
            />

            {/* Part Master Routes */}
            <Route
              path="/masters/parts"
              element={
                <PartMaster
                  parts={parts}
                  setParts={setParts}
                />
              }
            />
            <Route
              path="/our-stock/master/parts"
              element={
                <PartMaster
                  parts={parts}
                  setParts={setParts}
                />
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/our-stock/master/general-categories" replace />} />
          </Routes>
        </Layout>
      )}
    </div>
  );
}

export default App;
