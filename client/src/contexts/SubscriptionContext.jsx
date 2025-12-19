import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const SubscriptionContext = createContext()

export const useSubscription = () => {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export const SubscriptionProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState(null)
  const [limits, setLimits] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Track previous user to detect changes
  const prevUserIdRef = useRef(null)

  useEffect(() => {
    // If user logs out, reset subscription state
    if (!isAuthenticated || !user) {
      setSubscription(null)
      setLimits(null)
      setLoading(false)
      prevUserIdRef.current = null
      return
    }

    // If user changed, reset and fetch new subscription
    const currentUserId = user.id || user._id
    if (currentUserId !== prevUserIdRef.current) {
      console.log('User changed, resetting subscription context')
      setSubscription(null)
      setLimits(null)
      setLoading(true)
      prevUserIdRef.current = currentUserId
      
      // Fetch new user's subscription
      fetchSubscription(currentUserId)
    }
  }, [user, isAuthenticated])

  const fetchSubscription = async (userId) => {
    if (!userId) return
    
    setLoading(true)
    try {
      const response = await axios.get(`/api/subscriptions?user=${userId}`)
      if (response.data.subscriptions && response.data.subscriptions.length > 0) {
        const activeSub = response.data.subscriptions.find(sub => 
          sub.status === 'active' && (!sub.endDate || new Date(sub.endDate) > new Date())
        )
        
        if (activeSub) {
          setSubscription(activeSub)
          
          // Get subscription limits
          const limitsResponse = await axios.get(`/api/subscriptions/${activeSub._id}/limits`)
          if (limitsResponse.data.success) {
            setLimits(limitsResponse.data.limits)
          }
        }
      }
      
      // If no active subscription found, set default free limits
      if (!subscription && user?.subscription) {
        const defaultLimits = getDefaultLimits(user.subscription)
        setLimits(defaultLimits)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      // Set default free limits on error
      if (user?.subscription) {
        const defaultLimits = getDefaultLimits(user.subscription)
        setLimits(defaultLimits)
      }
    } finally {
      setLoading(false)
    }
  }

  const getDefaultLimits = (plan) => {
    const plans = {
      free: {
        proposalsPerMonth: 3,
        activeRequests: 3,
        canSeeBudget: false,
        priority: 'low',
        verificationBadge: false
      },
      basic: {
        proposalsPerMonth: 40,
        activeRequests: 10,
        canSeeBudget: true,
        priority: 'medium',
        verificationBadge: true
      },
      pro: {
        proposalsPerMonth: 200,
        activeRequests: 30,
        canSeeBudget: true,
        priority: 'high',
        verificationBadge: true
      }
    }
    return plans[plan] || plans.free
  }

  // Renamed from upgradeSubscription to createSubscription
  const createSubscription = async ({ plan, period = 'monthly' }) => {
    try {
      const response = await axios.post('/api/subscriptions', { plan, period })
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error creating subscription:', error)
      throw new Error(error.response?.data?.message || 'Subscription creation failed')
    }
  }

  const cancelSubscription = async (subscriptionId) => {
    try {
      const response = await axios.post(`/api/subscriptions/${subscriptionId}/cancel`)
      if (response.data.success) {
        setSubscription(prev => ({ ...prev, status: 'cancelled' }))
        fetchSubscription() // Refresh subscription data
      }
      return { success: true, data: response.data }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { success: false, error: error.response?.data?.message }
    }
  }

  const getRemainingProposals = () => {
    if (!limits) return 0
    
    // Try different possible structures
    if (limits.usage?.proposals?.remaining !== undefined) {
      return limits.usage.proposals.remaining
    }
    
    if (limits.proposalsPerMonth !== undefined) {
      // If we have the limit but not usage, assume all are remaining
      return limits.proposalsPerMonth
    }
    
    return 0
  }

  const canSubmitProposal = () => {
    if (!limits || !limits.usage) return false
    return limits.usage.proposals.remaining > 0
  }

  const canSeeBudget = () => {
    return limits?.canSeeBudget || false
  }


  const value = {
    subscription,
    limits,
    loading,
    createSubscription,
    cancelSubscription,
    getRemainingProposals,
    canSubmitProposal,
    canSeeBudget,
    refreshSubscription: () => fetchSubscription(user?.id || user?._id)
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}