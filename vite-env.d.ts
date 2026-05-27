import { BookOpen } from 'lucide-react';

export default function Glossary() {
  const terms = [
    {
      term: 'DS19 — Integración Social y Territorial',
      definition: 'Programa MINVU que permite a familias de distintos ingresos adquirir viviendas en proyectos ubicados en barrios bien localizados, con estándares de calidad y acceso a servicios.',
    },
    {
      term: 'Subsidio Habitacional DS19',
      definition: 'Aporte estatal que se descuenta del precio de la vivienda. El monto varía según el tramo: Tramo 1 (hasta 1.600 UF) → 425 UF; Tramo 2 (1.601–2.200 UF) → 350 UF; Tramo 3 (2.201–3.000 UF, con DS15) → 300 UF.',
    },
    {
      term: 'Crédito Hipotecario',
      definition: 'Préstamo bancario garantizado con la propiedad para financiar la parte no cubierta por el subsidio ni el ahorro propio. A diferencia del leasing, transfiere la propiedad al momento de la compra.',
    },
    {
      term: 'Ahorro Previo (CAV)',
      definition: 'Monto mínimo que el postulante debe tener ahorrado en una Cuenta de Ahorro para la Vivienda (CAV) antes de postular. Para DS19 sector medio, el mínimo es 80 UF.',
    },
    {
      term: 'DFL-2 (Primera Vivienda)',
      definition: 'Decreto que otorga beneficios a primeras viviendas de hasta 140 m². La más relevante: exención del Impuesto de Timbres y Estampillas (0,8% del crédito).',
    },
    {
      term: 'Impuesto de Timbres y Estampillas',
      definition: 'Tributo del 0,8% sobre el monto del crédito hipotecario. Solo aplica si la vivienda NO es DFL-2 o no es primera vivienda.',
    },
    {
      term: 'UF (Unidad de Fomento)',
      definition: 'Unidad de cuenta reajustable según inflación (IPC). Los créditos hipotecarios en Chile se expresan en UF para mantener el valor real de la deuda.',
    },
    {
      term: 'LTV (Loan to Value)',
      definition: 'Relación crédito/valor propiedad. Para DS19, el banco puede financiar hasta el 80%. El 20% restante se cubre con subsidio + ahorro propio.',
    },
    {
      term: 'Dividendo',
      definition: 'Cuota mensual del crédito hipotecario. Incluye amortización de capital, intereses y seguros (incendio/sismo y desgravamen).',
    },
    {
      term: 'CAE (Carga Anual Equivalente)',
      definition: 'Indicador que refleja el costo total del crédito en términos anuales, incluyendo tasa, seguros y comisiones. Permite comparar distintas ofertas bancarias.',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-ds19-teal" />
        <h3 className="text-xl font-bold text-ds19-navy">Glosario DS19</h3>
      </div>
      <div className="space-y-4">
        {terms.map((item, index) => (
          <div key={index} className="border-l-4 border-ds19-teal pl-4 py-2">
            <h4 className="font-semibold text-gray-800 text-sm">{item.term}</h4>
            <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
