import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  
  // Track the previous auth user ID to detect changes
  const prevAuthUserIdRef = useRef(null)

  useEffect(() => {
    // RESET PROFILE WHEN USER LOGS OUT OR CHANGES
    if (!isAuthenticated || !authUser) {
      console.log('User logged out or not authenticated, resetting profile')
      setProfile(null)
      setProfileLoading(false)
      prevAuthUserIdRef.current = null
      return
    }

    const currentAuthUserId = authUser.id || authUser._id
    
    // Only fetch if the authenticated user has changed
    if (currentAuthUserId !== prevAuthUserIdRef.current) {
      console.log('Auth user changed from', prevAuthUserIdRef.current, 'to', currentAuthUserId)
      setProfile(null) // CRITICAL: Clear old profile immediately
      setProfileLoading(true)
      prevAuthUserIdRef.current = currentAuthUserId
      fetchProfile(currentAuthUserId, authUser.role)
    }
  }, [authUser, isAuthenticated]) // Depend on both authUser AND isAuthenticated

  // UserContext.js - Update fetchProfile
const fetchProfile = async (userId, role) => {
  if (!userId || !role) return
  
  console.log('🔍 Fetching profile for:', { userId, role })
  
  try {
    let response
    if (role === 'creative') {
      // ✅ Use the new dedicated endpoint
      response = await axios.get(`/api/creatives/by-user/${userId}`)
      console.log('Creative API response:', response.data)
      if (response.data.success && response.data.creative) {
        setProfile(response.data.creative)
        console.log('Set creative profile:', response.data.creative.firstName)
      } else {
        console.log('No creative profile found')
        setProfile(null)
      }
    } else if (role === 'client') {
      // Do the same for clients
      response = await axios.get(`/api/clients/by-user/${userId}`)
      if (response.data.success && response.data.client) {
        setProfile(response.data.client)
        console.log('Set client profile:', response.data.client.firstName)
      } else {
        console.log('No client profile found')
        setProfile(null)
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
    setProfile(null)
  } finally {
    setProfileLoading(false)
  }
}

  const updateProfile = async (profileData) => {
    if (!profile) return { success: false, error: 'No profile loaded' }
    
    try {
      let response
      if (authUser.role === 'creative') {
        response = await axios.put(`/api/creatives/${profile._id}`, profileData)
      } else if (authUser.role === 'client') {
        response = await axios.put(`/api/clients/${profile._id}`, profileData)
      }
      
      if (response.data.success) {
        setProfile(response.data[authUser.role])
        return { success: true, data: response.data }
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.response?.data?.message }
    }
  }

  const refreshProfile = () => {
    if (authUser && authUser.id && authUser.role) {
      fetchProfile(authUser.id, authUser.role)
    }
  }

  const value = {
    profile,
    profileLoading,
    updateProfile,
    refreshProfile
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}