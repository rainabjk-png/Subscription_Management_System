/**
 * SubFlow - Application Controller & View Manager
 * Handles SPA navigation, role-based rendering, modals, CRUD operations,
 * search filters, theme switching, and printable invoice generation.
 */

const App = {
  currentView: 'dashboard',
  theme: 'light',

  init() {
    // 1. Initialize store
    Store.init();

    // 2. Load theme preference
    this.initTheme();

    // 3. Setup event listeners
    this.bindEvents();

    // 4. Check URL hash for routing
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'products', 'customers', 'subscriptions', 'quotations', 'invoices', 'payments', 'discounts', 'reports', 'portal'];
    if (hash && validViews.includes(hash)) {
      this.currentView = hash;
    }

    // 5. Update user display and permissions
    this.updateUserSessionUI();

    // 6. Render current view
    this.navigate(this.currentView);
  },

  // -------------------------------------------------------------
  // Theme Toggle (Light / Dark Mode)
  // -------------------------------------------------------------
  initTheme() {
    const savedTheme = localStorage.getItem('SUBFLOW_THEME') || 'light';
    this.setTheme(savedTheme);
  },

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('SUBFLOW_THEME', theme);

    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' 
        ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>`
        : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`;
    }
  },

  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    // Re-render chart if active view is dashboard or reports
    if (this.currentView === 'dashboard' || this.currentView === 'reports') {
      setTimeout(() => this.renderCharts(), 50);
    }
  },

  // -------------------------------------------------------------
  // Role & Session Management
  // -------------------------------------------------------------
  updateUserSessionUI() {
    const user = Store.getCurrentUser();
    const rolePill = document.getElementById('currentRoleBadge');
    const userName = document.getElementById('currentUserName');
    const userRole = document.getElementById('currentUserRole');
    const userAvatar = document.getElementById('currentUserAvatar');

    if (rolePill) {
      rolePill.textContent = user.role;
      rolePill.className = `role-pill ${user.role.toLowerCase()}`;
    }

    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role === 'ADMIN' ? 'Administrator' : (user.role === 'STAFF' ? 'Staff Member' : 'Customer Account');
    if (userAvatar) {
      userAvatar.textContent = user.name.charAt(0).toUpperCase();
    }

    // Update Topbar Quick Switcher Buttons
    document.querySelectorAll('.role-switch-btn').forEach(btn => {
      const btnRole = btn.getAttribute('data-role');
      if (btnRole === user.role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Enforce role visibility on sidebar navigation items
    const discountsNavItem = document.getElementById('navItemDiscounts');
    const portalNavItem = document.getElementById('navItemPortal');

    if (user.role === 'CUSTOMER') {
      // Direct customer into portal automatically
      if (this.currentView !== 'portal') {
        this.navigate('portal');
      }
    }

    if (discountsNavItem) {
      // Discounts is Admin only
      discountsNavItem.style.display = user.role === 'ADMIN' ? 'flex' : 'none';
    }

    if (portalNavItem) {
      portalNavItem.style.display = user.role === 'CUSTOMER' ? 'flex' : 'none';
    }
  },

  switchUserRole(role) {
    Store.switchRole(role);
    this.updateUserSessionUI();
    this.showToast(`Switched active session to: ${role}`, 'info');

    if (role === 'CUSTOMER') {
      this.navigate('portal');
    } else {
      if (this.currentView === 'portal') {
        this.navigate('dashboard');
      } else {
        this.renderView(this.currentView);
      }
    }
  },

  // -------------------------------------------------------------
  // Navigation & Routing
  // -------------------------------------------------------------
  navigate(viewName) {
    const user = Store.getCurrentUser();

    // Role Guard: Customer can only view Portal
    if (user.role === 'CUSTOMER' && viewName !== 'portal') {
      this.showToast('Access restricted: Customer accounts are limited to the Customer Portal.', 'warning');
      viewName = 'portal';
    }

    // Role Guard: Staff cannot manage Discounts
    if (user.role === 'STAFF' && viewName === 'discounts') {
      this.showToast('Access restricted: Only Administrators can configure Discounts.', 'error');
      return;
    }

    this.currentView = viewName;
    window.location.hash = viewName;

    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Hide all page views, show targeted view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeViewEl = document.getElementById(`view-${viewName}`);
    if (activeViewEl) {
      activeViewEl.classList.add('active');
    }

    // Close mobile drawer if open
    this.closeMobileSidebar();

    // Render data for this view
    this.renderView(viewName);
  },

  renderView(viewName) {
    switch (viewName) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'products':
        this.renderProducts();
        this.renderPlans();
        break;
      case 'customers':
        this.renderCustomers();
        break;
      case 'subscriptions':
        this.renderSubscriptions();
        break;
      case 'quotations':
        this.renderQuotations();
        break;
      case 'invoices':
        this.renderInvoices();
        break;
      case 'payments':
        this.renderPayments();
        break;
      case 'discounts':
        this.renderDiscounts();
        break;
      case 'reports':
        this.renderReports();
        break;
      case 'portal':
        this.renderCustomerPortal();
        break;
    }
  },

  // -------------------------------------------------------------
  // VIEW: Dashboard
  // -------------------------------------------------------------
  renderDashboard() {
    const stats = Store.getDashboardStats();

    // Populate stat cards
    const totalCustEl = document.getElementById('statTotalCustomers');
    const activeSubsEl = document.getElementById('statActiveSubs');
    const revenueEl = document.getElementById('statRevenueReceived');
    const outstandingEl = document.getElementById('statOutstandingInvoices');
    const overdueEl = document.getElementById('statOverdueInvoices');

    if (totalCustEl) totalCustEl.textContent = stats.totalCustomers;
    if (activeSubsEl) activeSubsEl.textContent = stats.activeSubscriptions;
    if (revenueEl) revenueEl.textContent = `$${stats.revenueReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (outstandingEl) outstandingEl.textContent = `$${stats.outstandingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (overdueEl) overdueEl.textContent = `$${stats.overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Render Charts
    this.renderCharts();

    // Render Recent Activities
    this.renderRecentActivities();

    // Render Upcoming Renewals Table
    this.renderUpcomingRenewals();
  },

  renderCharts() {
    // 1. Monthly Revenue Chart
    Charts.renderRevenueChart('dashboardRevenueChart', [
      { label: 'May', value: 2450 },
      { label: 'Jun', value: 3100 },
      { label: 'Jul', value: 2850 },
      { label: 'Aug', value: 4200 },
      { label: 'Sep', value: 4950 },
      { label: 'Oct', value: 5800 }
    ]);

    // 2. Subscription Status Donut Chart
    const subs = Store.getSubscriptions();
    const statusCounts = {
      Active: subs.filter(s => s.status === 'Active').length,
      Confirmed: subs.filter(s => s.status === 'Confirmed').length,
      Draft: subs.filter(s => s.status === 'Draft').length,
      Closed: subs.filter(s => s.status === 'Closed').length
    };

    Charts.renderSubscriptionDonut('dashboardDonutChart', [
      { label: 'Active', count: statusCounts.Active, color: '#10B981' },
      { label: 'Confirmed', count: statusCounts.Confirmed, color: '#6366F1' },
      { label: 'Draft', count: statusCounts.Draft, color: '#F59E0B' },
      { label: 'Closed', count: statusCounts.Closed, color: '#94A3B8' }
    ]);
  },

  renderRecentActivities() {
    const container = document.getElementById('dashboardActivityList');
    if (!container) return;

    const activities = Store.getActivities();
    if (activities.length === 0) {
      container.innerHTML = `<div class="empty-state" style="padding: 24px;"><p style="color: var(--text-muted); font-size: 13px;">No recent activities logged.</p></div>`;
      return;
    }

    container.innerHTML = activities.slice(0, 5).map(act => `
      <div style="display: flex; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border-subtle);">
        <div style="width: 32px; height: 32px; border-radius: 50%; background-color: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0;">
          ${act.type === 'payment' ? '💳' : (act.type === 'subscription' ? '📄' : (act.type === 'quotation' ? '📝' : '⚡'))}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600;">
            <span>${this.escapeHtml(act.title)}</span>
            <span style="font-size: 11px; color: var(--text-subtle); font-weight: 400;">${act.time}</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">${this.escapeHtml(act.description)}</p>
        </div>
      </div>
    `).join('');
  },

  renderUpcomingRenewals() {
    const tableBody = document.getElementById('dashboardRenewalsTableBody');
    if (!tableBody) return;

    const subs = Store.getSubscriptions().filter(s => s.status === 'Active');
    if (subs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 24px; text-align: center; color: var(--text-muted);">No upcoming active renewals.</td></tr>`;
      return;
    }

    tableBody.innerHTML = subs.map(sub => {
      const cust = Store.getCustomer(sub.customerId);
      const plan = Store.getPlan(sub.planId);
      return `
        <tr>
          <td><span class="font-medium">${sub.id}</span></td>
          <td>${cust ? this.escapeHtml(cust.name) : 'Customer'}</td>
          <td>${plan ? this.escapeHtml(plan.name) : 'Plan'}</td>
          <td><span class="badge badge-neutral">${sub.billingInterval}</span></td>
          <td><span class="font-semibold text-primary">$${parseFloat(sub.totalAmount).toFixed(2)}</span></td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-outline-primary" onclick="App.triggerRenewSubscription('${sub.id}')">
                Auto-Renew
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Products & Plans
  // -------------------------------------------------------------
  renderProducts() {
    const tableBody = document.getElementById('productsTableBody');
    if (!tableBody) return;

    const products = Store.getProducts();
    if (products.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No products registered yet. Click "Add Product" to create one.</td></tr>`;
      return;
    }

    tableBody.innerHTML = products.map(prod => {
      const variantCount = prod.variants ? prod.variants.length : 0;
      const margin = prod.cost > 0 ? Math.round(((prod.sellingPrice - prod.cost) / prod.sellingPrice) * 100) : 100;
      return `
        <tr>
          <td><span class="font-semibold">${prod.id}</span></td>
          <td>
            <div>
              <div class="font-semibold">${this.escapeHtml(prod.name)}</div>
              <div style="font-size: 11.5px; color: var(--text-muted);">${this.escapeHtml(prod.notes || '')}</div>
            </div>
          </td>
          <td><span class="badge badge-neutral">${prod.type}</span></td>
          <td><span class="font-bold text-primary">$${parseFloat(prod.sellingPrice).toFixed(2)}</span></td>
          <td>$${parseFloat(prod.cost).toFixed(2)} <span style="font-size: 11px; color: var(--accent-success);">(${margin}% margin)</span></td>
          <td>
            <span class="badge badge-neutral" style="cursor: pointer;" onclick="App.openManageVariantsModal('${prod.id}')" title="Click to view/add variants">
              ${variantCount} variant(s)
            </span>
          </td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-outline" onclick="App.openEditProductModal('${prod.id}')" title="Edit Product">Edit</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.confirmDeleteProduct('${prod.id}')" title="Delete Product">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderPlans() {
    const tableBody = document.getElementById('plansTableBody');
    if (!tableBody) return;

    const plans = Store.getPlans();
    if (plans.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 32px; color: var(--text-muted);">No subscription plans available. Click "Create Plan" to configure one.</td></tr>`;
      return;
    }

    tableBody.innerHTML = plans.map(plan => {
      const prod = Store.getProduct(plan.productId);
      return `
        <tr>
          <td><span class="font-semibold">${plan.id}</span></td>
          <td>
            <div class="font-semibold">${this.escapeHtml(plan.name)}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">Product: ${prod ? this.escapeHtml(prod.name) : 'N/A'}</div>
          </td>
          <td><span class="font-bold text-primary">$${parseFloat(plan.price).toFixed(2)}</span></td>
          <td><span class="badge badge-confirmed">${plan.billingInterval}</span></td>
          <td>Min: ${plan.minQuantity || 1} seat(s)</td>
          <td>
            <span class="badge ${plan.autoRenew ? 'badge-active' : 'badge-neutral'}">
              ${plan.autoRenew ? 'Auto-Renew ON' : 'Manual'}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-primary" onclick="App.openCreateSubForPlan('${plan.id}')">Subscribe</button>
              <button class="btn btn-sm btn-outline" onclick="App.openEditPlanModal('${plan.id}')">Edit</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.confirmDeletePlan('${plan.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Customers
  // -------------------------------------------------------------
  renderCustomers(searchTerm = '', statusFilter = 'ALL') {
    const tableBody = document.getElementById('customersTableBody');
    if (!tableBody) return;

    let customers = Store.getCustomers();

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      customers = customers.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.email.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== 'ALL') {
      customers = customers.filter(c => c.status === statusFilter);
    }

    if (customers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">No customer records matched your query.</td></tr>`;
      return;
    }

    tableBody.innerHTML = customers.map(cust => {
      const subs = Store.getSubscriptions().filter(s => s.customerId === cust.id);
      const activeSubs = subs.filter(s => s.status === 'Active').length;
      return `
        <tr>
          <td><span class="font-semibold">${cust.id}</span></td>
          <td>
            <div>
              <div class="font-semibold">${this.escapeHtml(cust.name)}</div>
              <div style="font-size: 11.5px; color: var(--text-muted);">${this.escapeHtml(cust.contactPerson || '')}</div>
            </div>
          </td>
          <td>
            <div>${this.escapeHtml(cust.email)}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${this.escapeHtml(cust.phone || '')}</div>
          </td>
          <td>${this.escapeHtml(cust.industry || 'General Enterprise')}</td>
          <td>
            <span class="badge ${cust.status === 'Active' ? 'badge-active' : 'badge-neutral'}">
              <span class="badge-dot"></span> ${cust.status}
            </span>
          </td>
          <td><span class="font-semibold">${activeSubs}</span> active / ${subs.length} total</td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-outline-primary" onclick="App.openCustomerDetailsModal('${cust.id}')">Details</button>
              <button class="btn btn-sm btn-outline" onclick="App.openEditCustomerModal('${cust.id}')">Edit</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.confirmDeleteCustomer('${cust.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Subscriptions (Draft -> Quotation -> Confirmed -> Active -> Closed)
  // -------------------------------------------------------------
  renderSubscriptions(filterStatus = 'ALL') {
    const tableBody = document.getElementById('subscriptionsTableBody');
    if (!tableBody) return;

    let subs = Store.getSubscriptions();

    if (filterStatus !== 'ALL') {
      subs = subs.filter(s => s.status === filterStatus);
    }

    if (subs.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">No subscriptions matching status "${filterStatus}".</td></tr>`;
      return;
    }

    tableBody.innerHTML = subs.map(sub => {
      const cust = Store.getCustomer(sub.customerId);
      const plan = Store.getPlan(sub.planId);
      const statusClass = sub.status === 'Active' ? 'badge-active' :
        (sub.status === 'Confirmed' ? 'badge-confirmed' :
        (sub.status === 'Draft' ? 'badge-draft' :
        (sub.status === 'Closed' ? 'badge-closed' : 'badge-neutral')));

      // Build context action buttons based on status
      let actionButtons = '';
      if (sub.status === 'Draft') {
        actionButtons = `
          <button class="btn btn-sm btn-outline-primary" onclick="App.transitionSubStatus('${sub.id}', 'Quotation')">Draft Quote</button>
          <button class="btn btn-sm btn-success" onclick="App.transitionSubStatus('${sub.id}', 'Confirmed')">Confirm</button>
        `;
      } else if (sub.status === 'Quotation') {
        actionButtons = `
          <button class="btn btn-sm btn-success" onclick="App.transitionSubStatus('${sub.id}', 'Confirmed')">Accept & Confirm</button>
        `;
      } else if (sub.status === 'Confirmed') {
        actionButtons = `
          <button class="btn btn-sm btn-primary" onclick="App.transitionSubStatus('${sub.id}', 'Active')">Activate Now</button>
          <button class="btn btn-sm btn-outline" onclick="App.generateInvoiceForSub('${sub.id}')">Issue Invoice</button>
        `;
      } else if (sub.status === 'Active') {
        actionButtons = `
          <button class="btn btn-sm btn-outline-primary" onclick="App.triggerRenewSubscription('${sub.id}')">Renew</button>
          <button class="btn btn-sm btn-outline" onclick="App.generateInvoiceForSub('${sub.id}')">Bill Now</button>
          <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.transitionSubStatus('${sub.id}', 'Closed')">Close</button>
        `;
      } else if (sub.status === 'Closed') {
        actionButtons = `
          <button class="btn btn-sm btn-outline" onclick="App.transitionSubStatus('${sub.id}', 'Confirmed')">Reactivate</button>
        `;
      }

      return `
        <tr>
          <td><span class="font-semibold">${sub.id}</span></td>
          <td>${cust ? this.escapeHtml(cust.name) : 'Customer'}</td>
          <td>${plan ? this.escapeHtml(plan.name) : 'Plan'}</td>
          <td><span class="badge badge-neutral">${sub.billingInterval}</span></td>
          <td>${sub.quantity} seat(s)</td>
          <td><span class="font-bold text-primary">$${parseFloat(sub.totalAmount).toFixed(2)}</span></td>
          <td>
            <span class="badge ${statusClass}">
              <span class="badge-dot"></span> ${sub.status}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              ${actionButtons}
              <button class="btn btn-sm btn-outline" onclick="App.openEditSubscriptionModal('${sub.id}')" title="Edit">✏️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Quotations
  // -------------------------------------------------------------
  renderQuotations() {
    const tableBody = document.getElementById('quotationsTableBody');
    if (!tableBody) return;

    const quotations = Store.getQuotations();
    if (quotations.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">No quotation proposals created yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = quotations.map(qte => {
      const cust = Store.getCustomer(qte.customerId);
      const isConfirmed = qte.status === 'Confirmed';
      return `
        <tr>
          <td><span class="font-semibold">${qte.id}</span></td>
          <td>${cust ? this.escapeHtml(cust.name) : 'Customer'}</td>
          <td>
            <div class="font-semibold">${this.escapeHtml(qte.templateName)}</div>
            <div style="font-size: 11.5px; color: var(--text-muted);">${qte.items ? qte.items.length : 0} item(s) included</div>
          </td>
          <td>${qte.validUntil}</td>
          <td><span class="font-bold text-primary">$${parseFloat(qte.totalAmount).toFixed(2)}</span></td>
          <td>
            <span class="badge ${isConfirmed ? 'badge-active' : 'badge-draft'}">
              ${qte.status}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              ${!isConfirmed ? `
                <button class="btn btn-sm btn-success" onclick="App.confirmQuotationAction('${qte.id}')">
                  Convert to Sub
                </button>
              ` : `
                <span style="font-size: 12px; color: var(--accent-success); font-weight: 600;">Converted ✓</span>
              `}
              <button class="btn btn-sm btn-outline" onclick="App.previewQuotationModal('${qte.id}')">View</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Invoices
  // -------------------------------------------------------------
  renderInvoices(statusFilter = 'ALL') {
    const tableBody = document.getElementById('invoicesTableBody');
    if (!tableBody) return;

    let invoices = Store.getInvoices();

    if (statusFilter !== 'ALL') {
      invoices = invoices.filter(i => i.status === statusFilter);
    }

    if (invoices.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 36px; color: var(--text-muted);">No invoices found for filter "${statusFilter}".</td></tr>`;
      return;
    }

    tableBody.innerHTML = invoices.map(inv => {
      const cust = Store.getCustomer(inv.customerId);
      let statusClass = 'badge-neutral';
      if (inv.status === 'Paid') statusClass = 'badge-paid';
      else if (inv.status === 'Overdue') statusClass = 'badge-overdue';
      else if (inv.status === 'Confirmed') statusClass = 'badge-confirmed';
      else if (inv.status === 'Draft') statusClass = 'badge-draft';

      return `
        <tr>
          <td><span class="font-semibold">${inv.invoiceNumber}</span></td>
          <td>${cust ? this.escapeHtml(cust.name) : 'Customer'}</td>
          <td>${inv.issueDate}</td>
          <td>${inv.dueDate}</td>
          <td><span class="font-bold">$${parseFloat(inv.totalAmount).toFixed(2)}</span></td>
          <td><span class="text-primary font-semibold">$${parseFloat(inv.balanceDue || 0).toFixed(2)}</span></td>
          <td>
            <span class="badge ${statusClass}">
              <span class="badge-dot"></span> ${inv.status}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-outline-primary" onclick="App.openPrintableInvoice('${inv.id}')">Print / View</button>
              ${inv.status !== 'Paid' ? `
                <button class="btn btn-sm btn-success" onclick="App.openRecordPaymentModal('${inv.id}')">Pay</button>
              ` : ''}
              ${inv.status === 'Draft' ? `
                <button class="btn btn-sm btn-outline" onclick="App.updateInvoiceStatusAction('${inv.id}', 'Confirmed')">Confirm</button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Payments
  // -------------------------------------------------------------
  renderPayments() {
    const tableBody = document.getElementById('paymentsTableBody');
    if (!tableBody) return;

    const payments = Store.getPayments();
    if (payments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">No payment records on file.</td></tr>`;
      return;
    }

    tableBody.innerHTML = payments.map(pay => {
      const cust = Store.getCustomer(pay.customerId);
      return `
        <tr>
          <td><span class="font-semibold">${pay.id}</span></td>
          <td>${pay.invoiceId}</td>
          <td>${cust ? this.escapeHtml(cust.name) : 'Customer'}</td>
          <td><span class="font-bold" style="color: var(--accent-success);">$${parseFloat(pay.amount).toFixed(2)}</span></td>
          <td><span class="badge badge-neutral">${pay.method}</span></td>
          <td>${pay.date}</td>
          <td>
            <div><span class="font-medium">${pay.transactionRef || 'N/A'}</span></div>
            <div style="font-size: 11px; color: var(--text-muted);">${this.escapeHtml(pay.notes || '')}</div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Discounts (Admin Only)
  // -------------------------------------------------------------
  renderDiscounts() {
    const tableBody = document.getElementById('discountsTableBody');
    if (!tableBody) return;

    const user = Store.getCurrentUser();
    if (user.role !== 'ADMIN') {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--accent-danger);">Security Notice: Only Administrators have permission to manage discounts.</td></tr>`;
      return;
    }

    const discounts = Store.getDiscounts();
    if (discounts.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">No promotional discounts created.</td></tr>`;
      return;
    }

    tableBody.innerHTML = discounts.map(disc => {
      const isPercent = disc.type === 'Percentage';
      const formattedValue = isPercent ? `${disc.value}% OFF` : `$${parseFloat(disc.value).toFixed(2)} OFF`;
      const statusClass = disc.status === 'Active' ? 'badge-active' :
        (disc.status === 'Expired' ? 'badge-expired' : 'badge-exhausted');

      return `
        <tr>
          <td><span class="badge badge-confirmed" style="font-size: 13px; font-family: monospace;">${disc.code}</span></td>
          <td><span class="font-bold text-primary">${formattedValue}</span></td>
          <td>Min: $${parseFloat(disc.minPurchase || 0).toFixed(2)}</td>
          <td>${disc.startDate} to ${disc.endDate}</td>
          <td>${disc.usageCount || 0} / ${disc.maxUsage || '∞'} used</td>
          <td>
            <span class="badge ${statusClass}">
              ${disc.status}
            </span>
          </td>
          <td>
            <div class="cell-actions">
              <button class="btn btn-sm btn-outline" onclick="App.openEditDiscountModal('${disc.id}')">Edit</button>
              <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.confirmDeleteDiscount('${disc.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // -------------------------------------------------------------
  // VIEW: Reports & Analytics
  // -------------------------------------------------------------
  renderReports() {
    const stats = Store.getDashboardStats();
    const subs = Store.getSubscriptions();
    const payments = Store.getPayments();

    const reportRevEl = document.getElementById('reportTotalRevenue');
    const reportOutEl = document.getElementById('reportOutstanding');
    const reportOverEl = document.getElementById('reportOverdue');
    const reportActiveSubs = document.getElementById('reportActiveSubs');

    if (reportRevEl) reportRevEl.textContent = `$${stats.revenueReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (reportOutEl) reportOutEl.textContent = `$${stats.outstandingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (reportOverEl) reportOverEl.textContent = `$${stats.overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (reportActiveSubs) reportActiveSubs.textContent = stats.activeSubscriptions;

    // Render SVG Charts in Reports View
    Charts.renderRevenueChart('reportsRevenueTrendChart', [
      { label: 'May', value: 2450 },
      { label: 'Jun', value: 3100 },
      { label: 'Jul', value: 2850 },
      { label: 'Aug', value: 4200 },
      { label: 'Sep', value: 4950 },
      { label: 'Oct', value: 5800 }
    ]);

    Charts.renderPlanDistribution('reportsPlanBreakdownContainer', [
      { name: 'Business Pro Suite', count: 18, share: 45, color: '#7C3AED' },
      { name: 'Developer Starter', count: 12, share: 30, color: '#6366F1' },
      { name: 'Enterprise Annual Cloud', count: 6, share: 15, color: '#EC4899' },
      { name: 'Security Shield Weekly', count: 4, share: 10, color: '#10B981' }
    ]);
  },

  // -------------------------------------------------------------
  // VIEW: Customer Portal (Self-Service View)
  // -------------------------------------------------------------
  renderCustomerPortal() {
    const user = Store.getCurrentUser();
    // Default to first customer if no customerId linked
    const customerId = user.customerId || 'CUST-001';
    const customer = Store.getCustomer(customerId);

    const titleEl = document.getElementById('portalCustomerName');
    const emailEl = document.getElementById('portalCustomerEmail');
    if (titleEl && customer) titleEl.textContent = customer.name;
    if (emailEl && customer) emailEl.textContent = customer.email;

    // 1. Customer Subscriptions
    const subsContainer = document.getElementById('portalSubscriptionsList');
    const mySubs = Store.getSubscriptions().filter(s => s.customerId === customerId);

    if (subsContainer) {
      if (mySubs.length === 0) {
        subsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 13.5px;">No active subscriptions for this account.</p>`;
      } else {
        subsContainer.innerHTML = mySubs.map(sub => {
          const plan = Store.getPlan(sub.planId);
          return `
            <div class="card" style="margin-bottom: 16px; border-left: 4px solid var(--primary);">
              <div class="card-body" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div>
                  <div style="font-size: 17px; font-weight: 700;">${plan ? this.escapeHtml(plan.name) : 'Subscription'}</div>
                  <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
                    Subscription #${sub.id} • ${sub.billingInterval} • Next billing date: <strong>${sub.nextBillingDate || sub.expiryDate}</strong>
                  </div>
                </div>
                <div style="display: flex; align-items: center; gap: 16px;">
                  <span class="font-bold" style="font-size: 20px; color: var(--primary);">$${parseFloat(sub.totalAmount).toFixed(2)}</span>
                  <span class="badge ${sub.status === 'Active' ? 'badge-active' : 'badge-neutral'}">${sub.status}</span>
                  ${sub.status === 'Active' ? `
                    <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.transitionSubStatus('${sub.id}', 'Closed')">Cancel Plan</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Customer Invoices
    const invoicesTableBody = document.getElementById('portalInvoicesTableBody');
    const myInvoices = Store.getInvoices().filter(i => i.customerId === customerId);

    if (invoicesTableBody) {
      if (myInvoices.length === 0) {
        invoicesTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No invoices for this account.</td></tr>`;
      } else {
        invoicesTableBody.innerHTML = myInvoices.map(inv => `
          <tr>
            <td><span class="font-semibold">${inv.invoiceNumber}</span></td>
            <td>${inv.issueDate}</td>
            <td>${inv.dueDate}</td>
            <td><span class="font-bold">$${parseFloat(inv.totalAmount).toFixed(2)}</span></td>
            <td>
              <span class="badge ${inv.status === 'Paid' ? 'badge-paid' : (inv.status === 'Overdue' ? 'badge-overdue' : 'badge-draft')}">
                ${inv.status}
              </span>
            </td>
            <td>
              <div class="cell-actions">
                <button class="btn btn-sm btn-outline-primary" onclick="App.openPrintableInvoice('${inv.id}')">Receipt / Invoice</button>
                ${inv.status !== 'Paid' ? `
                  <button class="btn btn-sm btn-success" onclick="App.openRecordPaymentModal('${inv.id}')">Pay Now</button>
                ` : ''}
              </div>
            </td>
          </tr>
        `).join('');
      }
    }
  },

  // -------------------------------------------------------------
  // PRINTABLE INVOICE MODAL
  // -------------------------------------------------------------
  openPrintableInvoice(invoiceId) {
    const inv = Store.getInvoice(invoiceId);
    if (!inv) return;

    const cust = Store.getCustomer(inv.customerId);
    const sub = Store.getSubscription(inv.subscriptionId);
    const plan = sub ? Store.getPlan(sub.planId) : null;

    const container = document.getElementById('invoicePrintContainer');
    if (!container) return;

    const subtotal = parseFloat(inv.subtotal || (inv.totalAmount / 1.1)).toFixed(2);
    const tax = parseFloat(inv.taxAmount || (inv.totalAmount - subtotal)).toFixed(2);
    const total = parseFloat(inv.totalAmount).toFixed(2);
    const paid = parseFloat(inv.amountPaid || 0).toFixed(2);
    const balance = parseFloat(inv.balanceDue || 0).toFixed(2);

    container.innerHTML = `
      <div class="invoice-print-sheet">
        <div class="invoice-header-row">
          <div>
            <div class="invoice-company-title">SubFlow Technologies Inc.</div>
            <p style="font-size: 13px; color: #64748B; margin-top: 4px;">Subscription Billing & SaaS Management Suite</p>
            <p style="font-size: 12px; color: #94A3B8;">info@subflow.io • www.subflow.io</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 26px; font-weight: 800; color: #0F172A;">INVOICE</div>
            <div style="font-size: 14px; font-weight: 600; color: #7C3AED;">#${inv.invoiceNumber}</div>
            <div style="margin-top: 6px;">
              <span class="badge ${inv.status === 'Paid' ? 'badge-paid' : 'badge-draft'}" style="font-size: 13px;">
                ${inv.status}
              </span>
            </div>
          </div>
        </div>

        <div class="invoice-meta-grid">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: 700; margin-bottom: 4px;">Billed To:</div>
            <div style="font-size: 15px; font-weight: 700; color: #0F172A;">${cust ? this.escapeHtml(cust.name) : 'Valued Customer'}</div>
            <div style="color: #475569;">${cust ? this.escapeHtml(cust.contactPerson || '') : ''}</div>
            <div style="color: #475569;">${cust ? this.escapeHtml(cust.address || 'Enterprise HQ') : ''}</div>
            <div style="color: #475569;">${cust ? this.escapeHtml(cust.email) : ''}</div>
          </div>
          <div style="text-align: right;">
            <div style="margin-bottom: 6px;"><span style="color: #64748B;">Issue Date:</span> <strong>${inv.issueDate}</strong></div>
            <div style="margin-bottom: 6px;"><span style="color: #64748B;">Due Date:</span> <strong>${inv.dueDate}</strong></div>
            <div><span style="color: #64748B;">Linked Subscription:</span> <strong>${inv.subscriptionId || 'Direct'}</strong></div>
          </div>
        </div>

        <table class="invoice-summary-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style="font-weight: 600;">${plan ? this.escapeHtml(plan.name) : 'Subscription Plan Service'}</div>
                <div style="font-size: 12px; color: #64748B;">Recurring billing cycle access</div>
              </td>
              <td style="text-align: center;">${sub ? sub.quantity : 1}</td>
              <td style="text-align: right;">$${sub ? parseFloat(sub.unitPrice).toFixed(2) : subtotal}</td>
              <td style="text-align: right; font-weight: 600;">$${subtotal}</td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-total-box">
          <div class="invoice-total-row">
            <span style="color: #64748B;">Subtotal:</span>
            <span>$${subtotal}</span>
          </div>
          <div class="invoice-total-row">
            <span style="color: #64748B;">Tax (10%):</span>
            <span>$${tax}</span>
          </div>
          <div class="invoice-total-row grand">
            <span>Total:</span>
            <span>$${total}</span>
          </div>
          <div class="invoice-total-row" style="color: var(--accent-success); font-weight: 600;">
            <span>Amount Paid:</span>
            <span>-$${paid}</span>
          </div>
          <div class="invoice-total-row" style="font-weight: 700; color: #EF4444; border-top: 1px dashed #CBD5E1; padding-top: 6px;">
            <span>Balance Due:</span>
            <span>$${balance}</span>
          </div>
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E2E8F0; font-size: 12px; color: #64748B; text-align: center;">
          Thank you for your business. Payment is due within standard agreed payment terms.
        </div>
      </div>
    `;

    this.openModal('modalPrintableInvoice');
  },

  printCurrentInvoice() {
    window.print();
  },

  // -------------------------------------------------------------
  // ACTIONS & OPERATIONS
  // -------------------------------------------------------------
  transitionSubStatus(subId, newStatus) {
    Store.updateSubscriptionStatus(subId, newStatus);
    this.showToast(`Subscription ${subId} transitioned to ${newStatus}`, 'success');
    this.renderView(this.currentView);
  },

  triggerRenewSubscription(subId) {
    const sub = Store.getSubscription(subId);
    if (!sub) return;

    // Extend nextBillingDate / expiryDate by 1 month
    const nextDate = new Date(sub.expiryDate || Date.now());
    nextDate.setMonth(nextDate.getMonth() + 1);
    const newExpiry = nextDate.toISOString().split('T')[0];
    sub.expiryDate = newExpiry;
    sub.nextBillingDate = newExpiry;
    sub.status = 'Active';

    // Automatically generate renewal invoice
    Store.saveInvoice({
      customerId: sub.customerId,
      subscriptionId: sub.id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subtotal: sub.totalAmount / 1.1,
      taxRate: 10,
      taxAmount: sub.totalAmount - (sub.totalAmount / 1.1),
      totalAmount: sub.totalAmount,
      amountPaid: 0,
      status: 'Confirmed',
      notes: `Renewal cycle invoice for ${sub.id}`
    });

    Store.persist();
    Store.addActivity('Subscription Renewed', `${sub.id} renewed until ${newExpiry}`, 'subscription');
    this.showToast(`Subscription ${sub.id} renewed successfully! Renewal invoice generated.`, 'success');
    this.renderView(this.currentView);
  },

  generateInvoiceForSub(subId) {
    const sub = Store.getSubscription(subId);
    if (!sub) return;

    const inv = Store.saveInvoice({
      customerId: sub.customerId,
      subscriptionId: sub.id,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subtotal: sub.totalAmount / 1.1,
      taxRate: 10,
      taxAmount: sub.totalAmount - (sub.totalAmount / 1.1),
      totalAmount: sub.totalAmount,
      amountPaid: 0,
      status: 'Confirmed',
      notes: `Generated billing invoice for ${sub.id}`
    });

    this.showToast(`Invoice ${inv.invoiceNumber} created for subscription ${sub.id}!`, 'success');
    this.renderView(this.currentView);
  },

  confirmQuotationAction(qteId) {
    const result = Store.confirmQuotation(qteId);
    if (result) {
      this.showToast(`Quotation ${qteId} converted into Subscription ${result.subscription.id}!`, 'success');
      this.renderView(this.currentView);
    }
  },

  updateInvoiceStatusAction(invId, status) {
    Store.updateInvoiceStatus(invId, status);
    this.showToast(`Invoice ${invId} marked as ${status}`, 'success');
    this.renderView(this.currentView);
  },

  // -------------------------------------------------------------
  // MODALS & FORMS
  // -------------------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  },

  // 1. Product Modal
  openAddProductModal() {
    document.getElementById('productForm').reset();
    document.getElementById('productIdHidden').value = '';
    document.getElementById('productModalTitle').textContent = 'Add New Product';
    this.openModal('modalProduct');
  },

  openEditProductModal(id) {
    const prod = Store.getProduct(id);
    if (!prod) return;

    document.getElementById('productIdHidden').value = prod.id;
    document.getElementById('productName').value = prod.name;
    document.getElementById('productType').value = prod.type;
    document.getElementById('productPrice').value = prod.sellingPrice;
    document.getElementById('productCost').value = prod.cost;
    document.getElementById('productNotes').value = prod.notes || '';
    document.getElementById('productModalTitle').textContent = `Edit Product: ${prod.name}`;

    this.openModal('modalProduct');
  },

  handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('productIdHidden').value;
    const name = document.getElementById('productName').value.trim();
    const type = document.getElementById('productType').value;
    const price = parseFloat(document.getElementById('productPrice').value) || 0;
    const cost = parseFloat(document.getElementById('productCost').value) || 0;
    const notes = document.getElementById('productNotes').value.trim();

    Store.saveProduct({
      id: id || null,
      name,
      type,
      sellingPrice: price,
      cost,
      notes
    });

    this.closeModal('modalProduct');
    this.showToast(`Product "${name}" saved successfully!`, 'success');
    this.renderProducts();
  },

  confirmDeleteProduct(id) {
    if (confirm('Are you sure you want to delete this product and its associated plans?')) {
      Store.deleteProduct(id);
      this.showToast('Product removed.', 'info');
      this.renderProducts();
      this.renderPlans();
    }
  },

  // 2. Plan Modal
  openAddPlanModal() {
    const form = document.getElementById('planForm');
    if (form) form.reset();
    document.getElementById('planIdHidden').value = '';
    document.getElementById('planModalTitle').textContent = 'Create Subscription Plan';

    // Populate product dropdown
    const select = document.getElementById('planProductSelect');
    select.innerHTML = Store.getProducts().map(p => `
      <option value="${p.id}">${this.escapeHtml(p.name)} ($${parseFloat(p.sellingPrice).toFixed(2)})</option>
    `).join('');

    this.openModal('modalPlan');
  },

  openEditPlanModal(id) {
    const plan = Store.getPlan(id);
    if (!plan) return;

    // Populate product dropdown
    const select = document.getElementById('planProductSelect');
    select.innerHTML = Store.getProducts().map(p => `
      <option value="${p.id}" ${p.id === plan.productId ? 'selected' : ''}>${this.escapeHtml(p.name)}</option>
    `).join('');

    document.getElementById('planIdHidden').value = plan.id;
    document.getElementById('planName').value = plan.name;
    document.getElementById('planPrice').value = plan.price;
    document.getElementById('planInterval').value = plan.billingInterval;
    document.getElementById('planMinQuantity').value = plan.minQuantity || 1;
    document.getElementById('planAutoRenew').checked = plan.autoRenew;
    document.getElementById('planModalTitle').textContent = `Edit Plan: ${plan.name}`;

    this.openModal('modalPlan');
  },

  handlePlanSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('planIdHidden').value;
    const productId = document.getElementById('planProductSelect').value;
    const name = document.getElementById('planName').value.trim();
    const price = parseFloat(document.getElementById('planPrice').value) || 0;
    const interval = document.getElementById('planInterval').value;
    const minQty = parseInt(document.getElementById('planMinQuantity').value) || 1;
    const autoRenew = document.getElementById('planAutoRenew').checked;

    Store.savePlan({
      id: id || null,
      productId,
      name,
      price,
      billingInterval: interval,
      minQuantity: minQty,
      autoRenew
    });

    this.closeModal('modalPlan');
    this.showToast(`Plan "${name}" saved!`, 'success');
    this.renderPlans();
  },

  confirmDeletePlan(id) {
    if (confirm('Delete this subscription plan?')) {
      Store.deletePlan(id);
      this.showToast('Plan removed.', 'info');
      this.renderPlans();
    }
  },

  // 3. Customer Modal
  openAddCustomerModal() {
    document.getElementById('customerForm').reset();
    document.getElementById('customerIdHidden').value = '';
    document.getElementById('customerModalTitle').textContent = 'Add New Customer';
    this.openModal('modalCustomer');
  },

  openEditCustomerModal(id) {
    const cust = Store.getCustomer(id);
    if (!cust) return;

    document.getElementById('customerIdHidden').value = cust.id;
    document.getElementById('custName').value = cust.name;
    document.getElementById('custContact').value = cust.contactPerson || '';
    document.getElementById('custEmail').value = cust.email;
    document.getElementById('custPhone').value = cust.phone || '';
    document.getElementById('custIndustry').value = cust.industry || '';
    document.getElementById('custAddress').value = cust.address || '';
    document.getElementById('custStatus').value = cust.status;
    document.getElementById('customerModalTitle').textContent = `Edit Customer: ${cust.name}`;

    this.openModal('modalCustomer');
  },

  handleCustomerSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('customerIdHidden').value;
    const name = document.getElementById('custName').value.trim();
    const contactPerson = document.getElementById('custContact').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const industry = document.getElementById('custIndustry').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const status = document.getElementById('custStatus').value;

    Store.saveCustomer({
      id: id || null,
      name,
      contactPerson,
      email,
      phone,
      industry,
      address,
      status
    });

    this.closeModal('modalCustomer');
    this.showToast(`Customer account "${name}" saved!`, 'success');
    this.renderCustomers();
  },

  openCustomerDetailsModal(id) {
    const cust = Store.getCustomer(id);
    if (!cust) return;

    const subs = Store.getSubscriptions().filter(s => s.customerId === cust.id);
    const invoices = Store.getInvoices().filter(i => i.customerId === cust.id);

    const container = document.getElementById('customerDetailsContent');
    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <h3 style="font-size: 18px; font-weight: 700;">${this.escapeHtml(cust.name)}</h3>
        <p style="color: var(--text-muted); font-size: 13px;">${this.escapeHtml(cust.contactPerson || '')} • ${this.escapeHtml(cust.email)} • ${this.escapeHtml(cust.phone || '')}</p>
        <p style="color: var(--text-muted); font-size: 12.5px;">${this.escapeHtml(cust.address || '')}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Subscriptions (${subs.length})</h4>
        ${subs.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No subscriptions.</p>' : `
          <ul style="list-style: none; padding: 0; font-size: 13px;">
            ${subs.map(s => {
              const p = Store.getPlan(s.planId);
              return `<li style="padding: 6px 0; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between;">
                <span><strong>${s.id}</strong> - ${p ? this.escapeHtml(p.name) : 'Plan'} (${s.billingInterval})</span>
                <span class="badge ${s.status === 'Active' ? 'badge-active' : 'badge-neutral'}">${s.status}</span>
              </li>`;
            }).join('')}
          </ul>
        `}
      </div>

      <div>
        <h4 style="font-size: 14px; font-weight: 700; margin-bottom: 8px;">Invoices (${invoices.length})</h4>
        ${invoices.length === 0 ? '<p style="color: var(--text-muted); font-size: 13px;">No invoices.</p>' : `
          <ul style="list-style: none; padding: 0; font-size: 13px;">
            ${invoices.map(i => `
              <li style="padding: 6px 0; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between;">
                <span><strong>${i.invoiceNumber}</strong> - $${parseFloat(i.totalAmount).toFixed(2)} (${i.issueDate})</span>
                <span class="badge ${i.status === 'Paid' ? 'badge-paid' : 'badge-draft'}">${i.status}</span>
              </li>
            `).join('')}
          </ul>
        `}
      </div>
    `;

    this.openModal('modalCustomerDetails');
  },

  confirmDeleteCustomer(id) {
    if (confirm('Delete this customer account and related subscriptions?')) {
      Store.deleteCustomer(id);
      this.showToast('Customer removed.', 'info');
      this.renderCustomers();
    }
  },

  // 4. Create Subscription Modal
  openCreateSubscriptionModal() {
    const form = document.getElementById('subscriptionForm');
    if (form) form.reset();

    // Populate customer dropdown
    const custSelect = document.getElementById('subCustomerSelect');
    custSelect.innerHTML = Store.getCustomers().map(c => `
      <option value="${c.id}">${this.escapeHtml(c.name)}</option>
    `).join('');

    // Populate plan dropdown
    const planSelect = document.getElementById('subPlanSelect');
    planSelect.innerHTML = Store.getPlans().map(p => `
      <option value="${p.id}" data-price="${p.price}" data-interval="${p.billingInterval}">${this.escapeHtml(p.name)} - $${parseFloat(p.price).toFixed(2)}/${p.billingInterval}</option>
    `).join('');

    this.updateSubModalPricing();
    this.openModal('modalSubscription');
  },

  openCreateSubForPlan(planId) {
    this.openCreateSubscriptionModal();
    const select = document.getElementById('subPlanSelect');
    if (select) {
      select.value = planId;
      this.updateSubModalPricing();
    }
  },

  updateSubModalPricing() {
    const planSelect = document.getElementById('subPlanSelect');
    const selectedOption = planSelect.options[planSelect.selectedIndex];
    const unitPrice = selectedOption ? parseFloat(selectedOption.getAttribute('data-price') || 0) : 0;
    const interval = selectedOption ? selectedOption.getAttribute('data-interval') : 'Monthly';
    const qty = parseInt(document.getElementById('subQuantity').value) || 1;

    document.getElementById('subUnitPrice').value = unitPrice.toFixed(2);
    document.getElementById('subInterval').value = interval;

    const subtotal = unitPrice * qty;
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    document.getElementById('subTaxAmount').value = tax.toFixed(2);
    document.getElementById('subTotalAmount').value = total.toFixed(2);
  },

  handleSubscriptionSubmit(e) {
    e.preventDefault();
    const customerId = document.getElementById('subCustomerSelect').value;
    const planId = document.getElementById('subPlanSelect').value;
    const status = document.getElementById('subStatusSelect').value;
    const interval = document.getElementById('subInterval').value;
    const paymentTerms = document.getElementById('subPaymentTerms').value;
    const quantity = parseInt(document.getElementById('subQuantity').value) || 1;
    const unitPrice = parseFloat(document.getElementById('subUnitPrice').value) || 0;
    const taxAmount = parseFloat(document.getElementById('subTaxAmount').value) || 0;
    const totalAmount = parseFloat(document.getElementById('subTotalAmount').value) || 0;
    const notes = document.getElementById('subNotes').value.trim();

    const startDate = new Date().toISOString().split('T')[0];
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    Store.saveSubscription({
      customerId,
      planId,
      status,
      startDate,
      expiryDate: expiry,
      nextBillingDate: startDate,
      billingInterval: interval,
      paymentTerms,
      quantity,
      unitPrice,
      taxRate: 10,
      taxAmount,
      totalAmount,
      notes
    });

    this.closeModal('modalSubscription');
    this.showToast('Subscription created successfully!', 'success');
    this.renderSubscriptions();
  },

  // 5. Payment Modal
  openRecordPaymentModal(preselectedInvoiceId = null) {
    const form = document.getElementById('paymentForm');
    if (form) form.reset();

    const select = document.getElementById('paymentInvoiceSelect');
    const unpaidInvoices = Store.getInvoices().filter(i => i.status !== 'Paid');

    if (unpaidInvoices.length === 0) {
      this.showToast('All invoices are already paid in full!', 'info');
      return;
    }

    select.innerHTML = unpaidInvoices.map(inv => {
      const cust = Store.getCustomer(inv.customerId);
      return `
        <option value="${inv.id}" data-balance="${inv.balanceDue}" ${inv.id === preselectedInvoiceId ? 'selected' : ''}>
          ${inv.invoiceNumber} - ${cust ? this.escapeHtml(cust.name) : ''} (Due: $${parseFloat(inv.balanceDue).toFixed(2)})
        </option>
      `;
    }).join('');

    this.updatePaymentAmountField();
    this.openModal('modalPayment');
  },

  updatePaymentAmountField() {
    const select = document.getElementById('paymentInvoiceSelect');
    const selectedOption = select.options[select.selectedIndex];
    const balance = selectedOption ? parseFloat(selectedOption.getAttribute('data-balance') || 0) : 0;
    document.getElementById('paymentAmount').value = balance.toFixed(2);
  },

  handlePaymentSubmit(e) {
    e.preventDefault();
    const invoiceId = document.getElementById('paymentInvoiceSelect').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value) || 0;
    const method = document.getElementById('paymentMethod').value;
    const ref = document.getElementById('paymentRef').value.trim();
    const notes = document.getElementById('paymentNotes').value.trim();

    Store.recordPayment({
      invoiceId,
      amount,
      method,
      transactionRef: ref || 'REF-' + Date.now().toString().slice(-6),
      notes
    });

    this.closeModal('modalPayment');
    this.showToast(`Payment of $${amount.toFixed(2)} recorded successfully!`, 'success');
    this.renderView(this.currentView);
  },

  // 6. Discount Modal (Admin Only)
  openAddDiscountModal() {
    const user = Store.getCurrentUser();
    if (user.role !== 'ADMIN') {
      this.showToast('Administrator permission required.', 'error');
      return;
    }
    document.getElementById('discountForm').reset();
    document.getElementById('discountIdHidden').value = '';
    this.openModal('modalDiscount');
  },

  handleDiscountSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('discountIdHidden').value;
    const code = document.getElementById('discountCode').value.trim().toUpperCase();
    const type = document.getElementById('discountType').value;
    const value = parseFloat(document.getElementById('discountValue').value) || 0;
    const minPurchase = parseFloat(document.getElementById('discountMinPurchase').value) || 0;
    const maxUsage = parseInt(document.getElementById('discountMaxUsage').value) || 100;
    const endDate = document.getElementById('discountEndDate').value;
    const notes = document.getElementById('discountNotes').value.trim();

    Store.saveDiscount({
      id: id || null,
      code,
      type,
      value,
      minPurchase,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || '2026-12-31',
      maxUsage,
      notes
    });

    this.closeModal('modalDiscount');
    this.showToast(`Discount code ${code} saved!`, 'success');
    this.renderDiscounts();
  },

  confirmDeleteDiscount(id) {
    if (confirm('Delete this promotional discount?')) {
      Store.deleteDiscount(id);
      this.showToast('Discount removed.', 'info');
      this.renderDiscounts();
    }
  },

  // 7. Manage Product Variants Modal
  openManageVariantsModal(productId) {
    const prod = Store.getProduct(productId);
    if (!prod) return;

    document.getElementById('variantModalProdId').value = prod.id;
    document.getElementById('variantModalTitle').textContent = `Manage Variants: ${prod.name}`;

    const container = document.getElementById('variantListContainer');
    const variants = prod.variants || [];

    if (variants.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted); font-size: 13px; padding: 12px 0;">No variants defined yet.</p>`;
    } else {
      container.innerHTML = `
        <table class="subflow-table" style="font-size: 13px;">
          <thead>
            <tr>
              <th>Variant Name</th>
              <th>Additional Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${variants.map(v => `
              <tr>
                <td><strong>${this.escapeHtml(v.name)}</strong></td>
                <td>+$${parseFloat(v.extraPrice || 0).toFixed(2)}</td>
                <td>
                  <button class="btn btn-sm btn-outline" style="color: var(--accent-danger);" onclick="App.deleteVariant('${prod.id}', '${v.id}')">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    this.openModal('modalVariants');
  },

  handleAddVariant(e) {
    e.preventDefault();
    const prodId = document.getElementById('variantModalProdId').value;
    const name = document.getElementById('newVariantName').value.trim();
    const extraPrice = parseFloat(document.getElementById('newVariantPrice').value) || 0;

    const prod = Store.getProduct(prodId);
    if (prod) {
      if (!prod.variants) prod.variants = [];
      prod.variants.push({
        id: 'VAR-' + String(Date.now()).slice(-4),
        name,
        extraPrice
      });
      Store.persist();
      this.showToast(`Variant "${name}" added!`, 'success');
      document.getElementById('newVariantName').value = '';
      document.getElementById('newVariantPrice').value = '0';
      this.openManageVariantsModal(prodId);
      this.renderProducts();
    }
  },

  deleteVariant(prodId, variantId) {
    const prod = Store.getProduct(prodId);
    if (prod && prod.variants) {
      prod.variants = prod.variants.filter(v => v.id !== variantId);
      Store.persist();
      this.showToast('Variant removed.', 'info');
      this.openManageVariantsModal(prodId);
      this.renderProducts();
    }
  },

  // 8. Preview Quotation Modal
  previewQuotationModal(qteId) {
    const qte = Store.getQuotation(qteId);
    if (!qte) return;

    const cust = Store.getCustomer(qte.customerId);
    const container = document.getElementById('quotationPreviewContent');

    container.innerHTML = `
      <div style="background-color: var(--bg-surface); padding: 24px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid var(--primary); padding-bottom: 14px;">
          <div>
            <h3 style="font-size: 20px; font-weight: 800; color: var(--primary);">PROPOSAL & QUOTATION</h3>
            <div style="font-size: 13px; color: var(--text-muted);">${this.escapeHtml(qte.templateName)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 700;">#${qte.id}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Valid Until: ${qte.validUntil}</div>
            <span class="badge ${qte.status === 'Confirmed' ? 'badge-active' : 'badge-draft'}" style="margin-top: 4px;">${qte.status}</span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); font-weight: 700;">Client:</div>
          <div style="font-size: 15px; font-weight: 700;">${cust ? this.escapeHtml(cust.name) : 'Valued Customer'}</div>
          <div style="font-size: 13px; color: var(--text-muted);">${cust ? this.escapeHtml(cust.email) : ''}</div>
        </div>

        <table class="subflow-table" style="margin-bottom: 18px;">
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(qte.items || []).map(item => `
              <tr>
                <td>${this.escapeHtml(item.description)}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">$${parseFloat(item.unitPrice).toFixed(2)}</td>
                <td style="text-align: right; font-weight: 600;">$${parseFloat(item.total).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; font-size: 13.5px;">
          <div><span style="color: var(--text-muted);">Subtotal:</span> $${parseFloat(qte.subtotal).toFixed(2)}</div>
          <div><span style="color: var(--text-muted);">Discount:</span> -$${parseFloat(qte.discountAmount || 0).toFixed(2)}</div>
          <div><span style="color: var(--text-muted);">Tax (${qte.taxRate || 10}%):</span> $${parseFloat(qte.taxAmount || 0).toFixed(2)}</div>
          <div style="font-size: 18px; font-weight: 800; color: var(--primary); border-top: 1px solid var(--border-color); padding-top: 6px;">
            Total: $${parseFloat(qte.totalAmount).toFixed(2)}
          </div>
        </div>
      </div>
    `;

    // Setup modal action button
    const actionBtn = document.getElementById('btnConfirmQuoteFromModal');
    if (actionBtn) {
      if (qte.status !== 'Confirmed') {
        actionBtn.style.display = 'inline-flex';
        actionBtn.onclick = () => {
          App.confirmQuotationAction(qte.id);
          App.closeModal('modalQuotationPreview');
        };
      } else {
        actionBtn.style.display = 'none';
      }
    }

    this.openModal('modalQuotationPreview');
  },

  // 9. Edit Subscription Modal
  openEditSubscriptionModal(subId) {
    const sub = Store.getSubscription(subId);
    if (!sub) return;

    document.getElementById('editSubIdHidden').value = sub.id;
    document.getElementById('editSubModalTitle').textContent = `Manage Subscription: ${sub.id}`;
    document.getElementById('editSubStatusSelect').value = sub.status;
    document.getElementById('editSubQty').value = sub.quantity;
    document.getElementById('editSubNotes').value = sub.notes || '';

    this.openModal('modalEditSubscription');
  },

  handleEditSubscriptionSubmit(e) {
    e.preventDefault();
    const subId = document.getElementById('editSubIdHidden').value;
    const newStatus = document.getElementById('editSubStatusSelect').value;
    const qty = parseInt(document.getElementById('editSubQty').value) || 1;
    const notes = document.getElementById('editSubNotes').value.trim();

    const sub = Store.getSubscription(subId);
    if (sub) {
      sub.status = newStatus;
      sub.quantity = qty;
      const subtotal = sub.unitPrice * qty;
      sub.taxAmount = subtotal * 0.10;
      sub.totalAmount = subtotal + sub.taxAmount;
      sub.notes = notes;
      Store.persist();
      this.closeModal('modalEditSubscription');
      this.showToast(`Subscription ${subId} updated!`, 'success');
      this.renderSubscriptions();
      this.renderDashboard();
    }
  },

  // -------------------------------------------------------------
  // GLOBAL SEARCH & MOBILE DRAWER
  // -------------------------------------------------------------
  handleGlobalSearch(query) {
    if (!query) return;
    const q = query.toLowerCase();

    // Check if query matches customers
    const cust = Store.getCustomers().find(c => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
    if (cust) {
      this.navigate('customers');
      this.renderCustomers(q);
      return;
    }

    // Check if query matches invoices
    const inv = Store.getInvoices().find(i => i.invoiceNumber.toLowerCase().includes(q));
    if (inv) {
      this.navigate('invoices');
      return;
    }

    // Default to subscriptions
    this.navigate('subscriptions');
  },

  toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (sidebar) sidebar.classList.toggle('mobile-open');
    if (backdrop) backdrop.classList.toggle('active');
  },

  closeMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.querySelector('.sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  },

  toggleNotificationTray() {
    const tray = document.getElementById('notificationTray');
    if (tray) tray.classList.toggle('active');
  },

  resetDemoState() {
    if (confirm('Reset all demo data back to clean initial factory state?')) {
      Store.resetToDemo();
      this.showToast('Demo data restored to initial state!', 'success');
      this.updateUserSessionUI();
      this.renderView(this.currentView);
    }
  },

  // -------------------------------------------------------------
  // UTILITIES & NOTIFICATIONS
  // -------------------------------------------------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-weight: 700;">${type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ')}</span>
      <span>${this.escapeHtml(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  bindEvents() {
    // Hash change routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && hash !== this.currentView) {
        this.navigate(hash);
      }
    });

    // Close notifications tray on document click
    document.addEventListener('click', (e) => {
      const tray = document.getElementById('notificationTray');
      const btn = document.getElementById('notificationBtn');
      if (tray && btn && !tray.contains(e.target) && !btn.contains(e.target)) {
        tray.classList.remove('active');
      }
    });
  }
};

// Initialize App when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});

if (typeof window !== 'undefined') {
  window.App = App;
}
