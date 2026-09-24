/**
 * Clean UAE | تنظيف الفخامة — Finance & Cash Reconciliation Portal
 * Manages staff cash collection handovers, manager reconciliation, 5% UAE VAT accounting, and demo financial ledgers.
 */

window.CLEAN_UAE_FINANCE_PORTAL = {
  render: function(root) {
    var store = window.CLEAN_UAE_STORE.get();
    var cashCollections = store.cashCollections || [];
    var bookings = store.bookings || [];

    var totalCashCollected = cashCollections.reduce((acc, c) => acc + (parseFloat(c.amountCollected) || 0), 0);
    var totalOnlinePaid = bookings.filter(b => b.paymentStatus === 'paid').reduce((acc, b) => acc + (parseFloat(b.totalAmount) || 0), 0);

    root.innerHTML = `
      <div class="container" style="padding: 24px 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
          <div>
            <h2 style="font-size:1.8rem; font-weight:800;">Finance & Cash Reconciliation</h2>
            <p style="color:var(--text-muted);">Track cash collected by cleaners, office cash handovers, and 5% UAE VAT accounting.</p>
          </div>
        </div>

        <div class="grid grid-3" style="margin-bottom:24px;">
          <div class="card" style="border-inline-start:4px solid var(--secondary);">
            <div style="font-size:0.8rem; color:var(--text-muted);">CASH COLLECTED BY CLEANERS</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--secondary);">AED ${totalCashCollected.toFixed(2)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Pay After Service Handover Queue</div>
          </div>
          <div class="card" style="border-inline-start:4px solid var(--primary);">
            <div style="font-size:0.8rem; color:var(--text-muted);">ONLINE GATEWAY PAYMENTS</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--primary);">AED ${totalOnlinePaid.toFixed(2)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Cards & Digital Wallets</div>
          </div>
          <div class="card" style="border-inline-start:4px solid var(--accent);">
            <div style="font-size:0.8rem; color:var(--text-muted);">TOTAL UAE VAT ACCOUNTED (5%)</div>
            <div style="font-size:1.8rem; font-weight:800; color:var(--accent);">AED ${((totalCashCollected + totalOnlinePaid) * 0.05).toFixed(2)}</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">Configurable VAT Setting</div>
          </div>
        </div>

        <div class="card">
          <h3 style="font-weight:700; margin-bottom:16px;">Cash Collection & Office Handover Queue</h3>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Collection ID</th>
                  <th>Booking Ref</th>
                  <th>Collector (Staff)</th>
                  <th>Amount Collected</th>
                  <th>Timestamp</th>
                  <th>Receipt Ref</th>
                  <th>Handover Status</th>
                  <th>Manager Action</th>
                </tr>
              </thead>
              <tbody>
                ${cashCollections.map(c => `
                  <tr>
                    <td style="font-weight:700;">${c.id}</td>
                    <td>${c.bookingId}</td>
                    <td>${c.collectorName}</td>
                    <td><strong style="color:var(--secondary);">AED ${c.amountCollected}</strong></td>
                    <td>${c.collectedAt}</td>
                    <td>${c.receiptRef}</td>
                    <td>${window.CLEAN_UAE_COMMON.renderBadge(c.status)}</td>
                    <td>
                      ${c.status === 'pending_handover' ? `
                        <button onclick="CLEAN_UAE_FINANCE_PORTAL.reconcileCash('${c.id}')" class="btn btn-accent btn-sm">Confirm Cash Handover</button>
                      ` : `
                        <span style="font-size:0.8rem; color:var(--accent); font-weight:bold;"><i class="ri-checkbox-circle-fill"></i> Reconciled</span>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  },

  reconcileCash: function(id) {
    var collections = window.CLEAN_UAE_STORE.get('cashCollections') || [];
    var found = collections.find(c => c.id === id);
    if (found) {
      found.status = 'reconciled';
      window.CLEAN_UAE_STORE.update('cashCollections', collections);
      window.CLEAN_UAE_NOTIFICATIONS.show('Cash collection ' + id + ' successfully reconciled and deposited to office ledger!', 'success');
      this.render(document.getElementById('app-root'));
    }
  }
};
