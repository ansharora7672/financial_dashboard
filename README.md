# Circuit Labs Finance Dashboard

A full-stack financial dashboard built with Next.js, React, and TypeScript. Aggregates transaction data from three banks (Chase, BoA, Amex) into a unified view with role-based access control, multi-currency support, and financial analytics.

---

## Getting Started

```bash
cd project
npm install
npm run dev
```

App runs at `http://localhost:3000`. You will be redirected to `/login` automatically.

---

## Test Credentials

| Name | Email | Password | Role | Access |
|---|---|---|---|---|
| Alex Rivera | alex.rivera@circuitlabs.io | CircuitAdmin2025! | admin | Transactions, Stats, Workspace |
| Priya Shah | priya.shah@circuitlabs.io | CircuitFinance2025! | finance_lead | Transactions, Stats, Workspace |
| Marcus Chen | marcus.chen@circuitlabs.io | CircuitAnalyst2025! | analyst | Stats only |
| Jordan Lee | jordan.lee@circuitlabs.io | CircuitViewer2025! | viewer | Transactions only |

---

## Project Structure

```
src/
├── app/
│   ├── login/                  # Login page
│   ├── dashboard/
│   │   ├── layout.tsx          # Auth guard + RBAC + sidebar
│   │   ├── transactions/       # Transactions tab
│   │   ├── stats/              # Stats tab
│   │   └── custom/             # Workspace tab (admin + finance_lead only)
│   └── api/
│       ├── auth/login/         # POST /api/auth/login
│       ├── banks/              # Raw bank routes (chase, boa, amex)
│       └── transactions/       # Normalized endpoint + [id] detail
├── components/
│   ├── Charts/                 # One file per chart component
│   ├── TransactionsTable.tsx
│   ├── TransactionModal.tsx
│   ├── FilterBar.tsx
│   └── StatKPICard.tsx
└── lib/
    ├── normalize.ts            # Maps all 3 banks into one model
    ├── currency.ts             # Conversion logic using rates.json
    ├── auth.ts                 # localStorage helpers
    └── rbac.ts                 # Tab access checks
```

---

## Architecture

### Data Normalization

Each bank returns a completely different shape. Chase uses `initiatedBy`, BoA uses `originator`, Amex uses `employee` for the same concept. I created `normalizeTransactions()` in `src/lib/normalize.ts` which maps all three into one consistent `NormalizedTransaction` model before any API route or UI component touches the data. This means the rest of the app only ever deals with one shape regardless of which bank the transaction came from.

### Auth and RBAC

Auth is handled via localStorage as specified. On login, the API validates credentials against `user.json` and returns the user object without the password. The client stores `id`, `name`, `role`, and `allowedTabs`. The dashboard layout checks this on every route change and redirects to `/login` if no session exists. Tab access is enforced via `canAccess()` in `src/lib/rbac.ts` which checks whether the current tab is in the user's `allowedTabs`. The access check runs before any state is set to prevent a flash of unauthorized content.

### Multi-Currency

All transactions preserve their original currency in the normalized model. The `src/lib/currency.ts` utility converts amounts to USD using static rates from `data/rates.json` when doing cross-bank math (KPI totals, chart data, vendor rankings). The transactions table has a currency switcher that converts amounts on the fly using the same utility.

### Stats Computations

All stats are computed client-side from the full transaction dataset fetched via SWR. The bank balance chart shows cumulative net cash flow per bank, starting from the first transaction in the data. Since the source JSON files do not include a historical opening balance, the chart starts at zero and accumulates credits minus debits month by month.

---

## Libraries Used

| Library | Why |
|---|---|
| SWR | Client-side data fetching with caching and revalidation |
| Recharts | Line chart and bar chart for the Stats tab |
| Lucide React | Icons used across the sidebar and UI |

---

## Tradeoffs

- **No database.** All data is read from JSON files at request time. Works fine for this dataset, would not scale to production.
- **localStorage auth.** Matches the spec. Not suitable for production (no expiry, no secure HttpOnly cookies, no JWT).
- **Static exchange rates.** Used `data/rates.json` directly as instructed. No live API calls.
- **Client-side stats aggregation.** All KPI and chart data is computed in the browser. For large transaction volumes this would need to move server-side.
- **Bank balance starts at zero.** No opening balance is available in the source data, so the chart reflects net cash flow from the first transaction rather than absolute account balance.

---

## What I Built

- Login page with form validation and credential check against `user.json`
- Role-based tab visibility and access control enforced at the layout level
- 5 API routes including the normalized `/api/transactions` endpoint with `bank`, `authorizedBy`, `amount`, and `fromDate` filters
- Transactions tab with filters, currency switcher, CSV export, detail modal, and authorized-by tooltip
- Stats tab with 3 KPI cards (cash in, cash out, net cash flow), bank balance line chart with date range picker, money in vs out stacked bar chart, spend by category breakdown, top vendors table, and top spender bar
- Workspace tab (admin and finance_lead only) showing a team spend report ranking each employee by total authorized spend

---

## What I Skipped

Nothing required was skipped. The Workspace tab is a bonus requirement and is fully implemented.

---

## AI Tools

I used Claude Code to help write Tailwind CSS styling throughout the project. The application logic, data normalization approach, API design, RBAC structure, component architecture, and all design decisions are entirely my own. These are not production-ready setups but they are intentional choices that fit the scope and requirements of this assessment.
