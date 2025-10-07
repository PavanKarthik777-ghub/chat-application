import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Plus, Search, Check } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function GroupCreationModal({ isOpen, onClose, onGroupCreated }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: Group info, 2: Add members
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [availableUsers, setAvailableUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch users when search query changes
  React.useEffect(() => {
    if (searchQuery.trim()) {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get(`/api/users?search=${searchQuery}`)
          // Filter out current user and already selected members
          const filteredUsers = data.users.filter(u => 
            u.id !== user.id && 
            !selectedMembers.some(member => member.id === u.id)
          )
          setAvailableUsers(filteredUsers)
        } catch (err) {
          console.error('Error fetching users:', err)
        }
      }
      
      const timeoutId = setTimeout(fetchUsers, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setAvailableUsers([])
    }
  }, [searchQuery, user.id, selectedMembers])

  const handleAddMember = (user) => {
    setSelectedMembers(prev => [...prev, user])
    setSearchQuery('')
    setAvailableUsers([])
  }

  const handleRemoveMember = (userId) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== userId))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    if (selectedMembers.length === 0) {
      setError('Please add at least one member')
      return
    }

    setLoading(true)
    setError('')

    try {
      const memberIds = selectedMembers.map(member => member.id)
      const { data } = await api.post('/api/groups/create', {
        name: groupName.trim(),
        description: groupDescription.trim(),
        memberIds
      })

      onGroupCreated(data.group)
      handleClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setGroupName('')
    setGroupDescription('')
    setSearchQuery('')
    setAvailableUsers([])
    setSelectedMembers([])
    setError('')
    onClose()
  }

  const handleNext = () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }
    setStep(2)
    setError('')
  }

  const handleBack = () => {
    setStep(1)
    setError('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users size={20} className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  {step === 1 ? 'Create Group' : 'Add Members'}
                </h2>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-white/60" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {step === 1 ? (
                // Step 1: Group Info
                <>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Enter group description"
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all resize-none"
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                </>
              ) : (
                // Step 2: Add Members
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users to add"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-2">
                        Selected Members ({selectedMembers.length})
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedMembers.map((member) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{member.name}</p>
                                <p className="text-white/60 text-sm">{member.email}</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <X size={16} className="text-red-400" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Available Users */}
                  {availableUsers.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-white/80 mb-2">
                        Available Users
                      </h3>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableUsers.map((user) => (
                          <motion.div
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleAddMember(user)}
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.name}</p>
                                <p className="text-white/60 text-sm">{user.email}</p>
                              </div>
                            </div>
                            <Plus size={16} className="text-blue-400" />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-6">
              {step === 2 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Back
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={step === 1 ? handleNext : handleCreateGroup}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {step === 1 ? 'Next' : 'Create Group'}
                    {step === 2 && <Check size={16} />}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
