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
  FileText
} from 'lucide-react';
import '../styles/Layout.css';

/**
 * Fixed Collapsible Sidebar Component for MEDIALOGIC CRM
 * Uses react-router-dom navigation (useNavigate, useLocation).
 */
const Sidebar = ({ isCollapsed, isMobileOpen, activePage, onNavigate, closeMobileSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for nested Masters submenu expand/collapse
  const [isMastersOpen, setIsMastersOpen] = useState(true);

  // Toggle Masters accordion
  const handleToggleMasters = (e) => {
    e.stopPropagation();
    setIsMastersOpen((prev) => !prev);
  };

  // Route map for keys
  const routeMap = {
    'master-category': '/our-stock/master/general-categories',
    'master-department': '/our-stock/master/department',
    'master-role': '/our-stock/master/role',
    'master-employee': '/our-stock/master/employee',
    'master-customer': '/masters/customers',
    'customer': '/masters/customers',
    'master-product': '/our-stock/master/products',
    'master-kit': '/masters/kits',
    'master-territory': '/our-stock/master/territory',
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
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'enquiry', path: '/masters/enquiries', label: 'Enquiry', icon: HelpCircle },
    { key: 'lead', path: '/leads', label: 'Lead Management', icon: UserCheck },
    { key: 'proforma-invoice', path: '/proforma-invoice', label: 'Proforma Invoice', icon: FileText },
    { key: 'order-fulfilment', path: '/order-fulfilment', label: 'Order Fulfilment', icon: PackageCheck },
    { key: 'campaign', label: 'Campaign', icon: Megaphone },
    { key: 'log-outreach', path: '/campaign/log-outreach', label: 'Log Outreach Activity', icon: PhoneCall },
    { key: 'customer', label: 'Customer', icon: Users },
    { key: 'product', label: 'Product', icon: Package },
    { key: 'kit', path: '/masters/kits', label: 'Kit', icon: Box },
    { key: 'order', label: 'Order', icon: ShoppingCart },
    { key: 'service', label: 'Service', icon: Wrench },
    { key: 'amc', label: 'AMC', icon: ShieldCheck },
    { key: 'subscription', label: 'Subscription', icon: Repeat },
  ];

  // Masters sub-items
  const masterSubItems = [
    { key: 'master-category', path: '/our-stock/master/general-categories', label: 'Category Master', icon: FolderTree },
    { key: 'master-department', path: '/our-stock/master/department', label: 'Department Master', icon: Building2 },
    { key: 'master-role', path: '/our-stock/master/role', label: 'Role Master', icon: ShieldCheck },
    { key: 'master-employee', path: '/our-stock/master/employee', label: 'Employee Master', icon: UserCog },
    { key: 'master-customer', path: '/masters/customers', label: 'Customer Master', icon: Users },
    { key: 'master-product', path: '/our-stock/master/products', label: 'Product Master', icon: PackageCheck },
    { key: 'master-kit', path: '/masters/kits', label: 'Kit Master', icon: Boxes },
    { key: 'master-territory', path: '/our-stock/master/territory', label: 'Territory Master', icon: MapPin },
    { key: 'master-source', path: '/our-stock/master/source', label: 'Source Master', icon: Layers },
    { key: 'master-campaign', path: '/our-stock/master/campaign', label: 'Campaign Master', icon: Megaphone },
    { key: 'master-campaign-contacts', path: '/masters/campaign-contacts', label: 'Campaign Contacts', icon: Users },
    { key: 'master-enquiry', path: '/masters/enquiries', label: 'Enquiry Master', icon: HelpCircle },
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

        {/* Reports */}
        <li className="crm-nav-item">
          <div
            className={`crm-nav-link ${activePage === 'reports' ? 'active' : ''}`}
            onClick={() => handleNavClick('reports')}
            title={isCollapsed ? 'Reports' : ''}
            role="button"
            tabIndex={0}
          >
            <span className="crm-nav-icon">
              <BarChart3 size={20} />
            </span>
            <span className="crm-nav-text">Reports</span>
          </div>
        </li>

        {/* Settings */}
        <li className="crm-nav-item">
          <div
            className={`crm-nav-link ${activePage === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
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
