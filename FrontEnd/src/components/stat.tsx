import React from 'react'

interface StatProps {
  count: number | string
  label: string
  colorBg?: string // couleur de fond optionnelle
  colorText?: string // couleur du texte optionnelle
}

const Stat: React.FC<StatProps> = ({ count, label, colorBg = 'bg-muted/50', colorText = 'text-gray-800' }) => {
  return (
    <div
      className={`${colorBg} aspect-video rounded-xl flex flex-col justify-center items-center shadow p-4`}
    >
      <h1 className={`text-[48px] font-bold ${colorText}`}>{count}</h1>
      <p className="text-gray-600">{label}</p>
    </div>
  )
}

export default Stat
