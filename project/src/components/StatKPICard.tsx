interface StatKPICardProps {
  label: string
  value: string
  color: 'green' | 'red'
}

export default function StatKPICard({ label, value, color }: StatKPICardProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6 flex flex-col gap-2">
      <p className={`text-4xl font-bold ${color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </p>
      <p className="text-white/50 text-xs uppercase tracking-widest">{label}</p>
    </div>
  )
}
