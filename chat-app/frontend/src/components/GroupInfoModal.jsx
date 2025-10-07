import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Settings, Crown, UserPlus, UserMinus, Shield, Trash2, Edit3 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function GroupInfoModal({ isOpen, onClose, group, onGroupUpdated }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('info')
  const [isEditing, setIsEditing] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (group) {
      setGroupName(group.name || '')
      setGroupDescription(group.description || '')
    }
  }, [group])

  const isAdmin = group?.admins?.some(admin => admin._id === user.id) || group?.createdBy === user.id
  const isCreator = group?.createdBy === user.id

  const handleSaveChanges = async () => {
    if (!groupName.trim()) {
      setError('Group name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await api.put(`/api/groups/${group._id}`, {
        name: groupName.trim(),
        description: groupDescription.trim()
      })

      onGroupUpdated(data.group)
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update group')
    } finally {
      setLoading(false)
    }
  }

  const handlePromoteToAdmin = async (memberId) => {
    try {
      const { data } = await api.post(`/api/groups/${group._id}/members/${memberId}/promote`)
      onGroupUpdated(data.group)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to promote member')
    }
  }

  const handleDemoteFromAdmin = async (memberId) => {
    try {
      const { data } = await api.post(`/api/groups/${group._id}/members/${memberId}/demote`)
      onGroupUpdated(data.group)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to demote member')
    }
  }

  const handleRemoveMember = async (memberId) => {
    try {
      const { data } = await api.delete(`/api/groups/${group._id}/members/${memberId}`)
      onGroupUpdated(data.group)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove member')
    }
  }

  const handleLeaveGroup = async () => {
    try {
      await api.post(`/api/groups/${group._id}/leave`)
      onClose()
      // Refresh groups list in parent component
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave group')
    }
  }

  const handleDeleteGroup = async () => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/api/groups/${group._id}`)
      onClose()
      // Refresh groups list in parent component
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete group')
    }
  }

  if (!group) return null

  const tabs = [
    { id: 'info', label: 'Info', icon: Settings },
    { id: 'members', label: 'Members', icon: Users }
  ]

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
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{group.name}</h2>
                    <p className="text-white/60 text-sm">{group.members?.length || 0} members</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </motion.button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/20">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Group Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">Group Avatar</p>
                      <p className="text-white/60 text-sm">Default avatar based on group name</p>
                    </div>
                  </div>

                  {/* Group Name */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white/80">Group Name</label>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(!isEditing)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit3 size={16} className="text-blue-400" />
                        </motion.button>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all"
                        maxLength={100}
                      />
                    ) : (
                      <p className="text-white">{group.name}</p>
                    )}
                  </div>

                  {/* Group Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-white/80">Description</label>
                      {isAdmin && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(!isEditing)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Edit3 size={16} className="text-blue-400" />
                        </motion.button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400 focus:bg-white/10 transition-all resize-none"
                        rows={3}
                        maxLength={500}
                      />
                    ) : (
                      <p className="text-white/80">{group.description || 'No description'}</p>
                    )}
                  </div>

                  {/* Group Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm">Created</p>
                      <p className="text-white font-medium">
                        {new Date(group.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/60 text-sm">Last Activity</p>
                      <p className="text-white font-medium">
                        {new Date(group.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-4">
                  {group.members?.map((member) => {
                    const memberUser = member.user || member
                    const isMemberAdmin = group.admins?.some(admin => admin._id === memberUser._id) || group.createdBy === memberUser._id
                    const isCurrentUser = memberUser._id === user.id
                    
                    return (
                      <motion.div
                        key={memberUser._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {memberUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-white font-medium">{memberUser.name}</p>
                              {isMemberAdmin && (
                                <Crown size={16} className="text-yellow-400" />
                              )}
                              {isCurrentUser && (
                                <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">You</span>
                              )}
                            </div>
                            <p className="text-white/60 text-sm">{memberUser.email}</p>
                          </div>
                        </div>
                        
                        {isAdmin && !isCurrentUser && (
                          <div className="flex items-center gap-2">
                            {isMemberAdmin ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDemoteFromAdmin(memberUser._id)}
                                className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
                                title="Demote from admin"
                              >
                                <UserMinus size={16} className="text-orange-400" />
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handlePromoteToAdmin(memberUser._id)}
                                className="p-2 hover:bg-green-500/20 rounded-lg transition-colors"
                                title="Promote to admin"
                              >
                                <UserPlus size={16} className="text-green-400" />
                              </motion.button>
                            )}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleRemoveMember(memberUser._id)}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                              title="Remove member"
                            >
                              <UserMinus size={16} className="text-red-400" />
                            </motion.button>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/20 flex gap-3">
              {isEditing && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </motion.button>
                </>
              )}
              
              {!isEditing && (
                <>
                  {!isCreator && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLeaveGroup}
                      className="flex-1 px-4 py-3 bg-orange-500/20 text-orange-300 rounded-lg hover:bg-orange-500/30 transition-colors"
                    >
                      Leave Group
                    </motion.button>
                  )}
                  
                  {isCreator && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDeleteGroup}
                      className="flex-1 px-4 py-3 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete Group
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
