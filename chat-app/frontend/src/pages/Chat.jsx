import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import ChatInput from '../components/ChatInput'
import MessageBubble from '../components/MessageBubble'
import UserItem from '../components/UserItem'
import GroupItem from '../components/GroupItem'
import ChatHeader from '../components/ChatHeader'
import ProfileModal from '../components/ProfileModal'
import GroupCreationModal from '../components/GroupCreationModal'
import GroupInfoModal from '../components/GroupInfoModal'
import ChatBackground from '../components/ChatBackground'
import ChatOrbs from '../components/ChatOrbs'
import GlowInput from '../components/GlowInput'
import { Search, Users, Plus } from 'lucide-react'

export default function Chat() {
  const { user, updateUser } = useAuth()
  const { socket, onlineMap } = useSocket()
  const [users, setUsers] = useState([])
  const [groups, setGroups] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [activeGroupId, setActiveGroupId] = useState(null)
  const [chatType, setChatType] = useState('direct') // 'direct' or 'group'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typingFrom, setTypingFrom] = useState(null)
  const [image, setImage] = useState(null)
  const [document, setDocument] = useState(null)
  const [unreadCounts, setUnreadCounts] = useState({})
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({})
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showGroupCreationModal, setShowGroupCreationModal] = useState(false)
  const [showGroupInfoModal, setShowGroupInfoModal] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const listRef = useRef(null)
  const fileInputRef = useRef(null)
  const documentInputRef = useRef(null)

  useEffect(() => {
    api.get('/api/users').then(({ data }) => setUsers(data.users))
    api.get('/api/groups/my-groups').then(({ data }) => setGroups(data.groups))
  }, [])

  useEffect(() => {
    if (!socket) return
    const onNew = (msg) => {
      // Handle direct messages
      if (msg.messageType === 'direct') {
        if ((msg.senderId === activeId && msg.receiverId === user.id) || (msg.senderId === user.id && msg.receiverId === activeId)) {
          setMessages((m) => [...m, msg])
          
          // If message is from someone else and we're not currently viewing their chat, increment unread count
          if (msg.senderId !== user.id && msg.senderId !== activeId) {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.senderId]: (prev[msg.senderId] || 0) + 1
            }))
          }
        }
      }
      
      // Handle group messages
      if (msg.messageType === 'group') {
        // Check if user is member of this group
        const group = groups.find(g => g._id === msg.groupId)
        if (group) {
          // If we're currently viewing this group, add message
          if (activeGroupId === msg.groupId && chatType === 'group') {
            // Don't add the message if it's from the current user (to prevent duplicates)
            if (msg.senderId !== user.id) {
              setMessages((m) => [...m, msg])
            }
          } else {
            // Increment unread count for this group
            setGroupUnreadCounts(prev => ({
              ...prev,
              [msg.groupId]: (prev[msg.groupId] || 0) + 1
            }))
          }
          
          // Update group's last message
          setGroups(prev => prev.map(g => 
            g._id === msg.groupId 
              ? { ...g, lastMessage: msg, lastActivity: new Date() }
              : g
          ))
        }
      }
    }
    const onDelivered = (msg) => {
      if (msg.tempId) {
        setMessages((m) => {
          const idx = m.findIndex((x) => x._id === msg.tempId)
          if (idx !== -1) {
            const clone = m.slice()
            clone[idx] = { ...msg }
            return clone
          }
          return [...m, msg]
        })
      } else if (msg.messageType === 'direct') {
        // Only call onNew for direct messages, not group messages
        onNew(msg)
      }
    }
    const onTyping = ({ from, typing }) => {
      if (from === activeId) setTypingFrom(typing ? from : null)
    }
    const onDeleted = ({ id, groupId }) => {
      if (groupId) {
        // Group message deleted
        setMessages((m) => m.filter((x) => x._id !== id))
      } else {
        // Direct message deleted
        setMessages((m) => m.filter((x) => x._id !== id))
      }
    }
    socket.on('message:new', onNew)
    socket.on('message:delivered', onDelivered)
    socket.on('typing', onTyping)
    socket.on('message:deleted', onDeleted)
    return () => {
      socket.off('message:new', onNew)
      socket.off('message:delivered', onDelivered)
      socket.off('typing', onTyping)
      socket.off('message:deleted', onDeleted)
    }
  }, [socket, activeId, activeGroupId, chatType, user?.id, groups])

  useEffect(() => {
    if (!activeId && !activeGroupId) return
    
    if (chatType === 'direct' && activeId) {
      api.get(`/api/messages/${activeId}`).then(({ data }) => setMessages(data.messages))
    } else if (chatType === 'group' && activeGroupId) {
      api.get(`/api/groups/${activeGroupId}/messages`).then(({ data }) => setMessages(data.messages))
    }
  }, [activeId, activeGroupId, chatType])

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function emitTyping(typing) {
    if (socket) {
      if (chatType === 'direct' && activeId) {
        socket.emit('typing', { to: activeId, typing })
      } else if (chatType === 'group' && activeGroupId) {
        socket.emit('typing', { to: activeGroupId, typing, groupId: activeGroupId })
      }
    }
  }

  // Clear unread count when selecting a user
  const handleUserSelect = (userId) => {
    setActiveId(userId)
    setActiveGroupId(null)
    setChatType('direct')
    setMessages([])
    setUnreadCounts(prev => ({
      ...prev,
      [userId]: 0
    }))
    // Show chat on mobile
    setShowMobileChat(true)
  }

  const handleGroupSelect = (group) => {
    setActiveGroupId(group._id)
    setActiveId(null)
    setChatType('group')
    setMessages([])
    setGroupUnreadCounts(prev => ({
      ...prev,
      [group._id]: 0
    }))
    // Show chat on mobile
    setShowMobileChat(true)
  }

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev])
    setShowGroupCreationModal(false)
    // Automatically select the new group
    handleGroupSelect(newGroup)
  }

  const handleGroupUpdated = (updatedGroup) => {
    setGroups(prev => prev.map(g => g._id === updatedGroup._id ? updatedGroup : g))
    setSelectedGroup(updatedGroup)
  }

  const handleGroupInfoClick = () => {
    const group = groups.find(g => g._id === activeGroupId)
    if (group) {
      setSelectedGroup(group)
      setShowGroupInfoModal(true)
    }
  }

  const handleGroupDelete = async (groupId) => {
    try {
      await api.delete(`/api/groups/${groupId}`)
      setGroups(prev => prev.filter(g => g._id !== groupId))
      // If the deleted group was active, clear the active state
      if (activeGroupId === groupId) {
        setActiveGroupId(null)
        setChatType('direct')
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting group:', error)
      alert('Failed to delete group')
    }
  }

  const handleContactDelete = async (userId) => {
    try {
      // For now, we'll just remove from the local state
      // In a real app, you might want to add a backend endpoint to "block" or "remove" contacts
      setUsers(prev => prev.filter(u => u.id !== userId))
      // If the deleted contact was active, clear the active state
      if (activeId === userId) {
        setActiveId(null)
        setMessages([])
      }
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('Failed to delete contact')
    }
  }

  const handleGroupLeave = async (groupId) => {
    try {
      await api.post(`/api/groups/${groupId}/leave`)
      setGroups(prev => prev.filter(g => g._id !== groupId))
      // If the left group was active, clear the active state
      if (activeGroupId === groupId) {
        setActiveGroupId(null)
        setChatType('direct')
        setMessages([])
      }
    } catch (error) {
      console.error('Error leaving group:', error)
      alert('Failed to leave group')
    }
  }


  const handleProfileUpdate = (updatedUser) => {
    // Update the current user in the auth context
    updateUser(updatedUser)
  }

  const activeUser = useMemo(() => {
    if (chatType === 'direct') {
      return users.find((u) => u.id === activeId)
    } else if (chatType === 'group') {
      return groups.find((g) => g._id === activeGroupId)
    }
    return null
  }, [users, groups, activeId, activeGroupId, chatType])

  // Group messages by date and add date separators
  const groupedMessages = useMemo(() => {
    if (!messages.length) return []
    
    const groups = []
    let currentDate = null
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt)
      let dateLabel = null
      
      if (isToday(messageDate)) {
        dateLabel = 'Today'
      } else if (isYesterday(messageDate)) {
        dateLabel = 'Yesterday'
      } else if (isThisWeek(messageDate)) {
        dateLabel = format(messageDate, 'EEEE')
      } else {
        dateLabel = format(messageDate, 'MMM d, yyyy')
      }
      
      // Add date separator if this is a new date
      if (currentDate !== dateLabel) {
        groups.push({
          type: 'date',
          date: dateLabel,
          timestamp: message.createdAt
        })
        currentDate = dateLabel
      }
      
      // Add the message
      groups.push({
        type: 'message',
        ...message
      })
    })
    
    return groups
  }, [messages])

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleDocumentChange = (e) => {
    setDocument(e.target.files[0]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !image && !document) || !socket || (!activeId && !activeGroupId)) return;

    const text = input.trim();
    const tempId = `tmp-${Date.now()}`;
    
    // Create optimistic message immediately
    const optimistic = {
      _id: tempId,
      senderId: user.id,
      receiverId: chatType === 'direct' ? activeId : null,
      groupId: chatType === 'group' ? activeGroupId : null,
      messageType: chatType,
      text,
      imageUrl: image ? 'uploading...' : null,
      fileAttachment: document ? { fileName: document.name, fileSize: document.size, uploading: true } : null,
      status: 'sending',
      createdAt: new Date().toISOString(),
    };
    
    // Show message immediately
    setMessages((m) => [...m, optimistic]);
    setInput('');
    setImage(null);
    setDocument(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (documentInputRef.current) documentInputRef.current.value = '';

    // Handle image upload in background
    let imageUrl = null;
    if (image) {
      try {
        const formData = new FormData();
        formData.append('image', image);

        const res = await api.post('/api/upload/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = res.data.imageUrl;
        
        // Update the optimistic message with real image URL
        setMessages((m) => {
          const idx = m.findIndex((msg) => msg._id === tempId);
          if (idx !== -1) {
            const clone = m.slice();
            clone[idx] = { ...clone[idx], imageUrl, status: 'sent' };
            return clone;
          }
          return m;
        });
      } catch (error) {
        console.error('Upload failed:', error);
        // Remove the failed message
        setMessages((m) => m.filter((msg) => msg._id !== tempId));
        return;
      }
    }

    // Handle document upload in background
    let fileAttachment = null;
    if (document) {
      try {
        console.log('Uploading document:', document.name, document.size, document.type);
        const formData = new FormData();
        formData.append('document', document);

        const res = await api.post('/api/upload/document', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        console.log('Document upload response:', res.data);
        fileAttachment = res.data;
        
        // Update the optimistic message with real file attachment
        setMessages((m) => {
          const idx = m.findIndex((msg) => msg._id === tempId);
          if (idx !== -1) {
            const clone = m.slice();
            clone[idx] = { ...clone[idx], fileAttachment, status: 'sent' };
            return clone;
          }
          return m;
        });
      } catch (error) {
        console.error('Document upload failed:', error);
        console.error('Error details:', error.response?.data);
        // Remove the failed message
        setMessages((m) => m.filter((msg) => msg._id !== tempId));
        alert('Document upload failed: ' + (error.response?.data?.message || error.message));
        return;
      }
    }

    // Send message via socket
    // Send message via socket
    const socketData = {
      text,
      imageUrl,
      fileAttachment,
      tempId
    };

    if (chatType === 'direct') {
      socketData.to = activeId;
    } else if (chatType === 'group') {
      socketData.groupId = activeGroupId;
    }

    socket.emit('message:send', socketData);
  };

  const handleDelete = (id) => {
    setMessages((m) => m.filter((msg) => msg._id !== id))
    
    const deleteData = { id };
    if (chatType === 'group') {
      deleteData.groupId = activeGroupId;
    } else {
      deleteData.to = activeId;
    }
    
    socket.emit('message:delete', deleteData)
  }

  return (
    <div className="h-screen relative flex overflow-hidden">
      {/* Animated Background */}
      <ChatBackground />
      {/* Enhanced Sidebar */}
      <motion.aside
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-80 lg:w-80 md:w-72 sm:w-full backdrop-blur-xl bg-white/10 border-r border-white/20 flex flex-col relative z-10 ${
          showMobileChat ? 'hidden' : 'flex'
        } sm:flex`}
      >
        {/* Enhanced Sidebar Header */}
        <div className="p-6 border-b border-white/20 bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-sm text-white relative overflow-hidden">
          {/* Header glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Chattr Logo" 
                className="w-10 h-10 object-contain"
              />
              <div>
                <h1 className="font-bold text-xl text-white">Chattr</h1>
                <p className="text-blue-100 text-sm">Real-time Chat</p>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-lg"
                />
              ) : (
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Users size={20} />
                </div>
              )}
              <div>
                <h2 className="font-semibold text-lg text-white">{user?.name}</h2>
                <p className="text-blue-100 text-xs">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search with Glow Effect */}
        <div className="p-4 border-b border-white/20">
          <GlowInput
            type="text"
            placeholder="Search conversations..."
            icon={Search}
            className="w-full"
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Create Group Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGroupCreationModal(true)}
            className="w-full p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl text-white hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 flex items-center gap-3 mb-4"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Plus size={18} className="text-blue-400" />
            </div>
            <span className="font-medium">Create Group</span>
          </motion.button>

          {/* Groups Section */}
          {groups.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white/60 mb-3 px-2">Groups</h3>
              <AnimatePresence>
                {groups.map((group, index) => (
                  <motion.div
                    key={group._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="mb-2"
                  >
                            <GroupItem
                              group={group}
                              isActive={activeGroupId === group._id && chatType === 'group'}
                              unreadCount={groupUnreadCounts[group._id] || 0}
                              onClick={() => handleGroupSelect(group)}
                              onDelete={handleGroupDelete}
                              onLeave={handleGroupLeave}
                              currentUserId={user.id}
                            />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Direct Messages Section */}
          <div>
            <h3 className="text-sm font-semibold text-white/60 mb-3 px-2">Direct Messages</h3>
            <AnimatePresence>
              {users.map((u, index) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (groups.length + index) * 0.05 }}
                  className="mb-2"
                >
                          <UserItem
                            user={u}
                            isActive={activeId === u.id && chatType === 'direct'}
                            isOnline={onlineMap?.[u.id]}
                            unreadCount={unreadCounts[u.id] || 0}
                            onClick={() => handleUserSelect(u.id)}
                            onDelete={handleContactDelete}
                          />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Enhanced Main Chat Area */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={`flex-1 flex flex-col backdrop-blur-xl bg-white/5 border-l border-white/20 relative z-10 ${
          showMobileChat ? 'block' : 'hidden'
        } sm:block`}
      >
        {/* Glowing Orbs Background */}
        <ChatOrbs />
        {/* Mobile Back Button */}
        <div className="sm:hidden flex items-center gap-3 p-4 border-b border-white/20 bg-white/10">
          <button
            onClick={() => setShowMobileChat(false)}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            {activeUser?.avatarUrl ? (
              <img 
                src={activeUser.avatarUrl} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {activeUser?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-semibold text-white text-sm">{activeUser?.name}</h2>
              <p className="text-white/60 text-xs">
                {chatType === 'group' ? 'Group' : 'Direct Message'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Header */}
        <ChatHeader 
          activeUser={activeUser} 
          typingFrom={typingFrom} 
          chatType={chatType}
          onProfileClick={() => setShowProfileModal(true)}
          onGroupInfoClick={handleGroupInfoClick}
        />

        {/* Enhanced Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent via-white/5 to-transparent">
          <div ref={listRef} className="p-6 space-y-1">
            <AnimatePresence>
              {groupedMessages.map((item, index) => (
                <React.Fragment key={item.type === 'date' ? `date-${item.timestamp}` : item._id}>
                  {item.type === 'date' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center my-6"
                    >
                      <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">{item.date}</span>
                      </div>
                    </motion.div>
                  ) : (
                    <MessageBubble
                      message={item}
                      isOwn={(() => {
                        // Handle both populated and non-populated senderId
                        const senderId = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
                        const userId = user.id || user._id;
                        return String(senderId) === String(userId);
                      })()}
                      onDelete={handleDelete}
                      showSenderName={chatType === 'group'}
                      senderName={(() => {
                        if (chatType === 'group') {
                          // Get sender name from populated senderId or from users list
                          if (typeof item.senderId === 'object' && item.senderId.name) {
                            return item.senderId.name;
                          } else {
                            // Find sender in users list
                            const senderId = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
                            const sender = users.find(u => String(u.id) === String(senderId));
                            return sender?.name || 'Unknown User';
                          }
                        }
                        return null;
                      })()}
                    />
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Input */}
        <ChatInput
          input={input}
          setInput={setInput}
          image={image}
          setImage={setImage}
          document={document}
          setDocument={setDocument}
          fileInputRef={fileInputRef}
          documentInputRef={documentInputRef}
          handleImageChange={handleImageChange}
          handleDocumentChange={handleDocumentChange}
          handleSend={handleSend}
          activeUser={activeUser}
          chatType={chatType}
          activeId={activeId}
          activeGroupId={activeGroupId}
          emitTyping={emitTyping}
        />
      </motion.main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />

      {/* Group Creation Modal */}
      <GroupCreationModal
        isOpen={showGroupCreationModal}
        onClose={() => setShowGroupCreationModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      {/* Group Info Modal */}
      <GroupInfoModal
        isOpen={showGroupInfoModal}
        onClose={() => setShowGroupInfoModal(false)}
        group={selectedGroup}
        onGroupUpdated={handleGroupUpdated}
      />
    </div>
  );
}