export const TokenSymbol = ({ symbol }: { symbol: string }) => {
  const bgColor = `hsl(${Math.random() * 360}, 70%, 20%)`
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium"
      style={{ backgroundColor: bgColor }}
    >
      {symbol.slice(0, 2)}
    </div>
  )
}
