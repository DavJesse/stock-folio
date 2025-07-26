import { ReactNode } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

type DashboardLayoutWithModalProps = {
  readonly children: ReactNode
  readonly modal: ReactNode
}

// Wraps the dashboard page with its layout and an optional modal overlay
export default function DashboardLayoutWithModal({
  children,
  modal,
}: DashboardLayoutWithModalProps) {
  return (
    <>
      <DashboardLayout>
        {children}
      </DashboardLayout>
      {modal}
    </>
  )
}
