import React, { ReactNode } from 'react'

interface RenderIfProps {
  condition: boolean
  children: ReactNode
}

export const RenderIf: React.FC<RenderIfProps> = ({ condition, children }) => {
  return condition ? <>{children}</> : null
}
