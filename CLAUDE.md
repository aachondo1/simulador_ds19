# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start dev server (http://localhost:5173)
npm run build      # type-check + production build
npm run lint       # run ESLint
npm run preview    # preview production build locally
```

There is no test suite.

## Architecture

Single-page React 18 + TypeScript app bundled with Vite. All state lives in `App.tsx` via `useState`—no external state manager.

**Data flow:**
1. `App.tsx` fetches the current UF value on mount via `ufService.ts` (cached in `localStorage` per day, falls back to 39.500 CLP).
2. `MortgageForm` collects `MortgageInputs` and calls `onSubmit`.
3. `App.tsx` runs `simulateMortgage(inputs, ufValue)` from `mortgageCalculator.ts` and stores the `SimulationResult` in state.
4. `SimulationResults`, `PaymentChart`, `Glossary`, and `Disclaimer` are purely presentational.

**Business logic — `src/utils/mortgageCalculator.ts`:**
All DS19 calculations are pure functions here. Key rules to preserve:
- Three subsidy tiers (`DS19_TRAMOS`): up to 1.600 UF → 425 UF subsidy; 1.601–2.200 UF → 350 UF; 2.201–3.000 UF → 300 UF.
- Max LTV = 80% (`MAX_LTV`). Loan = propertyValue − savings − subsidy; must be ≥ 50 UF and ≤ maxLoan.
- Reference rates are auto-selected by loan size (5.2%–5.8%) or overridden manually.
- Affordability threshold: monthly payment ≤ 25% of monthly income (`isAffordable`).
- `isDFL2 = true` waives the 0.8% mortgage stamp tax (`MORTGAGE_TAX_RATE`).

**External API:** `mindicador.cl/api` provides the daily UF value. The service caches it in `localStorage` under key `uf_data_ds19`.

**Tailwind custom colors** (defined in `tailwind.config.js`): `ds19-navy`, `ds19-blue`, `ds19-teal`, `ds19-green`, `ds19-lightblue`. Use these instead of raw Tailwind blues/greens for brand consistency.

**PDF export** is handled inside `SimulationResults.tsx` using `jsPDF` + `html2canvas`.
