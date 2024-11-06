import { Button } from './components/ui/button'
import { useListVault } from './data'

const App: React.FC = () => {
  const { data: vaults, isFetched } = useListVault()
  console.log('🚀 ~ isFetched:', isFetched)
  console.log('🚀 ~ vaults:', vaults)
  return <Button>Hello 123123</Button>
}

export default App
