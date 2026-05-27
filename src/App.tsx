import { useState, useEffect } from 'react';
import { Home, AlertCircle } from 'lucide-react';
import MortgageForm from './components/MortgageForm';
import SimulationResults from './components/SimulationResults';
import Glossary from './components/Glossary';
import Disclaimer from './components/Disclaimer';
import { simulateMortgage, calculateSubsidyResult } from './utils/mortgageCalculator';
import { getUFValue } from './services/ufService';
import { obtenerFechaHoy } from './services/fechaService';
import type { MortgageInputs, SimulationResult } from './types/mortgage';

function App() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [inputs, setInputs] = useState<MortgageInputs | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minSavings, setMinSavings] = useState<number | undefined>();
  const [ufValue, setUfValue] = useState(39500);

  useEffect(() => {
    getUFValue().then(setUfValue);
  }, []);

  useEffect(() => {
    if (inputs) {
      const subsidyInfo = calculateSubsidyResult(inputs.propertyValue);
      setMinSavings(subsidyInfo.minSavings);
    }
  }, [inputs]);

  const handleSimulation = (newInputs: MortgageInputs) => {
    setInputs(newInputs);
    setError(null);

    const simulationResult = simulateMortgage(newInputs, ufValue);

    if (!simulationResult) {
      setError(
        'No se pudo realizar la simulación. Verifica que el valor de la propiedad esté entre 0 y 3.000 UF, ' +
        'que el monto del crédito no supere el 80% del valor, y que el ahorro no exceda el valor de la propiedad.'
      );
      setResult(null);
      return;
    }

    setResult(simulationResult);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-ds19-navy rounded-lg flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold text-ds19-navy">
                  Simulador Hipotecario DS19
                </h1>
                <p className="text-lg text-ds19-teal font-semibold">
                  Crédito Hipotecario con Subsidio MINVU
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calcula tu crédito hipotecario con subsidio estatal DS19 — Programa de Integración Social y Territorial
          </p>
          <p className="text-sm text-ds19-teal mt-2 font-semibold">
            Valor UF referencial: ${ufValue.toLocaleString('es-CL')} CLP
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Fecha de hoy: {obtenerFechaHoy()}
          </p>
        </header>

        {!result ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <MortgageForm onSubmit={handleSimulation} minSavings={minSavings} />
              </div>
              <div>
                <Glossary />
              </div>
            </div>
            <Disclaimer />
          </>
        ) : (
          <>
            <div className="mb-6">
              <MortgageForm onSubmit={handleSimulation} minSavings={minSavings} />
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Error en la Simulación</h4>
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {inputs && (
              <div className="mb-6">
                <SimulationResults result={result} ufValue={ufValue} inputs={inputs} />
              </div>
            )}

            <div className="mb-6">
              <Glossary />
            </div>
            <Disclaimer />
          </>
        )}

        <footer className="mt-12 text-center text-sm border-t border-gray-200 pt-6">
          <p className="text-ds19-teal font-semibold mb-2">
            Simulador DS19 — Crédito Hipotecario con Subsidio MINVU
          </p>
          <p className="text-gray-500">
            Desarrollado con fines demostrativos. Para postular al subsidio DS19, visita{' '}
            <a href="https://www.minvu.gob.cl" target="_blank" rel="noreferrer" className="text-ds19-navy underline">
              minvu.gob.cl
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;