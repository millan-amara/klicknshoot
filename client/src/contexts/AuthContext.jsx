import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Use a ref to track if auth check is already in progress
  const authCheckRef = useRef(false)

  useEffect(() => {
    // Prevent multiple auth checks
    if (!authCheckRef.current) {
      authCheckRef.current = true
      checkAuth()
    }
  }, []) // Empty dependency array - runs only once on mount

  // 🔥 SESSION-BASED AUTH CHECK
  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
      setIsAuthenticated(true)
    } catch (err) {
      // Only log if it's not a 401 (expected for non-logged-in users)
      if (err.response?.status !== 401) {
        console.error('Auth check error:', err)
      }
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // 🔥 LOGIN WITH SESSION COOKIE
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      setUser(res.data.user)
      setIsAuthenticated(true)
      toast.success('Logged in successfully!')
      return { success: true, user: res.data.user }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // 🔥 REGISTER WITH SESSION COOKIE
  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData)
      setUser(res.data.user)
      setIsAuthenticated(true)
      toast.success('Account created successfully!')
      return { success: true, user: res.data.user }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  // AuthContext.js - Update the logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.log('Logout error', err)
    } finally {
      // 🔥 CRITICAL: Reset ALL state on logout
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      
      // Clear any refs
      authCheckRef.current = false
      
      toast.success('Logged out successfully')
      
      // Force a hard reset by clearing any potential caches
      setTimeout(() => {
        window.location.href = '/login' // Force redirect to login page
      }, 100)
    }
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}