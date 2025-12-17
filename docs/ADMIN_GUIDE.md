# AbacusX Admin Training Guide

## "Set Display Amount" Feature
This feature allows administrators to manually set a balance displayed on a user's dashboard. This is a sensitive action and is strictly audited.

### Usage Scenarios
1. **Cosmetic (Promo)**: To show a "Bonus" or "Credit" that cannot be withdrawn immediately but motivates the user.
   - Select Type: **Cosmetic**
   - Result: User sees a banner "Promotional Credit". The Ledger is NOT affected.
2. **Ledger Adjustment (Correction)**: To fix a balance issue or manually credit a deposit.
   - Select Type: **Ledger Adjustment**
   - Result: Creates a transaction record and updates the user's real withdrawable balance.
   - **Requirement**: This action triggers a 2FA prompt and sends a notification to the Compliance team.

### Safety Checks
- **Audit Trail**: Every change is logged in `audit_logs` with your IP and ID.
- **Reason Field**: You MUST provide a clear reason (e.g., Ticket ID #1234).
- **Visibility**: You can toggle `Visible` to `False` to shadow-ban or internally track an adjustment before revealing it.

## User Freeze
In case of suspicious activity, use the "Freeze Account" button on the user detail page. This stops all withdrawals and trading immediately.
