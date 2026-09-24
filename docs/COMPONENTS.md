# Clean UAE (تنظيف الفخامة) — Components Reference

## Component Breakdown

1. `navbar.js`: Renders brand logo, navigation links, active emirate selector (Ajman default), toll-free helpline button, booking CTA, and customer portal login button.
2. `footer.js`: Renders company branding, service catalog links, Ajman coverage list, headquarters address, and copyright.
3. `bookingModal.js`: 5-Step interactive wizard:
   - Step 1: Service type & size.
   - Step 2: Location details in Ajman.
   - Step 3: Available time slot calculation with 10-minute hold countdown timer.
   - Step 4: Payment method (Pay Online vs Pay Cash After Service).
   - Step 5: Confirmation receipt & reference generation (e.g., `CUAE-8492`).
4. `publicPages.js`: Handles Home landing page, Services catalog, Packages & Contracts matrix, Offers & Promo codes, Areas We Serve map, About Us, Reviews, and Contact page.
5. `customerPortal.js`: Customer dashboard, live booking status progress tracker, active contracts, referral wallet (`CUAE-SARA88`), customer care reschedule guidance modal, and 14-working-day refund tracker.
6. `staffPortal.js`: Mobile-first field app for cleaners featuring GPS clock-in/out, 8-stage task workflow, before & after photo upload manager with stain logging, delay alerts, and chemical allowance log.
7. `dispatcherPortal.js`: Dispatch timeline matrix, staff schedule rows, job cards, and unassigned booking queue.
8. `adminPortal.js`: Executive KPIs, Location Expansion manager (Ajman, Dubai, Abu Dhabi, Sharjah, etc.), chemical inventory low-stock alerts, complaint SLA desk (**Open → Under Review → Scheduled → Resolved → Closed**), staff leave approvals, theme customizer preview, and demo data reset control.
9. `financePortal.js`: Cash collection handovers, manager cash deposit reconciliation, and 5% UAE VAT accounting.
10. `modalManager.js`: Universal modal launcher, OTP login simulator, and customer care reschedule dialog.
11. `notifications.js`: Toast notification system for user feedback and delay warnings.
