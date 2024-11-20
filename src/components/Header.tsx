export const Header = () => {
  return (
    <div className="flex flex-col items-center text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="text-xl font-semibold flex items-center gap-2">
          <span className="text-2xl">🐻</span>
          <span className="text-2xl">⛓️</span>
          Berachain Validator Tools from{' '}
          <a
            href="https://caliber.build/"
            className="text-blue-500 hover:underline"
          >
            <span className="inline-flex items-center gap-1">Caliber</span>
          </a>
        </div>
      </div>

      <h1 className="text-xl font-semibold mb-6">
        Add / Update cutting board to the queue for Validator
      </h1>

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm">Supported Wallets:</span>
        <div className="flex items-center gap-1">
          <span className="text-2xl">🦊</span>
          <span>Metamask</span>
        </div>
      </div>
    </div>
  )
}
