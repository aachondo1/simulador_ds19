import { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import type { MortgageInputs } from '../types/mortgage';
import {
  getMinSavings,
  DS19_TRAMOS,
} from '../utils/mortgageCalculator';
interface MortgageFormProps {
  onSubmit: (inputs: MortgageInputs) => void;
  minSavings?: number;
}

const UF_REFERENCE_VALUE = 39500;

const formatCL = (value: number, isCLP: boolean): string =>
  isCLP
    ? Math.round(value).toLocaleString('es-CL')
    : value.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const parseCL = (value: string): number =>
  parseFloat(value.replace(/\./g, '').replace(/,/g, '.')) || 0;

export default function MortgageForm({ onSubmit, minSavings }: MortgageFormProps) {
  const [inputs, setInputs] = useState<MortgageInputs>({
    propertyValue: 1800,
    savings: 280,
    term: 20,
    monthlyIncome: 2000000,
    age: 35,
    propertyType: 'departamento',
    hasCoDebtor: false,
    isDFL2: true,
  });

  const [fixedSalary, setFixedSalary] = useState(2000000);
  const [variableSalary, setVariableSalary] = useState(0);

  const [currency, setCurrency] = useState<'UF' | 'CLP'>('UF');
  const [autoSavings, setAutoSavings] = useState(false);

  const [displayProperty, setDisplayProperty] = useState('1.800,00');
  const [displaySavings, setDisplaySavings] = useState('280,00');
  const [isPropertyFocused, setIsPropertyFocused] = useState(false);
  const [isSavingsFocused, setIsSavingsFocused] = useState(false);

  useEffect(() => {
    if (autoSavings) {
      const min = getMinSavings(inputs.propertyValue);
      setInputs(prev => ({ ...prev, savings: Math.round(min * 100) / 100 }));
      if (!isSavingsFocused) {
        const val = Math.round(min * 100) / 100;
        setDisplaySavings(
          currency === 'CLP'
            ? formatCL(val * UF_REFERENCE_VALUE, true)
            : formatCL(val, false)
        );
      }
    }
  }, [inputs.propertyValue, autoSavings, currency, isSavingsFocused]);

  useEffect(() => {
    if (!isPropertyFocused) {
      setDisplayProperty(
        currency === 'CLP'
          ? formatCL(inputs.propertyValue * UF_REFERENCE_VALUE, true)
          : formatCL(inputs.propertyValue, false)
      );
    }
    if (!isSavingsFocused && !autoSavings) {
      setDisplaySavings(
        currency === 'CLP'
          ? formatCL(inputs.savings * UF_REFERENCE_VALUE, true)
          : formatCL(inputs.savings, false)
      );
    }
  }, [inputs.propertyValue, inputs.savings, currency, isPropertyFocused, isSavingsFocused, autoSavings]);

  const handleCurrencyToggle = (newCurrency: 'UF' | 'CLP') => {
    if (newCurrency === currency) return;
    if (newCurrency === 'CLP') {
      setDisplayProperty(formatCL(inputs.propertyValue * UF_REFERENCE_VALUE, true));
      setDisplaySavings(formatCL(inputs.savings * UF_REFERENCE_VALUE, true));
    } else {
      setDisplayProperty(formatCL(inputs.propertyValue, false));
      setDisplaySavings(formatCL(inputs.savings, false));
    }
    setCurrency(newCurrency);
  };

  const handlePropertyChange = (value: string) => {
    setDisplayProperty(value);
    const num = parseCL(value);
    const uf = currency === 'CLP' ? num / UF_REFERENCE_VALUE : num;
    setInputs(prev => ({ ...prev, propertyValue: uf }));
  };

  const handleSavingsChange = (value: string) => {
    setDisplaySavings(value);
    const num = parseCL(value);
    const uf = currency === 'CLP' ? num / UF_REFERENCE_VALUE : num;
    setInputs(prev => ({ ...prev, savings: uf }));
  };

  const monthlyIncome = fixedSalary + Math.round(variableSalary * 0.85);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...inputs, monthlyIncome });
  };

  const tramoActual = DS19_TRAMOS.find(
    t => inputs.propertyValue >= t.min && inputs.propertyValue <= t.max
  );
  const subsidioActual = tramoActual?.subsidio ?? 0;
  const creditoEstimado = Math.max(0, inputs.propertyValue - inputs.savings - subsidioActual);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-6 h-6 text-ds19-navy" />
        <h2 className="text-2xl font-bold text-ds19-navy">Simulador Crédito Hipotecario DS19</h2>
      </div>

      <div className="pb-4 border-b border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Moneda de ingreso:</label>
        <div className="flex gap-2">
          {(['UF', 'CLP'] as const).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => handleCurrencyToggle(c)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                currency === c
                  ? 'bg-ds19-navy text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {tramoActual && (
        <div className="bg-ds19-lightblue border border-ds19-navy rounded-lg p-3">
          <p className="text-sm font-semibold text-ds19-navy">
            📋 {tramoActual.descripcion} — Subsidio: <span className="text-ds19-green">{tramoActual.subsidio} UF</span>
            {' '} | Ahorro mín.: {tramoActual.ahorroMin} UF
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor Propiedad ({currency})
          </label>
          <input
            type="text"
            value={displayProperty}
            onChange={e => handlePropertyChange(e.target.value)}
            onFocus={() => {
              setIsPropertyFocused(true);
              setDisplayProperty(
                currency === 'CLP'
                  ? Math.round(inputs.propertyValue * UF_REFERENCE_VALUE).toString()
                  : inputs.propertyValue.toFixed(2).replace('.', ',')
              );
            }}
            onBlur={() => {
              setIsPropertyFocused(false);
              setDisplayProperty(
                currency === 'CLP'
                  ? formatCL(inputs.propertyValue * UF_REFERENCE_VALUE, true)
                  : formatCL(inputs.propertyValue, false)
              );
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo: {currency === 'CLP'
              ? `${(3000 * UF_REFERENCE_VALUE).toLocaleString('es-CL')} CLP`
              : '3.000 UF (con DS15)'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ahorro Propio / Pie ({currency})
          </label>
          <input
            type="text"
            value={displaySavings}
            onChange={e => handleSavingsChange(e.target.value)}
            onFocus={() => {
              setIsSavingsFocused(true);
              setDisplaySavings(
                currency === 'CLP'
                  ? Math.round(inputs.savings * UF_REFERENCE_VALUE).toString()
                  : inputs.savings.toFixed(2).replace('.', ',')
              );
            }}
            onBlur={() => {
              setIsSavingsFocused(false);
              setDisplaySavings(
                currency === 'CLP'
                  ? formatCL(inputs.savings * UF_REFERENCE_VALUE, true)
                  : formatCL(inputs.savings, false)
              );
            }}
            disabled={autoSavings}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy disabled:bg-gray-100"
            required
          />
          <label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={autoSavings}
              onChange={e => setAutoSavings(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-gray-700">Calcular automáticamente (mínimo para 80% financiamiento)</span>
          </label>

          {autoSavings && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              <p className="font-medium">Crédito estimado: {creditoEstimado.toFixed(2)} UF</p>
              <p>
                Ahorro ({inputs.savings.toFixed(2)} UF) + Subsidio ({subsidioActual.toFixed(2)} UF)
                = {(inputs.savings + subsidioActual).toFixed(2)} UF
                ({(((inputs.savings + subsidioActual) / inputs.propertyValue) * 100).toFixed(1)}%)
              </p>
            </div>
          )}

          {!autoSavings && minSavings !== undefined && (
            <p className="text-xs text-gray-500 mt-1">
              Mínimo requerido: {currency === 'CLP'
                ? `${(minSavings * UF_REFERENCE_VALUE).toLocaleString('es-CL')} CLP`
                : `${minSavings.toFixed(2)} UF`}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plazo (años)</label>
          <input
            type="number"
            min="5"
            max="40"
            value={inputs.term}
            onChange={e => setInputs(prev => ({ ...prev, term: parseInt(e.target.value) || 20 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo Líquido Fijo (CLP)</label>
          <input
            type="number"
            step="10000"
            min="0"
            value={fixedSalary}
            onChange={e => setFixedSalary(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sueldo Líquido Variable (CLP)</label>
          <input
            type="number"
            step="10000"
            min="0"
            value={variableSalary}
            onChange={e => setVariableSalary(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
          />
          <p className="text-xs text-gray-500 mt-1">Se considera el 85% (penalización 15%)</p>
          <div className="mt-2 p-2 bg-ds19-lightblue border border-ds19-navy rounded text-xs text-ds19-navy">
            <span className="font-semibold">Renta Declarada: </span>
            ${monthlyIncome.toLocaleString('es-CL')} CLP
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input
            type="number"
            min="18"
            max="80"
            value={inputs.age}
            onChange={e =>
              setInputs(prev => ({ ...prev, age: parseInt(e.target.value) || 35 }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Propiedad</label>
          <select
            value={inputs.propertyType}
            onChange={e =>
              setInputs(prev => ({
                ...prev,
                propertyType: e.target.value as 'casa' | 'departamento' | 'otro',
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ds19-navy"
          >
            <option value="casa">Casa</option>
            <option value="departamento">Departamento</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={inputs.isDFL2}
                onChange={e => setInputs(prev => ({ ...prev, isDFL2: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-ds19-navy transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Primera Vivienda DFL-2</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-14">
            {inputs.isDFL2
              ? '✅ Exento de Impuesto de Timbres (0.8%)'
              : '⚠️ Aplica Impuesto de Timbres sobre el crédito'}
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={inputs.hasCoDebtor}
                onChange={e => setInputs(prev => ({ ...prev, hasCoDebtor: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-ds19-navy transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-sm font-medium text-gray-700">Presenta Codeudor</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-14">
            {inputs.hasCoDebtor ? 'Seguro de Desgravamen se duplica' : 'Sin codeudor'}
          </p>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-ds19-navy text-white py-3 rounded-md font-medium hover:bg-ds19-blue transition-colors focus:outline-none focus:ring-2 focus:ring-ds19-navy focus:ring-offset-2"
      >
        Calcular Simulación DS19
      </button>
    </form>
  );
}