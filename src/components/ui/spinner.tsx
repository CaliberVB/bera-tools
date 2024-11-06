import { Loader2 } from 'lucide-react'
import * as React from 'react'

import { cn } from '@/lib/utils'

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-center', className)}
    {...props}
  >
    <Loader2 className="h-6 w-6 animate-spin" />
  </div>
))
Spinner.displayName = 'Spinner'

export { Spinner }
