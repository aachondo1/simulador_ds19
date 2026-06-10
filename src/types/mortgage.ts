export interface MortgageInputs {
  propertyValue: number;        // Valor propiedad en UF
  savings: number;              // Ahorro propio en UF
  subsidy: number;              // Subsidio DS19 en UF (ingresado manualmente)
  term: number;                 // Plazo en años
  monthlyIncome: number;        // Renta declarada mensual en CLP
  age: number;                  // Edad del solicitante
  propertyType: 'casa' | 'departamento' | 'otro';
  hasCoDebtor: boolean;         // ¿Presenta codeudor?
  isSocialHousing: boolean;     // ¿Es vivienda social? (exento impuesto timbres)
  continuidadLaboral: boolean;  // true = ≥ 6 meses con el mismo empleador
  antiguedadLaboral: boolean;   // true = ≥ 12 meses trabajando
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