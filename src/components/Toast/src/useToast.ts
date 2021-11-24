import { useContext } from "react"
import { ToastContext, ToastObject } from "~/components/Toast/src/Toast"

export const useToast = (): (obj: ToastObject) => void => {
  const value = useContext(ToastContext)
  return value.toast
}
