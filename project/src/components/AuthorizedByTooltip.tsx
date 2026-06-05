'use client'

import { useState } from 'react'
import { NormalizedTransaction } from '@/types'

interface Props {
  user: NonNullable<NormalizedTransaction['authorizedBy']>
}

export default function AuthorizedByTooltip({ user }: Props) {
  const [show, setShow] = useState(false)

  // get initials from name
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {/* the name shown in the table cell */}
      <span className="text-white/70 cursor-default border-b border-dashed border-white/30">
        {user.name}
      </span>

      {/* tooltip shown on hover */}
      {show && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[#1a1f2e] border border-white/10 rounded-lg p-3 w-52 shadow-xl"> 

          {/* avatar with initials */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center shrink-0">
              <span className="text-[#2563eb] text-xs font-semibold">{initials}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-white/40 text-xs">{user.role.replace('_', ' ')}</p>
            </div>
          </div>

          {/* email */}
          <p className="text-white/50 text-xs truncate">{user.email}</p>
        </div>
      )}
    </div>
  )
}
