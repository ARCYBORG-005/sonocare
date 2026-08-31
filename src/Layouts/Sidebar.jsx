import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  HelpCircle,
  UserCheck,
  Megaphone,
  PhoneCall,
  Users,
  Package,
  Box,
  ShoppingCart,
  Wrench,
  ShieldCheck,
  Repeat,
  FolderTree,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Settings,
  Building2,
  UserCog,
  PackageCheck,
  Boxes,
  MapPin,
  Layers,
  FileText,
  RefreshCw,
  Ban,
  TrendingUp,
  CreditCard,
  Key
} from 'lucide-react';
import '../styles/Layout.css';

/**
 * Fixed Collapsible Sidebar Component for MEDIALOGIC CRM
 * Uses react-router-dom navigation (useNavigate, useLocation).
 */
const Sidebar = ({ isCollapsed, isMobileOpen, activePage, onNavigate, closeMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for nested Masters and Reports submenus expand/collapse
  const [isMastersOpen, setIsMastersOpen] = useState(true);
  const [isReportsOpen, setIsReportsOpen] = useState(true);

  // Toggle Masters accordion
  const handleToggleMasters = (e) => {
    e.stopPropagation();
    setIsMastersOpen((prev) => !prev);
  };

  // Toggle Reports accordion
  const handleToggleReports = (e) => {
    e.stopPropagation();
    setIsReportsOpen((prev) => !prev);
  };

  // Route map for keys
  const routeMap = {
    'dashboard': '/dashboard',
    'settings': '/settings/access-privilege',
    'settings-access-privilege': '/settings/access-privilege',
    'master-category': '/our-stock/master/general-categories',
    'master-department': '/our-stock/master/department',
    'master-role': '/our-stock/master/role',
    'master-employee': '/our-stock/master/employee',
    'master-customer': '/masters/customers',
    'customer': '/masters/customers',
    'master-product': '/our-stock/master/products',
    'master-kit': '/masters/kits',
    'master-territory': '/our-stock/master/territory',
    'master-city': '/our-stock/master/city',
    'master-source': '/our-stock/master/source',
    'master-campaign': '/our-stock/master/campaign',
    'log-outreach': '/campaign/log-outreach',
    'proforma-invoice': '/proforma-invoice',
    'order-fulfilment': '/order-fulfilment',
    'kit': '/masters/kits',
    'lead': '/leads',
  };

  // Nav click handler
  const handleNavClick = (pageKey, explicitPath) => {
    const targetPath = explicitPath || routeMap[pageKey];
    if (targetPath) {
      navigate(targetPath);
    } else if (onNavigate) {
      onNavigate(pageKey);
    }
    if (closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  // Main navigation configuration array
  const mainNavItems = [
    { key: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'enquiry', path: '/masters/enquiries', label: 'Enquiry', icon: HelpCircle },
    { key: 'lead', path: '/leads', label: 'Lead Management', icon: UserCheck },
   { key: 'log-outreach', path: '/campaign/log-outreach', label: 'Log Outreach Activity', icon: PhoneCall },
    { key: 'proforma-invoice', path: '/proforma-invoice', label: 'Proforma Invoice', icon: FileText },
    { key: 'order-fulfilment', path: '/order-fulfilment', label: 'Order Fulfilment', icon: PackageCheck },
    { key: 'order-cancellation', path: '/order-cancellation', label: 'Order Cancellation', icon: Ban },
      { key: 'amc', path: '/warranty-amc', label: 'Warranty & AMC', icon: ShieldCheck },
   { key: 'amc-renewal', path: '/warranty-amc/renewal', label: 'AMC Renewal', icon: RefreshCw },
  
    
  
    
    { key: 'subscription', path: '/subscription', label: 'Subscription', icon: Repeat },
    { key: 'subscription-renewal', path: '/subscription/renewal', label: 'Subscription Renewal', icon: RefreshCw },
      { key: 'service', path: '/service/tickets', label: 'Ticket Creation', icon: Wrench },
     { key: 'service-operations', path: '/service/operations', label: 'Ticket Service Operations', icon: Wrench },
    ];

  // Masters sub-items
  const masterSubItems = [
    
    { key: 'master-category', path: '/our-stock/master/general-categories', label: 'Category Master', icon: FolderTree },
       { key: 'master-product', path: '/our-stock/master/products', label: 'Product Master', icon: PackageCheck },
        { key: 'master-kit', path: '/masters/kits', label: 'Kit Master', icon: Boxes },
         { key: 'master-part', path: '/masters/parts', label: 'Part Master', icon: Wrench },
         { key: 'master-inventory', path: '/inventory', label: 'Inventory Register', icon: Boxes },
           { key: 'master-territory', path: '/our-stock/master/territory', label: 'Territory Master', icon: MapPin },
           { key: 'master-city', path: '/our-stock/master/city', label: 'City Master', icon: Building2 },
         { key: 'master-department', path: '/our-stock/master/department', label: 'Department Master', icon: Building2 },
    { key: 'master-role', path: '/our-stock/master/role', label: 'Role Master', icon: ShieldCheck },
    { key: 'master-employee', path: '/our-stock/master/employee', label: 'Employee Master', icon: UserCog },
    { key: 'master-customer', path: '/masters/customers', label: 'Customer Master', icon: Users },
   
   
   
   
    { key: 'master-source', path: '/our-stock/master/source', label: 'Source Master', icon: Layers },
    { key: 'master-campaign', path: '/our-stock/master/campaign', label: 'Campaign Master', icon: Megaphone },
    { key: 'master-campaign-contacts', path: '/masters/campaign-contacts', label: 'Campaign Contacts', icon: Users },
  
  ];

  // Reports sub-items
  const reportsSubItems = [
    { key: 'reports-sales', path: '/reports/sales', label: 'Sales Report', icon: BarChart3 },
      { key: 'reports-lead', path: '/reports/lead', label: 'Lead Conversion Report', icon: TrendingUp },
    { key: 'reports-campaign', path: '/reports/campaign', label: 'Campaign Report', icon: Megaphone },
   
    
    { key: 'reports-amc', path: '/reports/amc', label: 'AMC & Warranty Report', icon: ShieldCheck },
    { key: 'reports-subscription', path: '/reports/subscription', label: 'Subscription Report', icon: CreditCard },
    { key: 'reports-tickets', path: '/reports/tickets', label: 'Ticket Report', icon: Wrench }
  ];

  const currentPath = location.pathname;

  return (
    <aside
      className={`crm-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
      aria-label="Application navigation sidebar"
    >
      <ul className="crm-nav-list">
        {/* Main Navigation Items */}
        {mainNavItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activePage === item.key || (item.path && currentPath.startsWith(item.path));
          return (
            <li key={item.key} className="crm-nav-item">
              <div
                className={`crm-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key, item.path)}
                title={isCollapsed ? item.label : ''}
                role="button"
                tabIndex={0}
              >
                <span className="crm-nav-icon">
                  <IconComponent size={20} />
                </span>
                <span className="crm-nav-text">{item.label}</span>
              </div>
            </li>
          );
        })}

        {/* ---------------------------------------------------------------- */}
        {/* MASTERS NESTED ACCORDION MENU                                   */}
        {/* ---------------------------------------------------------------- */}
        <li className="crm-nav-item">
          <div
            className={`crm-nav-link ${currentPath.includes('/master/') || (activePage && activePage.startsWith('master-')) ? 'active' : ''}`}
            onClick={handleToggleMasters}
            title={isCollapsed ? 'Masters' : ''}
            role="button"
            tabIndex={0}
          >
            <span className="crm-nav-icon">
              <FolderTree size={20} />
            </span>
            <span className="crm-nav-text">Masters</span>
            <span className="crm-chevron-icon">
              {isMastersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </div>

          {/* Sub-menu items for Masters */}
          {isMastersOpen && !isCollapsed && (
            <ul className="crm-submenu">
              {masterSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = currentPath.startsWith(subItem.path) || activePage === subItem.key;
                return (
                  <li key={subItem.key}>
                    <div
                      className={`crm-submenu-link ${isSubActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(subItem.key, subItem.path)}
                      role="button"
                      tabIndex={0}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </li>

        {/* ---------------------------------------------------------------- */}
        {/* REPORTS NESTED ACCORDION MENU                                   */}
        {/* ---------------------------------------------------------------- */}
        <li className="crm-nav-item">
          <div
            className={`crm-nav-link ${currentPath.startsWith('/reports') || activePage === 'reports' ? 'active' : ''}`}
            onClick={handleToggleReports}
            title={isCollapsed ? 'Reports' : ''}
            role="button"
            tabIndex={0}
          >
            <span className="crm-nav-icon">
              <BarChart3 size={20} />
            </span>
            <span className="crm-nav-text">Reports</span>
            <span className="crm-chevron-icon">
              {isReportsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </div>

          {/* Sub-menu items for Reports */}
          {isReportsOpen && !isCollapsed && (
            <ul className="crm-submenu">
              {reportsSubItems.map((subItem) => {
                const SubIcon = subItem.icon;
                const isSubActive = currentPath.startsWith(subItem.path) || activePage === subItem.key;
                return (
                  <li key={subItem.key}>
                    <div
                      className={`crm-submenu-link ${isSubActive ? 'active' : ''}`}
                      onClick={() => handleNavClick(subItem.key, subItem.path)}
                      role="button"
                      tabIndex={0}
                    >
                      <SubIcon size={16} />
                      <span>{subItem.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </li>

        {/* Settings */}
        <li className="crm-nav-item">
          <div
            className={`crm-nav-link ${currentPath.startsWith('/settings/access-privilege') || activePage === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings', '/settings/access-privilege')}
            title={isCollapsed ? 'Settings' : ''}
            role="button"
            tabIndex={0}
          >
            <span className="crm-nav-icon">
              <Settings size={20} />
            </span>
            <span className="crm-nav-text">Settings</span>
          </div>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
