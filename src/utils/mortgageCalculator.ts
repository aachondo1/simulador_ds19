import type {
  MortgageInputs,
  SubsidyResult,
  MonthlyPaymentBreakdown,
  AdditionalCosts,
  SimulationResult,
  DS19Tramo,
} from '../types/mortgage';

// ─── Constantes DS19 ─────────────────────────────────────────────

export const DS19_TRAMOS: DS19Tramo[] = [
  {
    numero: 1,
    min: 0,
    max: 1600,
    subsidio: 425,
    ahorroMin: 80,
    descripcion: 'Tramo 1 — Hasta 1.600 UF',
  },
  {
    numero: 2,
    min: 1600.01,
    max: 2200,
    subsidio: 350,
    ahorroMin: 80,
    descripcion: 'Tramo 2 — 1.601 a 2.200 UF',
  },
  {
    numero: 3,
    min: 2200.01,
    max: 3000,
    subsidio: 300,
    ahorroMin: 160,
    descripcion: 'Tramo 3 — 2.201 a 3.000 UF (con DS15)',
  },
];

export const MAX_PROPERTY_UF = 3000;
const MIN_LOAN_UF = 50;
const MAX_LTV = 0.8;
const DEATH_INSURANCE_MONTHLY_RATE = 0.00011;
const FIRE_INSURANCE_MONTHLY_RATE = 0.000042;
const FIRE_BASE_CASA = 0.75;
const FIRE_BASE_DEPTO = 0.80;
const MORTGAGE_TAX_RATE = 0.008;

const FIXED_COSTS_UF = {
  tasacion: 2.98,
  estudioTitulos: 3.50,
  borradorEscritura: 2.50,
  notaria: 3.50,
};

const REFERENCE_RATE_BRACKETS = [
  { min: 0,       max: 599.99,   rate: 0.058 },
  { min: 600,     max: 999.99,   rate: 0.056 },
  { min: 1000,    max: 1799.99,  rate: 0.054 },
  { min: 1800,    max: Infinity, rate: 0.052 },
];

// ─── Funciones exportadas ──────────────────────────────────────────────

export function getDS19Tramo(propertyValueUF: number): DS19Tramo | null {
  return DS19_TRAMOS.find(t => propertyValueUF >= t.min && propertyValueUF <= t.max) ?? null;
}

export function getSubsidyAmount(propertyValueUF: number): number {
  const tramo = getDS19Tramo(propertyValueUF);
  return tramo ? tramo.subsidio : 0;
}

export function getMinSavings(propertyValueUF: number): number {
  const tramo = getDS19Tramo(propertyValueUF);
  const tramoMin = tramo ? tramo.ahorroMin : 0;
  const subsidio = getSubsidyAmount(propertyValueUF);
  const savingsNeededForLTV = Math.max(propertyValueUF * (1 - MAX_LTV) - subsidio, 0);
  return Math.max(tramoMin, savingsNeededForLTV);
}

export function calculateSubsidyResult(propertyValueUF: number): SubsidyResult {
  const subsidyAmount = getSubsidyAmount(propertyValueUF);
  const maxLoan = propertyValueUF * MAX_LTV;
  const minSavings = getMinSavings(propertyValueUF);
  const tramo = getDS19Tramo(propertyValueUF);
  return { subsidyAmount, minSavings, maxLoan, ltv: MAX_LTV, tramo };
}

export function getReferenceRateByLoanAmount(loanUF: number): number {
  const bracket = REFERENCE_RATE_BRACKETS.find(b => loanUF >= b.min && loanUF <= b.max);
  return bracket ? bracket.rate : REFERENCE_RATE_BRACKETS[REFERENCE_RATE_BRACKETS.length - 1].rate;
}

export function calculateMonthlyPayment(
  loanUF: number,
  annualRate: number,
  termYears: number,
  propertyValueUF: number,
  hasCoDebtor: boolean = false,
  propertyType: 'casa' | 'departamento' | 'otro' = 'casa'
): MonthlyPaymentBreakdown {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  const monthlyPaymentBase =
    loanUF * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  const interest = loanUF * monthlyRate;
  const principal = monthlyPaymentBase - interest;

  const deathInsMultiplier = hasCoDebtor ? 2 : 1;
  const deathInsurance = loanUF * DEATH_INSURANCE_MONTHLY_RATE * deathInsMultiplier;

  const fireBase = propertyType === 'departamento' ? FIRE_BASE_DEPTO : FIRE_BASE_CASA;
  const fireInsurance = propertyValueUF * fireBase * FIRE_INSURANCE_MONTHLY_RATE;

  return {
    principal: Math.round(principal * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    deathInsurance: Math.round(deathInsurance * 100) / 100,
    fireInsurance: Math.round(fireInsurance * 100) / 100,
    total: Math.round((monthlyPaymentBase + deathInsurance + fireInsurance) * 100) / 100,
  };
}

export function calculateAdditionalCosts(
  propertyValueUF: number,
  loanUF: number,
  isDFL2: boolean = true
): AdditionalCosts {
  const cbr = propertyValueUF * 0.008;
  const mortgageTax = isDFL2 ? 0 : loanUF * MORTGAGE_TAX_RATE;

  const subtotal =
    FIXED_COSTS_UF.tasacion +
    FIXED_COSTS_UF.estudioTitulos +
    FIXED_COSTS_UF.borradorEscritura +
    FIXED_COSTS_UF.notaria +
    cbr +
    mortgageTax;

  return {
    tasacion: FIXED_COSTS_UF.tasacion,
    estudioTitulos: FIXED_COSTS_UF.estudioTitulos,
    borradorEscritura: FIXED_COSTS_UF.borradorEscritura,
    notaria: FIXED_COSTS_UF.notaria,
    cbr: Math.round(cbr * 100) / 100,
    mortgageTax: Math.round(mortgageTax * 100) / 100,
    total: Math.round(subtotal * 100) / 100,
  };
}

export function simulateMortgage(
  inputs: MortgageInputs,
  ufValueCLP: number
): SimulationResult | null {
  const { propertyValue, savings, term, monthlyIncome, isDFL2, useReferenceRate } = inputs;

  if (propertyValue > MAX_PROPERTY_UF) return null;

  const subsidyResult = calculateSubsidyResult(propertyValue);
  const loanAmount = propertyValue - savings - subsidyResult.subsidyAmount;

  if (loanAmount < MIN_LOAN_UF) return null;
  if (loanAmount > subsidyResult.maxLoan) return null;

  const effectiveRate = useReferenceRate
    ? getReferenceRateByLoanAmount(loanAmount)
    : inputs.annualRate / 100;

  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    effectiveRate,
    term,
    propertyValue,
    inputs.hasCoDebtor,
    inputs.propertyType
  );

  const additionalCosts = calculateAdditionalCosts(propertyValue, loanAmount, isDFL2);

  const monthlyPaymentCLP = monthlyPayment.total * ufValueCLP;
  const affordabilityPercentage = (monthlyPaymentCLP / monthlyIncome) * 100;

  return {
    subsidy: subsidyResult,
    loanAmount: Math.round(loanAmount * 100) / 100,
    effectiveRate,
    monthlyPayment,
    additionalCosts,
    totalFinanced: propertyValue,
    isAffordable: affordabilityPercentage <= 40,
    affordabilityPercentage: Math.round(affordabilityPercentage * 100) / 100,
  };
}