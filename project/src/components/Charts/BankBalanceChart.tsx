'use client'

import { useState, useEffect, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ChevronDown } from 'lucide-react'
import { Bank } from '@/types'

interface BankBalanceChartProps {
  data: Record<Bank, { month: string; balance: number }[]>
}

const BANK_LABELS: Record<Bank, string> = {
  chase: 'Chase',
  boa: 'BoA',
  amex: 'Amex',
}

// converts "2024-06" to "Jun 24" for axis ticks
function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  })
}

// converts "2024-06" to "Jun 2024" for dropdowns
function formatDropdownLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-')
  return new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

// subtracts n months from a YYYY-MM string
function subtractMonths(yyyyMM: string, n: number): string {
  const [year, month] = yyyyMM.split('-').map(Number)
  const date = new Date(year, month - 1 - n, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

// reusable dropdown used for From and To pickers
function Dropdown({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}) {
  return (
    <div className="relative flex items-center bg-[#0d0f14] border border-white/20 rounded h-8 px-3 gap-2">
      <span className="text-white/40 text-xs uppercase tracking-wider">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-white text-xs uppercase tracking-wider focus:outline-none cursor-pointer appearance-none pr-5"
      >
        {options.map(m => (
          <option key={m} value={m} style={{ backgroundColor: '#0d0f14' }}>
            {formatDropdownLabel(m)}
          </option>
        ))}
      </select>
      <ChevronDown size={12} className="absolute right-2 text-white/50 pointer-events-none" />
    </div>
  )
}

export default function BankBalanceChart({ data }: BankBalanceChartProps) {
  const [selectedBank, setSelectedBank] = useState<Bank>('chase')
  const [fromMonth, setFromMonth] = useState<string>('')
  const [toMonth, setToMonth] = useState<string>('')

  const bankOptions = (Object.keys(data) as Bank[]).map(bank => ({
    value: bank,
    label: BANK_LABELS[bank],
  }))

  const availableMonths = useMemo(
    () => data[selectedBank].map(d => d.month),
    [data, selectedBank]
  )

  // when bank changes, reset range to last 24 months of that bank's data
  useEffect(() => {
    if (availableMonths.length === 0) return
    const latest = availableMonths[availableMonths.length - 1]
    const defaultFrom = subtractMonths(latest, 23)
    const actualFrom = availableMonths.find(m => m >= defaultFrom) ?? availableMonths[0]
    setToMonth(latest)
    setFromMonth(actualFrom)
  }, [selectedBank, availableMonths])

  const filteredData = useMemo(() => {
    if (!fromMonth || !toMonth) return data[selectedBank]
    return data[selectedBank].filter(d => d.month >= fromMonth && d.month <= toMonth)
  }, [data, selectedBank, fromMonth, toMonth])

  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/70 text-xs uppercase tracking-widest">Bank Account Balance</p>
        <div className="flex items-center gap-3">
          {/* from date - only show months on or before the current to value */}
          <Dropdown
            label="From"
            value={fromMonth}
            onChange={setFromMonth}
            options={availableMonths.filter(m => m <= toMonth)}
          />
          {/* to date - only show months on or after the current from value */}
          <Dropdown
            label="To"
            value={toMonth}
            onChange={setToMonth}
            options={availableMonths.filter(m => m >= fromMonth)}
          />
          {/* bank selector */}
          <div className="relative flex items-center bg-[#0d0f14] border border-white/20 rounded h-8 px-3">
            <select
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value as Bank)}
              className="bg-transparent text-white text-xs uppercase tracking-wider focus:outline-none cursor-pointer appearance-none pr-5"
            >
              {bankOptions.map(b => (
                <option key={b.value} value={b.value} style={{ backgroundColor: '#0d0f14' }}>
                  {b.label}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-2 text-white/50 pointer-events-none" />
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={filteredData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            tickFormatter={v => `${(v / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff20', borderRadius: 8 }}
            labelStyle={{ color: '#ffffff80', fontSize: 12 }}
            labelFormatter={(label) => formatMonthLabel(label as string)}
            formatter={(value) => [`$${(Number(value) / 1000).toFixed(1)}K`, 'Balance']}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#ffffff', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#2563eb' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
