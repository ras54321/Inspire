import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiHome, 
  HiUser, 
  HiUserGroup, 
  HiChat, 
  HiCog, 
  HiSearch,
  HiBell,
  HiMenu,
  HiX,
  HiShieldCheck,
  HiTrendingUp,
  HiBookmark,
  HiCalendar
} from 'react-icons/hi';
import DarkModeToggle from '../UI/DarkModeToggle';
import Notifications from '../UI/Notifications';

const AppLayout = ({ children }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/', icon: HiHome },
    { name: 'Explore', href: '/explore', icon: HiTrendingUp },
    { name: 'Users', href: '/users', icon: HiUserGroup },
    { name: 'Groups', href: '/groups', icon: HiUserGroup },
    { name: 'Messages', href: '/messages', icon: HiChat },
    { name: 'Events', href: '/events', icon: HiCalendar },
    { name: 'Saved', href: '/saved', icon: HiBookmark },
    { name: 'AI Chat', href: '/ai-chat', icon: HiChat },
    { name: 'Analytics', href: '/analytics', icon: HiTrendingUp },
    { name: 'Admin', href: '/admin', icon: HiShieldCheck },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 lg:hidden transition-all duration-300 ${
          isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-white dark:bg-gray-900'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
          </button>
          
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inspire
          </h1>
          
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Notifications />
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: isMobileMenuOpen ? 0 : -300,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 overflow-y-auto lg:translate-x-0 lg:static lg:h-screen transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 hidden lg:flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">I</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inspire
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <button
            onClick={() => router.push('/search')}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <HiSearch className="w-5 h-5" />
            <span className="text-sm">Search...</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 pb-4">
          <ul className="space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    router.push(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.href) ? '' : 'group-hover:scale-110'} transition-transform`} />
                  <span className="font-medium">{item.name}</span>
                  {isActive(item.href) && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-2 h-2 rounded-full bg-white"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Divider */}
        <div className="mx-4 h-px bg-gray-200 dark:bg-gray-700" />

        {/* Bottom Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">Appearance</span>
            <DarkModeToggle />
          </div>
          
          {/* User Profile Preview */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" onClick={() => router.push('/profile')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <HiUser className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">My Profile</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">View settings</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="lg:ml-0 pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`hidden lg:flex items-center justify-between px-8 py-4 sticky top-0 z-30 transition-all duration-300 ${
            isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
          }`}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {navigation.find(n => n.href === router.pathname)?.name || 'Inspire'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Notifications />
            <button
              onClick={() => router.push('/create-profile')}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
            >
              Create Profile
            </button>
          </div>
        </motion.header>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="px-4 lg:px-8 py-4 lg:py-8 max-w-7xl mx-auto"
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden z-50 safe-bottom">
        <div className="flex justify-around items-center py-2">
          {[
            { href: '/', icon: HiHome },
            { href: '/explore', icon: HiSearch },
            { href: '/messages', icon: HiChat },
            { href: '/users', icon: HiUserGroup },
            { href: '/profile', icon: HiUser },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Safe Area Padding */}
      <div className="h-20 lg:hidden" />
    </div>
  );
};

export default AppLayout;
