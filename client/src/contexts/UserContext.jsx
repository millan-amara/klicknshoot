import React, { createContext, useState, useContext, useEffect } from 'react'
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
  const { user: authUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (authUser && authUser.role) {
      fetchProfile()
    }
  }, [authUser])

  const fetchProfile = async () => {
    if (!authUser || !authUser.id) return
    
    setProfileLoading(true)
    try {
      let response
      if (authUser.role === 'creative') {
        response = await axios.get(`/api/creatives?user=${authUser.id}`)
        if (response.data.creatives && response.data.creatives.length > 0) {
          setProfile(response.data.creatives[0])
        }
      } else if (authUser.role === 'client') {
        response = await axios.get(`/api/clients?user=${authUser.id}`)
        if (response.data.clients && response.data.clients.length > 0) {
          setProfile(response.data.clients[0])
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setProfileLoading(false)
    }
  }

  const updateProfile = async (profileData) => {
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
    fetchProfile()
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