export interface MortgageInputs {
  propertyValue: number;        // Valor propiedad en UF
  savings: number;              // Ahorro propio (pie) en UF
  term: number;                 // Plazo en años
  annualRate: number;           // Tasa anual (como decimal, ej: 0.055 para 5.5%)
  monthlyIncome: number;        // Renta mensual en CLP
  age: number;                  // Edad del solicitante
  propertyType: 'casa' | 'departamento' | 'otro';
  hasCoDebtor: boolean;         // ¿Presenta codeudor?
  isDFL2: boolean;              // ¿Primera vivienda DFL-2? (exento impuesto timbres)
  useReferenceRate: boolean;    // ¿Usar tasa referencial automática?
}

export interface DS19Tramo {
  numero: number;
  min: number;
  max: number;
  subsidio: number;
  ahorroMin: number;
  descripcion: string;
}

export interface SubsidyResult {
  subsidyAmount: number;
  minSavings: number;
  maxLoan: number;
  ltv: number;
  tramo: DS19Tramo | null;
}

export interface MonthlyPaymentBreakdown {
  principal: number;
  interest: number;
  deathInsurance: number;
  fireInsurance: number;
  total: number;
}

export interface AdditionalCosts {
  tasacion: number;
  estudioTitulos: number;
  borradorEscritura: number;
  notaria: number;
  cbr: number;
  mortgageTax: number;   // Impuesto de timbres y estampillas
  total: number;
}

export interface SimulationResult {
  subsidy: SubsidyResult;
  loanAmount: number;
  effectiveRate: number;
  monthlyPayment: MonthlyPaymentBreakdown;
  additionalCosts: AdditionalCosts;
  totalFinanced: number;
  isAffordable: boolean;
  affordabilityPercentage: number;
}
