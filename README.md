# Simulador Crédito Hipotecario DS19

Simulador web para calcular créditos hipotecarios con subsidio estatal **DS19** (Decreto Supremo 19, MINVU — Programa de Integración Social y Territorial).

## Stack tecnológico

- **React 18 + TypeScript** — UI
- **Vite** — bundler
- **Tailwind CSS** — estilos
- **jsPDF + html2canvas** — generación de PDF

## Instalación y uso

```bash
npm install
npm run dev
```

## Parámetros DS19 implementados

| Tramo | Valor Propiedad | Subsidio | Ahorro Mínimo |
|-------|----------------|----------|--------------|
| 1 | Hasta 1.600 UF | 425 UF | 80 UF |
| 2 | 1.601 – 2.200 UF | 350 UF | 80 UF |
| 3 | 2.201 – 3.000 UF (con DS15) | 300 UF | 160 UF |

## Diferencias con Leasing Habitacional (Ley 19.281)

| Aspecto | Leasing | DS19 Hipotecario |
|---------|---------|------------------|
| Tipo | Arriendo → compra posterior | Compra directa |
| Tasa referencial | 10.5–11.5% | 5.2–5.8% |
| Subsidio | Fórmula continua | Tramos fijos |
| Impuesto Timbres | No aplica | 0.8% del crédito (0% si DFL-2) |
| Propiedad máx. | 2.000 UF | 3.000 UF |

## Estructura del proyecto

```
src/
├── App.tsx
├── components/
│   ├── MortgageForm.tsx       # Formulario de simulación
│   ├── SimulationResults.tsx  # Tabla de resultados + PDF
│   ├── PaymentChart.tsx       # Gráfico evolución de pagos
│   ├── Glossary.tsx           # Glosario DS19
│   └── Disclaimer.tsx         # Aviso legal
├── data/
│   └── ejecutivos.json
├── services/
│   ├── ufService.ts           # Obtiene valor UF desde mindicador.cl
│   └── fechaService.ts
├── types/
│   └── mortgage.ts            # Tipos TypeScript
└── utils/
    └── mortgageCalculator.ts  # Lógica de negocio DS19
```

## Fuentes

- [MINVU — Programa DS19](https://www.minvu.gob.cl/beneficio/vivienda/subsidio-de-integracion-social-y-territorial-ds19/)
- [Subsidio al Crédito Hipotecario](https://www.minvu.gob.cl/nuevo-subsidio-al-credito-hipotecario/)