'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { NotificationAPI } from '../services/api';
import { supabase } from '../services/supabaseClient';

export function getDefaultAvatar(gender) {
  const g = (gender || '').toString().toLowerCase().trim();
  if (g === 'female') return '/avatars/avatar-female.png';
  if (g === 'male') return '/avatar.png';
  return '/avatars/avatar-neutral.svg';
}

export function isCustomAvatar(avatar) {
  if (!avatar || typeof avatar !== 'string') return false;
  const a = avatar.toLowerCase().trim();
  if (!a) return false;
  const defaultPlaceholders = [
    'pngtree',
    'avatar-male',
    'avatar-female',
    'avatar-neutral',
    '/avatar.png',
    'avatar.png',
    'photo-1507003211169-0a1dd7228f2d',
    'photo-1534528741775-53994a69daeb'
  ];
  return !defaultPlaceholders.some(keyword => a.includes(keyword));
}

export function getProfileAvatar(profile) {
  if (!profile) return getDefaultAvatar(null);
  const custom = profile.avatar_url || profile.avatarUrl || profile.avatar;
  if (isCustomAvatar(custom)) {
    return custom;
  }
  return getDefaultAvatar(profile.gender);
}

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentView, setCurrentView] = useState('landing');
  const [searchPayload, setSearchPayload] = useState(null);

  // Dynamic Authentication & Permanent Role State (Loaded from storage or Supabase)
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('nestora_auth_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!isCustomAvatar(parsed.avatarUrl)) {
            parsed.avatarUrl = getDefaultAvatar(parsed.gender);
          }
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  });

  const [userRole, setUserRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('nestora_permanent_role');
      if (storedRole) return storedRole.toLowerCase() === 'owner' ? 'Owner' : 'Tenant';
    }
    return 'Tenant';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('nestora_auth_user');
    }
    return false;
  });

  // Modals & Drawers
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [matchedRoommate, setMatchedRoommate] = useState(null);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);
  const [isSplitExpenseModalOpen, setIsSplitExpenseModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPayRentModalOpen, setIsPayRentModalOpen] = useState(false);
  const [isMatchCelebrationOpen, setIsMatchCelebrationOpen] = useState(false);

  // New Accommodation Checkout Modal
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutProperty, setCheckoutProperty] = useState(null);

  // Role & Auth Modals
  const [isRoleSelectModalOpen, setIsRoleSelectModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'login'
  const [selectedPreRole, setSelectedPreRole] = useState('tenant'); // 'tenant' | 'owner'
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);
  const [isProofVaultModalOpen, setIsProofVaultModalOpen] = useState(false);
  const [isRoommateContractModalOpen, setIsRoommateContractModalOpen] = useState(false);
  const [isUtilityVerificationModalOpen, setIsUtilityVerificationModalOpen] = useState(false);
  const [isStripePaymentModalOpen, setIsStripePaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Saved Properties
  const [savedProperties, setSavedProperties] = useState(new Set(['prop-1']));

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth management
  const loginUser = (user) => {
    if (!user) return;
    const roleStr = user.role || 'tenant';
    const normalizedRole = roleStr.toLowerCase() === 'owner' ? 'Owner' : 'Tenant';

    const cleanUser = {
      id: user.id || `usr-${Date.now()}`,
      fullName: user.fullName || user.full_name || 'Resident',
      email: user.email || '',
      phone: user.phone || '+91 98250 12345',
      role: roleStr.toLowerCase(),
      gender: user.gender || null,
      dateOfBirth: user.dateOfBirth || user.date_of_birth || null,
      avatarUrl: getProfileAvatar(user),
      emailVerified: true
    };

    setCurrentUser(cleanUser);
    setUserRole(normalizedRole);
    setIsLoggedIn(true);

    if (typeof window !== 'undefined') {
      localStorage.setItem('nestora_auth_user', JSON.stringify(cleanUser));
      localStorage.setItem('nestora_permanent_role', roleStr.toLowerCase());
    }

    showToast(`Greetings, ${cleanUser.fullName}! Signed in as verified ${normalizedRole}.`, 'success');

    // If existing user has missing gender or date_of_birth, prompt them gently via minimal profile completion step
    if (!cleanUser.gender || !cleanUser.dateOfBirth) {
      setTimeout(() => {
        setIsProfileCompletionOpen(true);
      }, 600);
    }
  };

  const updateCurrentUser = (fields) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...fields };
      if (!isCustomAvatar(updated.avatarUrl)) {
        updated.avatarUrl = getDefaultAvatar(updated.gender);
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('nestora_auth_user', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logoutUser = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('Signout error:', e.message);
    }
    setCurrentUser(null);
    setIsLoggedIn(false);
    setUserRole('Tenant');
    setSavedProperties(new Set());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nestora_auth_user');
      localStorage.removeItem('nestora_permanent_role');
      sessionStorage.clear();
    }
    setCurrentView('landing');
    showToast('Signed out of Nestera. All local session data cleared.', 'info');
  };

  // Supabase Auth listener on startup
  useEffect(() => {
    if (!supabase) return;

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Load user profile from Supabase profiles table
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              const roleStr = profile.role || 'tenant';
              const cleanUser = {
                id: profile.id,
                fullName: profile.full_name || 'Resident',
                email: profile.email || session.user.email,
                phone: profile.phone || '',
                role: roleStr,
                gender: profile.gender || null,
                dateOfBirth: profile.date_of_birth || null,
                avatarUrl: getProfileAvatar(profile),
                emailVerified: true
              };
              setCurrentUser(cleanUser);
              setUserRole(roleStr.toLowerCase() === 'owner' ? 'Owner' : 'Tenant');
              setIsLoggedIn(true);
              localStorage.setItem('nestora_auth_user', JSON.stringify(cleanUser));
              localStorage.setItem('nestora_permanent_role', roleStr);
            }
          });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const roleStr = profile.role || 'tenant';
          const cleanUser = {
            id: profile.id,
            fullName: profile.full_name || 'Resident',
            email: profile.email || session.user.email,
            phone: profile.phone || '',
            role: roleStr,
            gender: profile.gender || null,
            dateOfBirth: profile.date_of_birth || null,
            avatarUrl: getProfileAvatar(profile),
            emailVerified: true
          };
          setCurrentUser(cleanUser);
          setUserRole(roleStr.toLowerCase() === 'owner' ? 'Owner' : 'Tenant');
          setIsLoggedIn(true);
          localStorage.setItem('nestora_auth_user', JSON.stringify(cleanUser));
          localStorage.setItem('nestora_permanent_role', roleStr);
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem('nestora_auth_user');
        localStorage.removeItem('nestora_permanent_role');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const openAccommodationCheckout = (prop) => {
    setCheckoutProperty(prop || selectedProperty);
    setIsCheckoutModalOpen(true);
  };

  const closeAccommodationCheckout = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutProperty(null);
  };

  const startOnboarding = () => {
    setIsRoleSelectModalOpen(true);
  };

  // Fetch initial notifications
  const refreshNotifications = async () => {
    try {
      const res = await NotificationAPI.getNotifications();
      if (res && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.read).length);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, []);

  const navigateTo = (viewId, payload = null) => {
    setCurrentView(viewId);
    if (payload) setSearchPayload(payload);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveProperty = (propId) => {
    setSavedProperties(prev => {
      const next = new Set(prev);
      if (next.has(propId)) {
        next.delete(propId);
        showToast('Removed from saved properties');
      } else {
        next.add(propId);
        showToast('Property saved to your shortlist!');
      }
      return next;
    });
  };

  const openPropertyDetails = (prop) => {
    setSelectedProperty(prop);
    setIsPropertyModalOpen(true);
  };

  const closePropertyDetails = () => {
    setIsPropertyModalOpen(false);
  };

  const openRoommateProfile = (roommate) => {
    setSelectedRoommate(roommate);
    setIsRoommateModalOpen(true);
  };

  const closeRoommateProfile = () => {
    setIsRoommateModalOpen(false);
  };

  const triggerMatchCelebration = (roommate) => {
    setMatchedRoommate(roommate);
    setIsMatchCelebrationOpen(true);
  };

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      navigateTo,
      userRole,
      setUserRole,
      currentUser,
      isLoggedIn,
      loginUser,
      logoutUser,
      startOnboarding,
      searchPayload,
      setSearchPayload,

      // Modals
      selectedProperty,
      setSelectedProperty,
      openPropertyDetails,
      closePropertyDetails,
      isPropertyModalOpen,

      selectedRoommate,
      openRoommateProfile,
      closeRoommateProfile,
      isRoommateModalOpen,

      matchedRoommate,
      triggerMatchCelebration,
      isMatchCelebrationOpen,
      setIsMatchCelebrationOpen,

      isSplitExpenseModalOpen,
      setIsSplitExpenseModalOpen,
      isReportIssueModalOpen,
      setIsReportIssueModalOpen,
      isAddPropertyModalOpen,
      setIsAddPropertyModalOpen,
      isNotificationDrawerOpen,
      setIsNotificationDrawerOpen,
      isProfileModalOpen,
      setIsProfileModalOpen,
      isPayRentModalOpen,
      setIsPayRentModalOpen,

      // Accommodation Checkout Modal
      isCheckoutModalOpen,
      setIsCheckoutModalOpen,
      checkoutProperty,
      openAccommodationCheckout,
      closeAccommodationCheckout,

      // Extended Modals
      isRoleSelectModalOpen,
      setIsRoleSelectModalOpen,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authMode,
      setAuthMode,
      selectedPreRole,
      setSelectedPreRole,
      isProfileCompletionOpen,
      setIsProfileCompletionOpen,
      updateCurrentUser,
      isProofVaultModalOpen,
      setIsProofVaultModalOpen,
      isRoommateContractModalOpen,
      setIsRoommateContractModalOpen,
      isUtilityVerificationModalOpen,
      setIsUtilityVerificationModalOpen,
      isStripePaymentModalOpen,
      setIsStripePaymentModalOpen,
      selectedPayment,
      setSelectedPayment,

      // Saved properties
      savedProperties,
      toggleSaveProperty,

      // Notifications
      notifications,
      unreadCount,
      refreshNotifications,

      // Toasts
      toasts,
      showToast,
      removeToast,

      // Avatar Helpers
      getDefaultAvatar,
      isCustomAvatar,
      getProfileAvatar
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
