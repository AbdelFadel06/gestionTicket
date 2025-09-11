interface StatProps {
  count: number | string
  label: string
}

const Stat = ({ count, label }: StatProps) => {
  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <h1 className="text-[48px] font-bold text-gray-800">{count}</h1>
      <p className="text-gray-600">{label}</p>
    </div>
  )
}

export default Stat
