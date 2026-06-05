'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

interface MoneyInOutChartProps {
  data: { month: string; in: number; out: number }[]
}

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  // JS Date months are 0-indexed so subtract 1
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

export default function MoneyInOutChart({ data }: MoneyInOutChartProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
      <p className="text-white/70 text-xs uppercase tracking-widest mb-6">Money In vs Money Out</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={(value) => formatMonthLabel(value)}
            tick={{ fill: '#ffffff50', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#ffffff50', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff80', fontSize: 12 }}
            labelFormatter={(label) => formatMonthLabel(label)}
            formatter={(value, name) => [
              `$${(Number(value) / 1000).toFixed(1)}K`,
              name === 'in' ? 'Cash In' : 'Cash Out',
            ]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#ffffff70', fontSize: 11, textTransform: 'uppercase' }}>
                {value === 'in' ? 'In' : 'Out'}
              </span>
            )}
          />
          {/* stacked bars - green on bottom (in), red on top (out) */}
          <Bar dataKey="in" stackId="a" fill="#22c55e" />
          <Bar dataKey="out" stackId="a" fill="#ef4444" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
