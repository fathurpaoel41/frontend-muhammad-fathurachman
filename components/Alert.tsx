import React, { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning'
  title?: string
  message: string
  isVisible: boolean
  onClose: () => void
  autoClose?: boolean
  duration?: number
}

const Alert: React.FC<AlertProps> = ({ 
  type, 
  title, 
  message, 
  isVisible, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, autoClose, duration])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />
      case 'error':
        return <XCircle className="w-5 h-5" />
      case 'warning':
        return <AlertCircle className="w-5 h-5" />
      case 'info':
        return <Info className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getAlertClasses = () => {
    const baseClasses = "flex items-start p-4 rounded-lg border transition-all duration-300 ease-in-out"
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200`
      case 'error':
        return `${baseClasses} bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200`
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200`
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200`
      default:
        return `${baseClasses} bg-gray-50 border-gray-200 text-gray-800`
    }
  }

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'warning':
        return 'text-yellow-500'
      case 'info':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div
        className={`${getAlertClasses()} ${
          show 
            ? 'opacity-100 translate-x-0 scale-100' 
            : 'opacity-0 translate-x-full scale-95'
        } transform transition-all duration-300 ease-in-out shadow-lg`}
      >
        <div className={`${getIconColor()} mr-3 flex-shrink-0`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-1">{title}</h4>
          )}
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Alert 