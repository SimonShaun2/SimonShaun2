# TrayLoop Launch Checklist

## Pre-Launch Verification

### 1. API Health
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Services reported: stripe, email status
- [ ] No startup errors in logs

### 2. Storefront
- [ ] `GET /api/storefront/trayloop-catering` returns full JSON
- [ ] Storefront page loads at `/trayloop-catering`
- [ ] Menu renders: categories, packages, add-ons
- [ ] Headcount selector works
- [ ] Package selection toggles correctly
- [ ] Add-on selection works
- [ ] Estimated total updates live
- [ ] Service type toggle (delivery/pickup) works
- [ ] Delivery address fields appear when delivery selected

### 3. Order Submission
- [ ] Fill out complete order form
- [ ] Submit order → green confirmation appears
- [ ] Order number displayed (TL-XXXXXX)
- [ ] "What happens next?" section visible
- [ ] No duplicate orders on double-click (idempotency)

### 4. Merchant Login
- [ ] `/login` page loads
- [ ] Login with valid credentials succeeds
- [ ] Login redirects to dashboard
- [ ] Invalid credentials show error
- [ ] Logout clears session

### 5. Dashboard
- [ ] KPI cards load (Needs Action, Upcoming, Revenue)
- [ ] Order list renders with correct data
- [ ] Status filters work (All, New, Confirmed, etc.)
- [ ] Pagination works if >20 orders

### 6. Order Detail
- [ ] Click order → detail page loads
- [ ] Customer info, event details, pricing visible
- [ ] Status badge correct
- [ ] Action buttons match allowed transitions
- [ ] Timeline/activity section renders

### 7. Order Status Flow
- [ ] New → Awaiting Deposit (send deposit link)
- [ ] New → Confirmed (when deposit not required)
- [ ] Awaiting Deposit → Confirmed (mark paid)
- [ ] Confirmed → Completed (mark complete)
- [ ] Any active → Cancelled (with reason)
- [ ] Cancel reason appears in notes

### 8. Deposit/Payment Flow
- [ ] "Send Deposit Link" creates deposit record
- [ ] Stripe Checkout URL returned (if Stripe configured)
- [ ] Fallback URL returned (if Stripe not configured)
- [ ] "Mark Deposit Paid" transitions to confirmed
- [ ] Payment status card shows correct state
- [ ] Deposit badge on order list card

### 9. Refund Flow
- [ ] "Refund Deposit" button visible on paid deposits
- [ ] Confirmation prompt appears
- [ ] Refund processes (Stripe or local)
- [ ] Order transitions to cancelled
- [ ] Timeline shows refund events
- [ ] No double-refund on repeat click

### 10. Reorder
- [ ] "Reorder" button on order detail
- [ ] Prompts for new event date
- [ ] Creates new order with copied items
- [ ] Warnings shown for unavailable items
- [ ] Link to new order in success banner

### 11. Follow-Ups
- [ ] Follow-ups page loads
- [ ] Filter pills work
- [ ] Complete/Reopen toggle works
- [ ] View Order link navigates correctly
- [ ] Overdue items highlighted

### 12. Customers
- [ ] Customer list loads
- [ ] Search filters by name/email/company
- [ ] Click row → detail panel opens
- [ ] Order count and spend correct
- [ ] Recent orders listed

### 13. Menu/Catalog
- [ ] Menu page loads
- [ ] Catalogs, categories, packages displayed
- [ ] Add-ons displayed
- [ ] Pricing correct

### 14. Settings
- [ ] Settings page loads without error
- [ ] Payment Setup card shows correct state
- [ ] "Set Up Payments" CTA works (if Stripe configured)

### 15. Notifications
- [ ] Bell icon in nav
- [ ] Click opens dropdown
- [ ] Notifications listed (if any exist)
- [ ] Empty state shows "All caught up"
- [ ] Click notification → marks read + navigates

### 16. Email (if configured)
- [ ] Deposit payment triggers customer email
- [ ] Refund triggers customer email
- [ ] Email has branded template
- [ ] CTA button links to order

## Edge Case Verification

- [ ] Submit order with past event date → error message
- [ ] Submit order with headcount below package minimum → error
- [ ] Submit order with no packages selected → button disabled
- [ ] Submit order with delivery but no address → validation error
- [ ] Duplicate package selection rejected
- [ ] Expired deposit link → deposit marked refunded
- [ ] Webhook replay → no duplicate state changes
- [ ] Terminal order status (completed/cancelled) → no further transitions allowed

## Post-Launch Monitoring

- [ ] Check API logs for errors (first 24h)
- [ ] Verify webhook delivery in Stripe dashboard
- [ ] Confirm email delivery (if configured)
- [ ] Monitor order creation rate
- [ ] Check for any 500 errors in request logs
