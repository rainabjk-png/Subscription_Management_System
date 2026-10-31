/**
 * SubFlow - Store Module
 * Manages reactive browser-side state using LocalStorage with pure vanilla JavaScript.
 * Enables full create, read, update, delete operations and state persistence across page refreshes.
 */

const STORAGE_KEY = 'SUBFLOW_APP_DATA_V1';

const Store = {
  data: null,

  init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.data = JSON.parse(stored);
      } else {
        this.resetToDemo();
      }
    } catch (e) {
      console.warn('LocalStorage error, falling back to initial data', e);
      this.data = JSON.parse(JSON.stringify(window.INITIAL_DATA || {}));
    }
    return this.data;
  },

  persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to persist state to LocalStorage', e);
    }
  },

  resetToDemo() {
    this.data = JSON.parse(JSON.stringify(window.INITIAL_DATA || {}));
    this.persist();
    return this.data;
  },

  // -------------------------------------------------------------
  // Current User & Session Handling
  // -------------------------------------------------------------
  getCurrentUser() {
    return this.data.currentUser || {
      id: 'USR-001',
      name: 'System Administrator',
      email: 'admin@subflow.io',
      role: 'ADMIN',
      customerId: null
    };
  },

  setCurrentUser(user) {
    this.data.currentUser = user;
    this.persist();
  },

  switchRole(role) {
    const roleUpper = role.toUpperCase();
    if (roleUpper === 'CUSTOMER') {
      const cust = this.data.customers[0];
      this.data.currentUser = {
        id: 'USR-003',
        name: cust ? cust.name : 'Customer User',
        email: cust ? cust.email : 'customer@cloudscale.io',
        role: 'CUSTOMER',
        customerId: cust ? cust.id : 'CUST-001'
      };
    } else if (roleUpper === 'STAFF') {
      this.data.currentUser = {
        id: 'USR-002',
        name: 'Operations Staff',
        email: 'staff@subflow.io',
        role: 'STAFF',
        customerId: null
      };
    } else {
      this.data.currentUser = {
        id: 'USR-001',
        name: 'System Administrator',
        email: 'admin@subflow.io',
        role: 'ADMIN',
        customerId: null
      };
    }
    this.persist();
    return this.data.currentUser;
  },

  // -------------------------------------------------------------
  // Dashboard Analytics & Metrics
  // -------------------------------------------------------------
  getDashboardStats() {
    const customers = this.data.customers || [];
    const subscriptions = this.data.subscriptions || [];
    const invoices = this.data.invoices || [];
    const payments = this.data.payments || [];

    const totalCustomers = customers.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;

    // Revenue received is sum of all successful payments
    const revenueReceived = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    // Outstanding invoices (status Confirmed or Overdue)
    const outstandingInvoices = invoices.filter(i => i.status === 'Confirmed' || i.status === 'Overdue');
    const outstandingTotal = outstandingInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceDue) || 0), 0);

    // Overdue invoices
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const overdueTotal = overdueInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceDue) || 0), 0);

    return {
      totalCustomers,
      activeSubscriptions,
      totalSubscriptions: subscriptions.length,
      revenueReceived,
      outstandingTotal,
      outstandingCount: outstandingInvoices.length,
      overdueTotal,
      overdueCount: overdueInvoices.length
    };
  },

  // -------------------------------------------------------------
  // Products & Variants CRUD
  // -------------------------------------------------------------
  getProducts() {
    return this.data.products || [];
  },

  getProduct(id) {
    return this.getProducts().find(p => p.id === id);
  },

  saveProduct(product) {
    if (!product.id) {
      product.id = 'PRD-' + String(Date.now()).slice(-4);
      if (!product.variants) product.variants = [];
      this.data.products.unshift(product);
      this.addActivity('Product Created', `Added new product ${product.name}`, 'product');
    } else {
      const idx = this.data.products.findIndex(p => p.id === product.id);
      if (idx !== -1) {
        this.data.products[idx] = { ...this.data.products[idx], ...product };
        this.addActivity('Product Updated', `Modified product ${product.name}`, 'product');
      }
    }
    this.persist();
    return product;
  },

  deleteProduct(id) {
    const prod = this.getProduct(id);
    this.data.products = this.data.products.filter(p => p.id !== id);
    // Also remove associated plans
    this.data.plans = this.data.plans.filter(pl => pl.productId !== id);
    if (prod) {
      this.addActivity('Product Removed', `Deleted product ${prod.name}`, 'product');
    }
    this.persist();
  },

  // -------------------------------------------------------------
  // Subscription Plans CRUD
  // -------------------------------------------------------------
  getPlans() {
    return this.data.plans || [];
  },

  getPlan(id) {
    return this.getPlans().find(p => p.id === id);
  },

  savePlan(plan) {
    if (!plan.id) {
      plan.id = 'PLN-' + String(Date.now()).slice(-4);
      if (!plan.features) plan.features = [];
      this.data.plans.unshift(plan);
      this.addActivity('Plan Created', `New subscription plan ${plan.name} created`, 'plan');
    } else {
      const idx = this.data.plans.findIndex(p => p.id === plan.id);
      if (idx !== -1) {
        this.data.plans[idx] = { ...this.data.plans[idx], ...plan };
        this.addActivity('Plan Updated', `Plan ${plan.name} updated`, 'plan');
      }
    }
    this.persist();
    return plan;
  },

  deletePlan(id) {
    const plan = this.getPlan(id);
    this.data.plans = this.data.plans.filter(p => p.id !== id);
    if (plan) {
      this.addActivity('Plan Removed', `Deleted plan ${plan.name}`, 'plan');
    }
    this.persist();
  },

  // -------------------------------------------------------------
  // Customers Directory CRUD
  // -------------------------------------------------------------
  getCustomers() {
    return this.data.customers || [];
  },

  getCustomer(id) {
    return this.getCustomers().find(c => c.id === id);
  },

  saveCustomer(customer) {
    if (!customer.id) {
      customer.id = 'CUST-' + String(Date.now()).slice(-3);
      customer.joinedDate = new Date().toISOString().split('T')[0];
      this.data.customers.unshift(customer);
      this.addActivity('Customer Registered', `Added customer account for ${customer.name}`, 'customer');
    } else {
      const idx = this.data.customers.findIndex(c => c.id === customer.id);
      if (idx !== -1) {
        this.data.customers[idx] = { ...this.data.customers[idx], ...customer };
        this.addActivity('Customer Updated', `Profile updated for ${customer.name}`, 'customer');
      }
    }
    this.persist();
    return customer;
  },

  deleteCustomer(id) {
    const cust = this.getCustomer(id);
    this.data.customers = this.data.customers.filter(c => c.id !== id);
    if (cust) {
      this.addActivity('Customer Removed', `Deleted account for ${cust.name}`, 'customer');
    }
    this.persist();
  },

  // -------------------------------------------------------------
  // Subscriptions Lifecycle Management
  // Draft -> Quotation -> Confirmed -> Active -> Closed
  // -------------------------------------------------------------
  getSubscriptions() {
    return this.data.subscriptions || [];
  },

  getSubscription(id) {
    return this.getSubscriptions().find(s => s.id === id);
  },

  saveSubscription(sub) {
    if (!sub.id) {
      sub.id = 'SUB-2026-' + String(Math.floor(100 + Math.random() * 900));
      if (!sub.status) sub.status = 'Draft';
      this.data.subscriptions.unshift(sub);
      this.addActivity('Subscription Created', `Created subscription ${sub.id}`, 'subscription');
    } else {
      const idx = this.data.subscriptions.findIndex(s => s.id === sub.id);
      if (idx !== -1) {
        this.data.subscriptions[idx] = { ...this.data.subscriptions[idx], ...sub };
        this.addActivity('Subscription Updated', `Updated subscription ${sub.id}`, 'subscription');
      }
    }
    this.persist();
    return sub;
  },

  updateSubscriptionStatus(id, newStatus) {
    const sub = this.getSubscription(id);
    if (sub) {
      const prevStatus = sub.status;
      sub.status = newStatus;

      // If transitioning to Active, ensure nextBillingDate is set
      if (newStatus === 'Active' && !sub.nextBillingDate) {
        const next = new Date();
        next.setMonth(next.getMonth() + 1);
        sub.nextBillingDate = next.toISOString().split('T')[0];
      }

      this.addActivity('Subscription Transition', `${id} changed from ${prevStatus} to ${newStatus}`, 'subscription');
      this.persist();
      return sub;
    }
    return null;
  },

  // -------------------------------------------------------------
  // Quotations
  // -------------------------------------------------------------
  getQuotations() {
    return this.data.quotations || [];
  },

  getQuotation(id) {
    return this.getQuotations().find(q => q.id === id);
  },

  saveQuotation(quote) {
    if (!quote.id) {
      quote.id = 'QTE-2026-' + String(Math.floor(10 + Math.random() * 90));
      quote.status = quote.status || 'Open';
      this.data.quotations.unshift(quote);
      this.addActivity('Quotation Generated', `Issued proposal ${quote.id}`, 'quotation');
    } else {
      const idx = this.data.quotations.findIndex(q => q.id === quote.id);
      if (idx !== -1) {
        this.data.quotations[idx] = { ...this.data.quotations[idx], ...quote };
      }
    }
    this.persist();
    return quote;
  },

  confirmQuotation(id) {
    const qte = this.getQuotation(id);
    if (qte) {
      qte.status = 'Confirmed';
      // Automatically generate a confirmed subscription from this quotation!
      const defaultPlan = this.getPlans()[0];
      const newSub = {
        customerId: qte.customerId,
        planId: defaultPlan ? defaultPlan.id : 'PLN-001',
        status: 'Confirmed',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        nextBillingDate: new Date().toISOString().split('T')[0],
        billingInterval: 'Monthly',
        paymentTerms: 'Immediate',
        quantity: 1,
        unitPrice: qte.subtotal,
        taxRate: qte.taxRate || 10,
        taxAmount: qte.taxAmount || 0,
        totalAmount: qte.totalAmount,
        notes: `Generated from Quotation ${qte.id}`
      };
      this.saveSubscription(newSub);
      this.addActivity('Quotation Approved', `Quotation ${id} confirmed and converted to subscription ${newSub.id}`, 'quotation');
      this.persist();
      return { quotation: qte, subscription: newSub };
    }
    return null;
  },

  // -------------------------------------------------------------
  // Invoices Management
  // -------------------------------------------------------------
  getInvoices() {
    return this.data.invoices || [];
  },

  getInvoice(id) {
    return this.getInvoices().find(i => i.id === id || i.invoiceNumber === id);
  },

  saveInvoice(inv) {
    if (!inv.id) {
      const num = 'INV-2026-' + String(Math.floor(200 + Math.random() * 800));
      inv.id = num;
      inv.invoiceNumber = num;
      inv.amountPaid = inv.amountPaid || 0;
      inv.balanceDue = inv.totalAmount - inv.amountPaid;
      inv.status = inv.status || 'Draft';
      this.data.invoices.unshift(inv);
      this.addActivity('Invoice Issued', `Generated invoice ${inv.invoiceNumber}`, 'invoice');
    } else {
      const idx = this.data.invoices.findIndex(i => i.id === inv.id);
      if (idx !== -1) {
        inv.balanceDue = inv.totalAmount - (inv.amountPaid || 0);
        this.data.invoices[idx] = { ...this.data.invoices[idx], ...inv };
      }
    }
    this.persist();
    return inv;
  },

  updateInvoiceStatus(id, newStatus) {
    const inv = this.getInvoice(id);
    if (inv) {
      inv.status = newStatus;
      if (newStatus === 'Paid') {
        inv.amountPaid = inv.totalAmount;
        inv.balanceDue = 0;
      }
      this.addActivity('Invoice Status', `Invoice ${inv.invoiceNumber} status marked as ${newStatus}`, 'invoice');
      this.persist();
      return inv;
    }
    return null;
  },

  // -------------------------------------------------------------
  // Payments Handling
  // -------------------------------------------------------------
  getPayments() {
    return this.data.payments || [];
  },

  recordPayment(payment) {
    payment.id = 'PAY-2026-' + String(Math.floor(100 + Math.random() * 900));
    payment.date = payment.date || new Date().toISOString().split('T')[0];
    payment.amount = parseFloat(payment.amount) || 0;
    
    // Update linked invoice
    const inv = this.getInvoice(payment.invoiceId);
    if (inv) {
      payment.customerId = inv.customerId;
      inv.amountPaid = (inv.amountPaid || 0) + payment.amount;
      inv.balanceDue = Math.max(0, inv.totalAmount - inv.amountPaid);
      if (inv.balanceDue === 0) {
        inv.status = 'Paid';
      }
    }

    this.data.payments.unshift(payment);
    this.addActivity('Payment Recorded', `Payment of $${payment.amount.toFixed(2)} received for ${payment.invoiceId}`, 'payment');
    this.persist();
    return payment;
  },

  // -------------------------------------------------------------
  // Discounts & Promotional Coupons (Admin Only)
  // -------------------------------------------------------------
  getDiscounts() {
    return this.data.discounts || [];
  },

  getDiscount(id) {
    return this.getDiscounts().find(d => d.id === id || d.code.toUpperCase() === id.toUpperCase());
  },

  saveDiscount(discount) {
    if (!discount.id) {
      discount.id = 'DISC-' + String(Math.floor(100 + Math.random() * 900));
      discount.code = discount.code.trim().toUpperCase();
      discount.usageCount = 0;
      discount.status = 'Active';
      this.data.discounts.unshift(discount);
      this.addActivity('Discount Created', `Coupon code ${discount.code} created`, 'discount');
    } else {
      const idx = this.data.discounts.findIndex(d => d.id === discount.id);
      if (idx !== -1) {
        this.data.discounts[idx] = { ...this.data.discounts[idx], ...discount };
      }
    }
    this.persist();
    return discount;
  },

  deleteDiscount(id) {
    const disc = this.getDiscount(id);
    this.data.discounts = this.data.discounts.filter(d => d.id !== id);
    if (disc) {
      this.addActivity('Discount Deleted', `Coupon ${disc.code} removed`, 'discount');
    }
    this.persist();
  },

  validateDiscountCode(code, purchaseAmount) {
    const disc = this.data.discounts.find(d => d.code.toUpperCase() === code.trim().toUpperCase());
    if (!disc) {
      return { valid: false, message: 'Invalid discount coupon code.' };
    }
    if (disc.status !== 'Active') {
      return { valid: false, message: `Coupon is ${disc.status.toLowerCase()}.` };
    }
    const today = new Date().toISOString().split('T')[0];
    if (disc.endDate && disc.endDate < today) {
      disc.status = 'Expired';
      this.persist();
      return { valid: false, message: 'This discount code has expired.' };
    }
    if (disc.maxUsage && disc.usageCount >= disc.maxUsage) {
      disc.status = 'Exhausted';
      this.persist();
      return { valid: false, message: 'Maximum usage limit reached for this coupon.' };
    }
    if (purchaseAmount < (disc.minPurchase || 0)) {
      return { valid: false, message: `Minimum purchase threshold is $${disc.minPurchase.toFixed(2)}.` };
    }

    let discountDeduction = 0;
    if (disc.type === 'Percentage') {
      discountDeduction = (purchaseAmount * disc.value) / 100;
    } else {
      discountDeduction = Math.min(purchaseAmount, disc.value);
    }

    return {
      valid: true,
      discount: disc,
      deduction: discountDeduction,
      message: `Coupon applied: saved $${discountDeduction.toFixed(2)}!`
    };
  },

  // -------------------------------------------------------------
  // Activity Logging
  // -------------------------------------------------------------
  getActivities() {
    return this.data.activities || [];
  },

  addActivity(title, description, type = 'info') {
    if (!this.data.activities) this.data.activities = [];
    this.data.activities.unshift({
      id: 'ACT-' + Date.now(),
      title,
      description,
      time: 'Just now',
      type
    });
    if (this.data.activities.length > 25) {
      this.data.activities.pop();
    }
    this.persist();
  }
};

// Auto-initialize Store
if (typeof window !== 'undefined') {
  window.Store = Store;
  Store.init();
}
