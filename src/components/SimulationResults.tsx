import { useState } from 'react';
import { FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { SimulationResult, MortgageInputs } from '../types/mortgage';
import { getReferenceRateByLoanAmount } from '../utils/mortgageCalculator';

interface SimulationResultsProps {
  result: SimulationResult;
  ufValue: number;
  inputs: MortgageInputs;
}

export default function SimulationResults({ result, ufValue, inputs }: SimulationResultsProps) {
  const [isPdfMode, setIsPdfMode] = useState(false);

  const propertyValue = inputs.propertyValue;
  const loanAmount = result.loanAmount;
  const subsidio = result.subsidy.subsidyAmount;
  const savings = inputs.savings;

  const formatCLP = (n: number) => '$' + n.toLocaleString('es-CL', { minimumFractionDigits: 0 });

  const getCae = (termYears: number): string => {
    const base = inputs.useReferenceRate
      ? getReferenceRateByLoanAmount(loanAmount) * 100
      : inputs.annualRate;
    return (base + (termYears <= 10 ? 0.48 : termYears <= 15 ? 0.42 : 0.38)).toFixed(2) + '%';
  };

  const calcDividendo = (termYears: number) => {
    const annualRate = inputs.useReferenceRate
      ? getReferenceRateByLoanAmount(loanAmount)
      : inputs.annualRate / 100;

    const r = annualRate / 12;
    const n = termYears * 12;
    const factorExp = Math.pow(1 + r, n);
    const dividendoBase = loanAmount * (r * factorExp) / (factorExp - 1);

    const fireBase = inputs.propertyType === 'departamento' ? 0.80 : 0.75;
    const seguroIncendio = propertyValue * fireBase * 0.000042;

    const deathMult = inputs.hasCoDebtor ? 2 : 1;
    const seguroDesgravamen = loanAmount * 0.00011 * deathMult;

    const dividendoTotal = dividendoBase + seguroIncendio + seguroDesgravamen;
    const costoTotal = dividendoTotal * n;
    const rentaMinima = Math.round((dividendoTotal / 0.25) * ufValue);

    return {
      tasa: annualRate * 100,
      dividendoNetoCLP: Math.round(dividendoBase * ufValue),
      seguroIncendioCLP: Math.round(seguroIncendio * ufValue),
      seguroDesgravamenCLP: Math.round(seguroDesgravamen * ufValue),
      dividendoTotalCLP: Math.round(dividendoTotal * ufValue),
      dividendoTotalUF: dividendoTotal,
      cae: getCae(termYears),
      totalCostUF: costoTotal.toFixed(2),
      totalCostCLP: Math.round(costoTotal * ufValue),
      rentaMinima,
    };
  };

  const plazoMax = Math.min(40, 79 - inputs.age);
  const r8 = calcDividendo(8);
  const rSelected = calcDividendo(inputs.term);
  const rMax = calcDividendo(plazoMax);

  const gastos = [
    { concepto: 'Tasación', uf: result.additionalCosts.tasacion.toFixed(2), clp: Math.round(result.additionalCosts.tasacion * ufValue) },
    { concepto: 'Estudio de Títulos', uf: result.additionalCosts.estudioTitulos.toFixed(2), clp: Math.round(result.additionalCosts.estudioTitulos * ufValue) },
    { concepto: 'Borrador de Escritura', uf: result.additionalCosts.borradorEscritura.toFixed(2), clp: Math.round(result.additionalCosts.borradorEscritura * ufValue) },
    { concepto: 'Notaría', uf: result.additionalCosts.notaria.toFixed(2), clp: Math.round(result.additionalCosts.notaria * ufValue) },
    { concepto: 'Inscripción C.B.R.', uf: result.additionalCosts.cbr.toFixed(2), clp: Math.round(result.additionalCosts.cbr * ufValue) },
    {
      concepto: inputs.isDFL2 ? 'Imp. Timbres (exento DFL-2)' : 'Imp. Timbres y Estampillas',
      uf: result.additionalCosts.mortgageTax.toFixed(2),
      clp: Math.round(result.additionalCosts.mortgageTax * ufValue),
    },
    { concepto: 'TOTAL', uf: result.additionalCosts.total.toFixed(2), clp: Math.round(result.additionalCosts.total * ufValue) },
  ];

  const handleGeneratePDF = async () => {
    setIsPdfMode(true);
    setTimeout(async () => {
      const element = document.getElementById('pdf-content-ds19');
      if (!element) { setIsPdfMode(false); return; }
      try {
        const canvas = await html2canvas(element, { scale: 1, useCORS: true, backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageW = 210, pageH = 297, margin = 10;
        const avW = pageW - margin * 2, avH = pageH - margin * 2;
        const ar = canvas.width / canvas.height;
        const imgW = ar > avW / avH ? avW : avH * ar;
        const imgH = ar > avW / avH ? avW / ar : avH;
        doc.addImage(imgData, 'PNG', margin + (avW - imgW) / 2, margin + (avH - imgH) / 2, imgW, imgH);
        doc.save(`Cotizacion-DS19-${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (e) {
        console.error('Error PDF:', e);
      } finally {
        setIsPdfMode(false);
      }
    }, 100);
  };

  const colHeader = 'py-1 px-2 text-center border border-ds19-navy font-bold text-xs';
  const colLeft   = 'py-1 px-2 font-semibold border border-gray-300 text-xs';
  const colCenter = 'py-1 px-2 text-center border border-gray-300 text-xs';

  return (
    <div className="bg-white rounded shadow p-6 max-w-6xl mx-auto">
      <div id="pdf-content-ds19" className="bg-white p-4">

        <div className="mb-3 text-center border-b-2 border-ds19-navy pb-2">
          <h1 className="text-2xl font-bold text-ds19-navy mb-1">CRÉDITO HIPOTECARIO DS19</h1>
          <p className="text-xs text-ds19-teal font-semibold mb-2">Programa de Integración Social y Territorial — MINVU</p>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
            <div><span className="font-semibold">Fecha:</span> {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><span className="font-semibold">Valor UF:</span> ${ufValue.toLocaleString('es-CL')} CLP</div>
          </div>
        </div>

        <div className="mb-4 border-b-2 border-gray-300 pb-3">
          <h2 className="text-lg font-bold text-ds19-navy mb-2">Resumen de la Operación</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-700">
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-navy">Tramo DS19</p>
              <p>{result.subsidy.tramo?.descripcion ?? 'N/A'}</p>
            </div>
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-navy">Valor Propiedad</p>
              <p>{propertyValue.toFixed(2)} UF / {formatCLP(Math.round(propertyValue * ufValue))}</p>
            </div>
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-green">Subsidio DS19</p>
              <p>{subsidio.toFixed(2)} UF / {formatCLP(Math.round(subsidio * ufValue))}</p>
            </div>
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-navy">Ahorro Propio (Pie)</p>
              <p>{savings.toFixed(2)} UF / {formatCLP(Math.round(savings * ufValue))}</p>
            </div>
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-navy">Monto Crédito</p>
              <p>{loanAmount.toFixed(2)} UF / {formatCLP(Math.round(loanAmount * ufValue))}</p>
            </div>
            <div className="bg-ds19-lightblue rounded p-2">
              <p className="font-semibold text-ds19-navy">% Financiamiento</p>
              <p>{((loanAmount / propertyValue) * 100).toFixed(1)}% | DFL-2: {inputs.isDFL2 ? 'Sí' : 'No'}</p>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-bold text-ds19-navy mb-2">Detalle Dividendo Hipotecario</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-ds19-navy text-white">
                <tr>
                  <th className="py-1 px-2 text-left border border-ds19-navy font-bold text-xs"></th>
                  <th className={colHeader}>8 años</th>
                  <th className={colHeader}>{inputs.term} años</th>
                  <th className={colHeader}>{plazoMax} años</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="bg-gray-50">
                  <td className={colLeft}>Tasa Fija (%)</td>
                  <td className={colCenter}>{r8.tasa.toFixed(2)}%</td>
                  <td className={colCenter}>{rSelected.tasa.toFixed(2)}%</td>
                  <td className={colCenter}>{rMax.tasa.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className={colLeft}>Dividendo Neto (CLP)</td>
                  <td className={colCenter}>{formatCLP(r8.dividendoNetoCLP)}</td>
                  <td className={colCenter}>{formatCLP(rSelected.dividendoNetoCLP)}</td>
                  <td className={colCenter}>{formatCLP(rMax.dividendoNetoCLP)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className={colLeft}>Seg. Incendio/Sismo (CLP)</td>
                  <td className={colCenter}>{formatCLP(r8.seguroIncendioCLP)}</td>
                  <td className={colCenter}>{formatCLP(rSelected.seguroIncendioCLP)}</td>
                  <td className={colCenter}>{formatCLP(rMax.seguroIncendioCLP)}</td>
                </tr>
                <tr>
                  <td className={colLeft}>Seg. Desgravamen (CLP)</td>
                  <td className={colCenter}>{formatCLP(r8.seguroDesgravamenCLP)}</td>
                  <td className={colCenter}>{formatCLP(rSelected.seguroDesgravamenCLP)}</td>
                  <td className={colCenter}>{formatCLP(rMax.seguroDesgravamenCLP)}</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className={colLeft}>Dividendo Total (CLP)</td>
                  <td className={colCenter}>{formatCLP(r8.dividendoTotalCLP)}</td>
                  <td className={colCenter}>{formatCLP(rSelected.dividendoTotalCLP)}</td>
                  <td className={colCenter}>{formatCLP(rMax.dividendoTotalCLP)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className={colLeft}>CAE</td>
                  <td className={colCenter}>{r8.cae}</td>
                  <td className={colCenter}>{rSelected.cae}</td>
                  <td className={colCenter}>{rMax.cae}</td>
                </tr>
                <tr className="bg-blue-50 font-bold">
                  <td className={colLeft}>Costo Total Crédito</td>
                  <td className={colCenter + ' leading-tight'}>{r8.totalCostUF} UF<br />{formatCLP(r8.totalCostCLP)}</td>
                  <td className={colCenter + ' leading-tight'}>{rSelected.totalCostUF} UF<br />{formatCLP(rSelected.totalCostCLP)}</td>
                  <td className={colCenter + ' leading-tight'}>{rMax.totalCostUF} UF<br />{formatCLP(rMax.totalCostCLP)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-bold text-ds19-navy mb-2">Requisitos y Validaciones</h3>
          <div className="bg-gray-50 rounded p-2 mb-2">
            <div className="grid grid-cols-3 gap-2 text-xs text-gray-700">
              <div><span className="font-semibold">Edad:</span> {inputs.age} años</div>
              <div><span className="font-semibold">Renta declarada:</span> {formatCLP(inputs.monthlyIncome)}</div>
              <div><span className="font-semibold">Codeudor:</span> {inputs.hasCoDebtor ? 'Sí' : 'No'}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse border border-gray-400">
              <thead className="bg-ds19-navy text-white">
                <tr>
                  <th className="py-1 px-2 text-left border border-ds19-navy font-bold text-xs">Concepto</th>
                  <th className={colHeader}>8 años</th>
                  <th className={colHeader}>{inputs.term} años</th>
                  <th className={colHeader}>{plazoMax} años</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  { label: 'Renta Mínima (CLP)', r8v: r8.rentaMinima, rSelectedv: rSelected.rentaMinima, rMaxv: rMax.rentaMinima, check: (v: number) => inputs.monthlyIncome >= v, fmt: formatCLP },
                ].map(row => (
                  <tr key={row.label}>
                    <td className={colLeft}>{row.label}</td>
                    {[row.r8v, row.rSelectedv, row.rMaxv].map((v, i) => {
                      const ok = row.check(v);
                      return (
                        <td key={i} className={colCenter}>
                          <div>{row.fmt(v)}</div>
                          <div className="w-full bg-gray-200 rounded-full h-1 mt-0.5">
                            <div
                              className={`h-1 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min((inputs.monthlyIncome / v) * 100, 100)}%` }}
                            />
                          </div>
                          <div className={`text-xs mt-0.5 font-semibold ${ok ? 'text-green-600' : 'text-red-600'}`}>
                            {ok ? '✓ Cumple' : '✗ No cumple'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td className={colLeft}>Edad + Plazo &lt; 80</td>
                  {[8, inputs.term, plazoMax].map(p => {
                    const total = inputs.age + p;
                    const ok = total < 80;
                    return (
                      <td key={p} className={colCenter}>
                        <div>{inputs.age} + {p} = {total}</div>
                        <div className={`text-xs font-semibold ${ok ? 'text-green-600' : 'text-red-600'}`}>
                          {ok ? '✓ Cumple' : '✗ No cumple'}
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className={colLeft}>Edad Máxima Solicitud (≤ 65)</td>
                  <td className={colCenter + ' text-center'} colSpan={3}>
                    <span className={`font-semibold ${inputs.age <= 65 ? 'text-green-600' : 'text-red-600'}`}>
                      {inputs.age} años — {inputs.age <= 65 ? '✓ Cumple' : '✗ No cumple'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-bold text-ds19-navy mb-2">Gastos Operacionales</h3>
          <table className="w-full text-xs border-collapse max-w-2xl border border-gray-400">
            <thead className="bg-ds19-navy text-white">
              <tr>
                <th className="py-1 px-2 text-left border border-ds19-navy font-bold text-xs">Concepto</th>
                <th className={colHeader}>UF</th>
                <th className={colHeader}>CLP</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {gastos.map((g, idx) => (
                <tr
                  key={idx}
                  className={
                    idx === gastos.length - 1
                      ? 'bg-blue-50 font-bold'
                      : idx % 2 === 0
                      ? 'bg-white'
                      : 'bg-gray-50'
                  }
                >
                  <td className="py-1 px-2 border border-gray-300">{g.concepto}</td>
                  <td className="py-1 px-2 text-center border border-gray-300">{g.uf}</td>
                  <td className="py-1 px-2 text-center border border-gray-300">{formatCLP(g.clp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isPdfMode && (
          <div className="mt-3 bg-gray-50 border border-ds19-navy rounded p-3 text-xs text-gray-700 leading-relaxed">
            <p className="font-bold text-ds19-navy mb-1">Información importante</p>
            <p>Simulación referencial. Los valores, tasas y condiciones finales dependen de la evaluación crediticia del banco, políticas de la institución financiera y condiciones del mercado. El subsidio DS19 está sujeto a postulación y aprobación por MINVU/SERVIU.</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-row gap-3 justify-center">
        <button
          onClick={handleGeneratePDF}
          className="flex items-center justify-center gap-2 bg-ds19-navy text-white px-8 py-3 rounded-md font-semibold hover:bg-ds19-blue transition-colors"
        >
          <FileDown className="w-5 h-5" />
          Generar PDF
        </button>
      </div>
    </div>
  );
}