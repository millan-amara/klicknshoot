import React, { createContext, useContext } from 'react'
import toast from 'react-hot-toast'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message) => {
    toast.success(message)
  }

  const showError = (message) => {
    toast.error(message)
  }

  const showInfo = (message) => {
    toast(message, {
      icon: 'ℹ️',
    })
  }

  const showLoading = (message) => {
    return toast.loading(message)
  }

  const dismiss = (toastId) => {
    toast.dismiss(toastId)
  }

  const value = {
    showSuccess,
    showError,
    showInfo,
    showLoading,
    dismiss
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}