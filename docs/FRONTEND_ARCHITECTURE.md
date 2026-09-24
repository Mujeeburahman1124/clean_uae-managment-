# Clean UAE (تنظيف الفخامة) — Frontend Architecture Documentation

## Overview

Clean UAE is a modular, high-performance, bilingual (English LTR & Arabic RTL) frontend single-page application (SPA) designed to simulate the enterprise cleaning operations in Ajman with scalable expansion across all UAE emirates.

## Core Architecture & State Management

1. **Modular Vanilla JS Structure**:
   - `index.html`: Base application frame, demo toolbar, notification root, modal root.
   - `index.css`: Centralized CSS custom properties, responsive grid, light/dark themes, RTL overrides.
   - `js/store.js`: Custom reactive central store with pub/sub listener model and auto-persistence to `localStorage`.
   - `js/services/api.js`: RESTful API abstraction proxy layer (`get`, `post`, `put`, `delete`) designed for 1-to-1 future replacement with PHP 8+ endpoints.
   - `js/services/storage.js`: Robust `localStorage` wrapper with namespace `cleanUAE_` and JSON corruption safeguards.
   - `js/i18n.js`: Central dictionary for English and Arabic text strings with layout-level RTL flipping.

2. **Role-Based Perspectives**:
   - **Public Website & Booking**: 5-step booking engine with 10-minute hold countdown timer, card/cash payment options, and VAT calculation.
   - **Customer Portal**: Booking visual progress tracker, active contracts, referral wallet, and 14-working-day refund tracker.
   - **Staff Field App**: Geotagged clock-in/out, 8-stage task workflow, mobile before/after photo capture/upload, delay reporting, chemical logger.
   - **Dispatcher Portal**: Daily/weekly dispatch schedule matrix and re-assignment queue.
   - **Finance Portal**: Staff cash collection handovers, manager reconciliation, and 5% UAE VAT ledgers.
   - **Admin / Owner Control Center**: Dynamic location expansion (Ajman to all UAE emirates), staff leave approvals, chemical inventory controls, complaint SLA desk (**Open → Under Review → Scheduled → Resolved → Closed**), theme customizer preview, and demo state reset.
