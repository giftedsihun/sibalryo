import React from 'react'

interface SliderProps {
  label: [string, string]
  value: number
  onChange: (val: number) => void
  color?: string
}

export const PersonalitySlider: React.FC<SliderProps> = ({ label, value, onChange, color = '#FF6B9D' }) => {
  const pct = value / 100

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between text-xs font-korean text-white/60">
        <span>{label[0]}</span>
        <span className="text-white/90 font-medium">{value}</span>
        <span>{label[1]}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all"
          style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
        />
        <input
          type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 10 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg transition-all"
          style={{ left: `calc(${value}% - 8px)`, background: color }}
        />
      </div>
    </div>
  )
}
