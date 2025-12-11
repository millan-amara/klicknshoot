import { useState, useEffect } from 'react'
import { FiSearch, FiFilter, FiUserCheck, FiUserX, FiMail, FiPhone, FiCalendar } from 'react-icons/fi'
import { adminService } from '../../services/admin.service'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import InputField from '../../components/forms/InputField'
import SelectField from '../../components/forms/SelectField'
import { toast } from 'react-hot-toast'

const AdminUsers = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    role: 'all',
    subscription: 'all',
    status: 'all'
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, filters, users])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminService.getAllUsers()
      setUsers(response.users || [])
      setFilteredUsers(response.users || [])
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.phone?.includes(term)
      )
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    // Subscription filter
    if (filters.subscription !== 'all') {
      filtered = filtered.filter(user => user.subscription === filters.subscription)
    }

    // Status filter
    if (filters.status !== 'all') {
      if (filters.status === 'verified') {
        filtered = filtered.filter(user => user.isVerified)
      } else if (filters.status === 'unverified') {
        filtered = filtered.filter(user => !user.isVerified)
      }
    }

    setFilteredUsers(filtered)
  }

  const handleUpdateUser = async (userId, updates) => {
    try {
      await adminService.updateUser(userId, updates)
      toast.success('User updated successfully')
      fetchUsers() // Refresh list
    } catch (error) {
      toast.error('Failed to update user')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      await adminService.deleteUser(userId)
      toast.success('User deleted successfully')
      fetchUsers() // Refresh list
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const getRoleBadge = (role) => {
    const colors = {
      creative: 'bg-purple-100 text-purple-800',
      client: 'bg-blue-100 text-blue-800',
      admin: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  const getSubscriptionBadge = (subscription) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-green-100 text-green-800',
      pro: 'bg-indigo-100 text-indigo-800'
    }
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[subscription]}`}>
        {subscription.charAt(0).toUpperCase() + subscription.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage all users on the platform. Total: {users.length} users
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <InputField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={FiSearch}
          />
          
          <SelectField
            value={filters.role}
            onChange={(value) => setFilters({...filters, role: value})}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'creative', label: 'Creatives' },
              { value: 'client', label: 'Clients' },
              { value: 'admin', label: 'Admins' }
            ]}
            icon={FiFilter}
          />
          
          <SelectField
            value={filters.subscription}
            onChange={(value) => setFilters({...filters, subscription: value})}
            options={[
              { value: 'all', label: 'All Subscriptions' },
              { value: 'free', label: 'Free' },
              { value: 'basic', label: 'Basic' },
              { value: 'pro', label: 'Pro' }
            ]}
            icon={FiFilter}
          />
          
          <SelectField
            value={filters.status}
            onChange={(value) => setFilters({...filters, status: value})}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'verified', label: 'Verified Only' },
              { value: 'unverified', label: 'Unverified Only' }
            ]}
            icon={FiFilter}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.firstName || ''}+${user.lastName || ''}`}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <FiMail className="mr-1" size={12} />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500 flex items-center">
                            <FiPhone className="mr-1" size={12} />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getSubscriptionBadge(user.subscription || 'free')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                        <FiUserCheck className="mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                        <FiUserX className="mr-1" />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="mr-1" size={12} />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => handleUpdateUser(user._id, {
                          isVerified: !user.isVerified
                        })}
                      >
                        {user.isVerified ? 'Unverify' : 'Verify'}
                      </Button>
                      
                      {user.role !== 'admin' && (
                        <>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => {
                              const newRole = user.role === 'client' ? 'creative' : 'client'
                              handleUpdateUser(user._id, { role: newRole })
                            }}
                          >
                            Change Role
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination would go here */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredUsers.length}</span> of{' '}
              <span className="font-medium">{filteredUsers.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="small" disabled>
                Previous
              </Button>
              <Button variant="outline" size="small" disabled>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminUsers