import type * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Alert, AlertCloseButton, AlertDescription, AlertIcon, AlertStatus, AlertTitle } from "~/components"
import { chakra } from "~/system"
import { createContext } from "react"
import { useLape } from "lape"
import { Portal } from "~/portal"

type ToastProps = {
  status?: AlertStatus
  title: string
  description: string
  onClose?: () => void
}

export const ToastContext = createContext<any>({})

type ToastProviderProps = {
  children: React.ReactNode
}

export type ToastObject = {
  title: string
  description: string
  id?: string
  onClose?: (id: string) => void
  status?: AlertStatus
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const state = useLape<ToastObject[]>([])
  const toast = ({ title, description, id, status, onClose }: ToastObject) => {
    const uid = id || "id" + new Date().getTime()
    state.push({ title, description, id: uid, status, onClose })
  }
  return (
    <ToastContext.Provider value={{ toast, state }}>
      <Portal>
        <chakra.div position="fixed" bottom={0} transform="translateX(-50%)" left="50%">
          <AnimatePresence>
            {state.map((toast) => (
              <motion.li
                key={toast.id}
                layout
                initial={{
                  opacity: 0,
                  bottom: 24,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  x: 0,
                  scale: 1,
                  transition: {
                    duration: 0.4,
                    ease: [0.4, 0, 0.2, 1],
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.85,
                  transition: {
                    duration: 0.2,
                    ease: [0.4, 0, 1, 1],
                  },
                }}
              >
                <Toast
                  status={toast.status}
                  description={toast.description + toast.id}
                  title={toast.title}
                  onClose={() => {
                    toast.onClose?.(toast.id!)
                    const i = state.findIndex((item) => item.id === toast.id)
                    state.splice(i, 1)
                  }}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </chakra.div>
      </Portal>
      {children}
    </ToastContext.Provider>
  )
}

export const Toast = ({ status, title, description, onClose }: ToastProps) => {
  return (
    <Alert status={status} width="22.5rem" mb={1.5} boxShadow="lg">
      <AlertIcon />
      <chakra.div flex="1" maxWidth="100%">
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription display="block">{description}</AlertDescription>}
      </chakra.div>
      <AlertCloseButton onClose={onClose} />
    </Alert>
  )
}
