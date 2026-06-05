'use client'

import useSWR from 'swr'
import { NormalizedTransaction } from '@/types'
import { toUSD, CurrencyCode } from '@/lib/currency'

const fetcher = (url: string) => fetch(url).then(res => res.json())

function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toFixed(2)}`
}

export default function CustomPage() {
  const { data, isLoading, error } = useSWR<NormalizedTransaction[]>('/api/transactions', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50 text-sm uppercase tracking-widest">Loading...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">Failed to load data.</p>
      </div>
    )
  }

  const inUSD = (tx: NormalizedTransaction) => toUSD(tx.amount, tx.currency as CurrencyCode)

  // group debit transactions by employee and sum their authorized spend
  const teamSpend = (() => {
    const map = new Map<string, { role: string; total: number; count: number }>()
    data.filter(tx => tx.type === 'debit' && tx.authorizedBy).forEach(tx => {
      const { name, role } = tx.authorizedBy!
      const existing = map.get(name) ?? { role: role ?? 'Unknown', total: 0, count: 0 }
      map.set(name, {
        role: existing.role,
        total: existing.total + inUSD(tx),
        count: existing.count + 1,
      })
    })
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, ...d, total: Math.round(d.total) }))
      .sort((a, b) => b.total - a.total)
  })()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[#c2c2c2] text-4xl uppercase tracking-wider">Workspace</h1>

      <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
        <p className="text-white/70 text-xs uppercase tracking-widest mb-6">Team Spend Report</p>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-white/40 text-xs uppercase tracking-wider text-left pb-3">Employee</th>
              <th className="text-white/40 text-xs uppercase tracking-wider text-left pb-3">Role</th>
              <th className="text-white/40 text-xs uppercase tracking-wider text-right pb-3">Transactions</th>
              <th className="text-white/40 text-xs uppercase tracking-wider text-right pb-3">Total Authorized</th>
            </tr>
          </thead>
          <tbody>
            {teamSpend.map(({ name, role, count, total }) => (
              <tr key={name} className="border-t border-white/5">
                <td className="text-white/80 text-sm py-3">{name}</td>
                <td className="text-white/50 text-xs py-3 capitalize">{role}</td>
                <td className="text-white/50 text-xs py-3 text-right">{count}</td>
                <td className="text-white/80 text-sm py-3 text-right">{formatUSD(total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
