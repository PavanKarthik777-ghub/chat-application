import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, BellOff, Volume2, VolumeX, Download, Eye, EyeOff, Monitor, Moon, Sun, Type, Users, Globe, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, setUser } = useAuth();
  const [settings, setSettings] = useState({
    // Privacy Settings
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
    
    // Notification Settings
    enableNotifications: true,
    enableSound: true,
    enableDesktopNotifications: true,
    
    // Auto-download Settings
    autoDownloadImages: true,
    autoDownloadDocuments: false,
    
    // Visual Settings
    fontSize: 'medium',
    theme: 'light',
    chatDensity: 'comfortable',
    
    // Language & Region
    language: 'en',
    timezone: 'UTC'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && user?.settings) {
      setSettings({ ...settings, ...user.settings });
    }
  }, [isOpen, user?.settings]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.put('/api/users/settings', { settings });
      
      // Update user in context
      setUser(prev => ({ ...prev, settings: data.settings }));
      
      // Apply visual settings immediately
      applyVisualSettings(data.settings);
      
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const applyVisualSettings = (newSettings) => {
    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    document.documentElement.style.setProperty('--chat-font-size', fontSizeMap[newSettings.fontSize]);
    
    // Apply theme
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply chat density
    const densityClass = newSettings.chatDensity === 'compact' ? 'compact' : 'comfortable';
    document.body.className = document.body.className.replace(/compact|comfortable/g, '') + ' ' + densityClass;
  };

  const SettingSection = ({ title, children }) => (
    <div className="mb-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const ToggleSetting = ({ label, description, icon: Icon, value, onChange }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <motion.div
          animate={{ x: value ? 24 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </motion.button>
    </div>
  );

  const SelectSetting = ({ label, description, icon: Icon, value, onChange, options }) => (
    <div className="p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon size={20} className="text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Settings</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6"
                >
                  {error}
                </motion.div>
              )}

              {/* Privacy Settings */}
              <SettingSection title="Privacy">
                <ToggleSetting
                  label="Show Online Status"
                  description="Let others see when you're online"
                  icon={Eye}
                  value={settings.showOnlineStatus}
                  onChange={(value) => handleSettingChange('showOnlineStatus', value)}
                />
                <ToggleSetting
                  label="Show Last Seen"
                  description="Let others see when you were last active"
                  icon={Clock}
                  value={settings.showLastSeen}
                  onChange={(value) => handleSettingChange('showLastSeen', value)}
                />
                <ToggleSetting
                  label="Read Receipts"
                  description="Let others know when you've read their messages"
                  icon={EyeOff}
                  value={settings.showReadReceipts}
                  onChange={(value) => handleSettingChange('showReadReceipts', value)}
                />
              </SettingSection>

              {/* Notification Settings */}
              <SettingSection title="Notifications">
                <ToggleSetting
                  label="Enable Notifications"
                  description="Receive notifications for new messages"
                  icon={Bell}
                  value={settings.enableNotifications}
                  onChange={(value) => handleSettingChange('enableNotifications', value)}
                />
                <ToggleSetting
                  label="Sound Notifications"
                  description="Play sound for new messages"
                  icon={Volume2}
                  value={settings.enableSound}
                  onChange={(value) => handleSettingChange('enableSound', value)}
                />
                <ToggleSetting
                  label="Desktop Notifications"
                  description="Show desktop notifications"
                  icon={Monitor}
                  value={settings.enableDesktopNotifications}
                  onChange={(value) => handleSettingChange('enableDesktopNotifications', value)}
                />
              </SettingSection>

              {/* Auto-download Settings */}
              <SettingSection title="Downloads">
                <ToggleSetting
                  label="Auto-download Images"
                  description="Automatically download images in messages"
                  icon={Download}
                  value={settings.autoDownloadImages}
                  onChange={(value) => handleSettingChange('autoDownloadImages', value)}
                />
                <ToggleSetting
                  label="Auto-download Documents"
                  description="Automatically download documents"
                  icon={Download}
                  value={settings.autoDownloadDocuments}
                  onChange={(value) => handleSettingChange('autoDownloadDocuments', value)}
                />
              </SettingSection>

              {/* Visual Settings */}
              <SettingSection title="Appearance">
                <SelectSetting
                  label="Font Size"
                  description="Choose your preferred text size"
                  icon={Type}
                  value={settings.fontSize}
                  onChange={(value) => handleSettingChange('fontSize', value)}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' }
                  ]}
                />
                <SelectSetting
                  label="Theme"
                  description="Choose your preferred theme"
                  icon={Sun}
                  value={settings.theme}
                  onChange={(value) => handleSettingChange('theme', value)}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' }
                  ]}
                />
                <SelectSetting
                  label="Chat Density"
                  description="Choose how compact the chat appears"
                  icon={Users}
                  value={settings.chatDensity}
                  onChange={(value) => handleSettingChange('chatDensity', value)}
                  options={[
                    { value: 'comfortable', label: 'Comfortable' },
                    { value: 'compact', label: 'Compact' }
                  ]}
                />
              </SettingSection>

              {/* Language & Region */}
              <SettingSection title="Language & Region">
                <SelectSetting
                  label="Language"
                  description="Choose your preferred language"
                  icon={Globe}
                  value={settings.language}
                  onChange={(value) => handleSettingChange('language', value)}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' }
                  ]}
                />
                <SelectSetting
                  label="Timezone"
                  description="Choose your timezone"
                  icon={Clock}
                  value={settings.timezone}
                  onChange={(value) => handleSettingChange('timezone', value)}
                  options={[
                    { value: 'UTC', label: 'UTC' },
                    { value: 'America/New_York', label: 'Eastern Time' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time' },
                    { value: 'Europe/London', label: 'London' },
                    { value: 'Asia/Tokyo', label: 'Tokyo' }
                  ]}
                />
              </SettingSection>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Save Settings'
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
