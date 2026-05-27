import { useMemo } from 'react';
import type { SimulationResult } from '../types/mortgage';

interface PaymentChartProps {
  result: SimulationResult;
  termYears: number;
}

export default function PaymentChart({ result, termYears }: PaymentChartProps) {
  const chartData = useMemo(() => {
    const data = [];
    let remainingBalance = result.loanAmount;
    const monthlyRate = result.effectiveRate / 12;
    const numPayments = termYears * 12;

    const basePayment =
      result.loanAmount *
      ((monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
        (Math.pow(1 + monthlyRate, numPayments) - 1));

    for (let year = 1; year <= termYears; year++) {
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      for (let month = 1; month <= 12 && remainingBalance > 0; month++) {
        const interest = remainingBalance * monthlyRate;
        const principal = basePayment - interest;
        yearlyPrincipal += principal;
        yearlyInterest += interest;
        remainingBalance -= principal;
      }

      data.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, remainingBalance),
      });
    }
    return data;
  }, [result.loanAmount, result.effectiveRate, termYears]);

  const maxValue = Math.max(...chartData.map(d => d.principal + d.interest));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-ds19-navy mb-6">Evolución de Pagos Anuales</h3>

      <div className="space-y-3">
        {chartData.map((data, index) => {
          const principalWidth = (data.principal / maxValue) * 100;
          const interestWidth = (data.interest / maxValue) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">Año {data.year}</span>
                <span className="text-gray-600">{(data.principal + data.interest).toFixed(2)} UF</span>
              </div>
              <div className="flex h-8 bg-gray-100 rounded overflow-hidden">
                <div
                  className="bg-ds19-navy flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${principalWidth}%` }}
                >
                  {principalWidth > 15 && `${data.principal.toFixed(0)} UF`}
                </div>
                <div
                  className="bg-ds19-teal flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${interestWidth}%` }}
                >
                  {interestWidth > 15 && `${data.interest.toFixed(0)} UF`}
                </div>
              </div>
              <div className="text-xs text-gray-500">Saldo: {data.balance.toFixed(2)} UF</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-6 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-ds19-navy rounded" />
          <span className="text-sm text-gray-600">Capital</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-ds19-teal rounded" />
          <span className="text-sm text-gray-600">Interés</span>
        </div>
      </div>
    </div>
  );
}
