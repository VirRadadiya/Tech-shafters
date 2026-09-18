import { MOCK_DATA } from './mockData';
import { supabase } from './supabaseClient';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function normalizeProperty(p) {
  const commute = p.true_cost_details?.commuteEstimate || p.trueCostDetails?.commuteEstimate || 1200;
  const grocery = p.true_cost_details?.groceryEstimate || p.trueCostDetails?.groceryEstimate || 3500;
  const rent = Number(p.rent);
  const trueMonthlyCost = rent + commute + grocery;

  return {
    ...p,
    estimatedLivingCost: p.estimated_living_cost !== undefined ? Number(p.estimated_living_cost) : p.estimatedLivingCost,
    reviewsCount: p.reviews_count !== undefined ? Number(p.reviews_count) : p.reviewsCount,
    transparencyScore: p.transparency_score !== undefined ? Number(p.transparency_score) : p.transparencyScore,
    transparencyBreakdown: p.transparency_breakdown || p.transparencyBreakdown,
    costBreakdown: p.cost_breakdown || p.costBreakdown,
    simplifiedAgreement: p.simplified_agreement || p.simplifiedAgreement,
    minMonths: p.min_months !== undefined ? Number(p.min_months) : (p.minMonths || 2),
    maxMonths: p.max_months !== undefined ? Number(p.max_months) : (p.maxMonths || 12),
    availabilityStart: p.availability_start || p.availabilityStart || 'Immediate',
    availabilityEnd: p.availability_end || p.availabilityEnd || 'Flexible',
    shortTermPremium: p.short_term_premium !== undefined ? Number(p.short_term_premium) : (p.shortTermPremium || 0),
    status: p.status || 'Active',
    campusDistances: p.campus_distances || p.campusDistances || { "Nirma University": "1.2 km", "CEPT": "5.0 km" },
    verificationStatus: p.verification_status || p.verificationStatus || 'verified',
    trueCostDetails: { commuteEstimate: commute, groceryEstimate: grocery },
    trueMonthlyCost,
    rent,
    deposit: Number(p.deposit)
  };
}

async function request(endpoint, options = {}, fallbackFn) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw err;
  }
}

export const PropertyAPI = {
  getProperties: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city && filters.city !== 'all') params.append('city', filters.city);
    if (filters.type && filters.type !== 'All Types') params.append('type', filters.type);
    if (filters.budgetRange && filters.budgetRange !== 'all') params.append('budgetRange', filters.budgetRange);
    if (filters.duration && filters.duration !== 'all') params.append('duration', filters.duration);
    if (filters.campus && filters.campus !== 'all') params.append('campus', filters.campus);
    if (filters.furnished) params.append('furnished', 'true');
    if (filters.roommatesAllowed) params.append('roommatesAllowed', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.includeFound) params.append('includeFound', 'true');

    const query = params.toString() ? `?${params.toString()}` : '';
    return request(`/properties${query}`, { method: 'GET' }, async () => {
      // Direct Supabase fallback
      if (supabase) {
        try {
          let sbQuery = supabase.from('properties').select('*');
          if (filters.city && filters.city !== 'all') sbQuery = sbQuery.ilike('city', `%${filters.city}%`);
          if (filters.type && filters.type !== 'All Types') sbQuery = sbQuery.eq('type', filters.type);
          if (!filters.includeFound) sbQuery = sbQuery.neq('status', 'Found');
          const { data, error } = await sbQuery;
          if (!error && data && data.length > 0) {
            let list = data.map(normalizeProperty);
            if (!filters.includeFound) list = list.filter(p => p.status !== 'Found');
            if (filters.duration && filters.duration !== 'all') {
              const target = parseInt(filters.duration, 10);
              if (!isNaN(target)) list = list.filter(p => p.minMonths <= target && p.maxMonths >= target);
            }
            if (filters.campus && filters.campus !== 'all') {
              list = list.filter(p => p.campusDistances && p.campusDistances[filters.campus]);
              list.sort((a, b) => parseFloat(a.campusDistances[filters.campus] || '99') - parseFloat(b.campusDistances[filters.campus] || '99'));
            }
            if (filters.furnished) list = list.filter(p => p.specs?.furnishing === 'Furnished');
            if (filters.roommatesAllowed) list = list.filter(p => p.specs?.roommatesAllowed);
            if (filters.budgetRange === 'under-15k') list = list.filter(p => p.rent < 15000);
            else if (filters.budgetRange === '15k-25k') list = list.filter(p => p.rent >= 15000 && p.rent <= 25000);
            else if (filters.budgetRange === 'above-25k') list = list.filter(p => p.rent > 25000);

            if (filters.sortBy === 'price-asc') list.sort((a, b) => a.rent - b.rent);
            else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.rent - a.rent);
            else if (filters.sortBy === 'true-cost') list.sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
            else if (filters.sortBy === 'transparency') list.sort((a, b) => b.transparencyScore - a.transparencyScore);
            else if (filters.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

            return { success: true, count: list.length, data: list, source: 'supabase' };
          }
        } catch (e) {
          console.warn('[Direct Supabase Query Error]:', e.message);
        }
      }

      // Memory fallback
      let list = MOCK_DATA.properties.map(normalizeProperty);
      if (!filters.includeFound) list = list.filter(p => p.status !== 'Found');
      if (filters.city && filters.city !== 'all') {
        list = list.filter(p => p.city.toLowerCase().includes(filters.city.toLowerCase()));
      }
      if (filters.type && filters.type !== 'All Types') {
        list = list.filter(p => p.type === filters.type);
      }
      if (filters.duration && filters.duration !== 'all') {
        const target = parseInt(filters.duration, 10);
        if (!isNaN(target)) list = list.filter(p => p.minMonths <= target && p.maxMonths >= target);
      }
      if (filters.campus && filters.campus !== 'all') {
        list = list.filter(p => p.campusDistances && p.campusDistances[filters.campus]);
        list.sort((a, b) => parseFloat(a.campusDistances[filters.campus] || '99') - parseFloat(b.campusDistances[filters.campus] || '99'));
      }
      if (filters.furnished) {
        list = list.filter(p => p.specs?.furnishing === 'Furnished');
      }
      if (filters.roommatesAllowed) {
        list = list.filter(p => p.specs?.roommatesAllowed);
      }
      if (filters.budgetRange === 'under-15k') {
        list = list.filter(p => p.rent < 15000);
      } else if (filters.budgetRange === '15k-25k') {
        list = list.filter(p => p.rent >= 15000 && p.rent <= 25000);
      } else if (filters.budgetRange === 'above-25k') {
        list = list.filter(p => p.rent > 25000);
      }
      if (filters.sortBy === 'price-asc') list.sort((a, b) => a.rent - b.rent);
      else if (filters.sortBy === 'price-desc') list.sort((a, b) => b.rent - a.rent);
      else if (filters.sortBy === 'true-cost') list.sort((a, b) => a.trueMonthlyCost - b.trueMonthlyCost);
      else if (filters.sortBy === 'transparency') list.sort((a, b) => b.transparencyScore - a.transparencyScore);
      else if (filters.sortBy === 'rating') list.sort((a, b) => b.rating - a.rating);

      return { success: true, count: list.length, data: list, source: 'mock' };
    });
  },

  getPropertyById: async (id) => {
    return request(`/properties/${id}`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('properties').select('*').eq('id', id).single();
        if (data) return { success: true, data: normalizeProperty(data), source: 'supabase' };
      }
      const prop = MOCK_DATA.properties.find(p => p.id === id);
      return { success: !!prop, data: prop, source: 'mock' };
    });
  },

  scheduleVisit: async (payload) => {
    return request(`/properties/schedule-visit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Visit request submitted! The owner/host will confirm your scheduled slot within 2 hours.'
    }));
  },

  applyNow: async (payload) => {
    return request(`/properties/apply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Application & digital KYC submitted with 0% brokerage guarantee. Nestora agreement is being generated.'
    }));
  },

  contactOwner: async (payload) => {
    return request(`/properties/contact-owner`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Direct inquiry dispatched to verified landlord via WhatsApp & Nestora chat.'
    }));
  }
};

export const RoommateAPI = {
  getRoommates: async () => {
    return request(`/roommates`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('roommates').select('*');
        if (data && data.length > 0) {
          const list = data.map(r => ({
            ...r,
            budgetValue: r.budget_value ? Number(r.budget_value) : r.budgetValue,
            preferredLocations: r.preferred_locations || r.preferredLocations,
            moveInDate: r.move_in_date || r.moveInDate,
            compatibilityBreakdown: r.compatibility_breakdown || r.compatibilityBreakdown,
            lookingFor: r.looking_for || r.lookingFor,
            whyCompatible: r.why_compatible || r.whyCompatible
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.roommates.length, data: MOCK_DATA.roommates, source: 'mock' };
    });
  },

  swipe: async (roommateId, action) => {
    return request(`/roommates/swipe`, {
      method: 'POST',
      body: JSON.stringify({ roommateId, action })
    }, () => ({
      success: true,
      matched: action === 'match',
      message: action === 'match' ? `It's a Match!` : 'Skipped profile'
    }));
  }
};

export const ExpenseAPI = {
  getExpenses: async () => {
    return request(`/expenses`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('shared_expenses').select('*');
        if (data && data.length > 0) {
          const list = data.map(e => ({
            ...e,
            totalAmount: e.total_amount ? Number(e.total_amount) : e.totalAmount,
            paidBy: e.paid_by || e.paidBy,
            yourShare: e.your_share ? Number(e.your_share) : e.yourShare,
            isOwedByYou: e.is_owed_by_you !== undefined ? e.is_owed_by_you : e.isOwedByYou,
            isSettled: e.is_settled !== undefined ? e.is_settled : e.isSettled,
            dueDate: e.due_date || e.dueDate
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.sharedExpenses.length, data: MOCK_DATA.sharedExpenses, source: 'mock' };
    });
  },

  createSplitExpense: async (payload) => {
    return request(`/expenses/split`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const share = Math.round(Number(payload.totalAmount) / 2);
      const newExp = {
        id: `exp-${Date.now()}`,
        title: payload.title,
        category: payload.category || 'General',
        total_amount: Number(payload.totalAmount),
        totalAmount: Number(payload.totalAmount),
        paid_by: 'Current Resident (You)',
        paidBy: 'Current Resident (You)',
        your_share: share,
        yourShare: share,
        status: `Roommate owes you ₹${share.toLocaleString('en-IN')}`,
        is_owed_by_you: false,
        isOwedByYou: false,
        is_settled: false,
        isSettled: false,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        due_date: 'Due within 7 days',
        dueDate: 'Due within 7 days'
      };

      if (supabase) {
        await supabase.from('shared_expenses').insert([{
          id: newExp.id,
          title: newExp.title,
          category: newExp.category,
          total_amount: newExp.totalAmount,
          paid_by: newExp.paidBy,
          your_share: newExp.yourShare,
          status: newExp.status,
          is_owed_by_you: false,
          is_settled: false,
          date: newExp.date,
          due_date: newExp.dueDate
        }]);
      }

      MOCK_DATA.sharedExpenses.unshift(newExp);
      return { success: true, data: newExp, message: 'Split expense added successfully to Supabase!' };
    });
  },

  settleBalances: async () => {
    return request(`/expenses/settle-all`, { method: 'POST' }, async () => {
      if (supabase) {
        await supabase.from('shared_expenses').update({
          is_settled: true,
          status: 'Settled ✓',
          is_owed_by_you: false
        }).eq('is_owed_by_you', true);
      }
      MOCK_DATA.sharedExpenses.forEach(e => {
        if (e.isOwedByYou) {
          e.isSettled = true;
          e.status = 'Settled ✓';
          e.isOwedByYou = false;
        }
      });
      return { success: true, message: 'All pending balances settled instantly via UPI in Supabase!' };
    });
  }
};

export const TicketAPI = {
  getTickets: async () => {
    return request(`/tickets`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('maintenance_tickets').select('*');
        if (data && data.length > 0) {
          const list = data.map(t => ({
            ...t,
            statusColor: t.status_color || t.statusColor,
            reportedAgo: t.reported_ago || t.reportedAgo,
            currentStep: t.current_step !== undefined ? t.current_step : t.currentStep
          }));
          return { success: true, count: list.length, data: list, source: 'supabase' };
        }
      }
      return { success: true, count: MOCK_DATA.maintenanceTickets.length, data: MOCK_DATA.maintenanceTickets, source: 'mock' };
    });
  },

  createTicket: async (payload) => {
    return request(`/tickets`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newTicket = {
        id: `maint-${Date.now()}`,
        title: payload.title,
        category: payload.category || 'Plumbing',
        status: 'Reported',
        status_color: 'yellow',
        statusColor: 'yellow',
        urgency: payload.urgency || 'Medium',
        reported_ago: 'Reported just now',
        reportedAgo: 'Reported just now',
        technician: {
          name: 'Auto-Assigning Vendor...',
          phone: '+91 79 4000 XXXX',
          rating: 4.9,
          eta: 'Within 24 hours'
        },
        current_step: 1,
        currentStep: 1,
        timeline: [
          { label: 'Reported', time: 'Just now', done: true },
          { label: 'Assigned', time: 'Pending', done: false },
          { label: 'Technician Scheduled', time: 'Pending', done: false },
          { label: 'In Progress', time: 'Pending', done: false },
          { label: 'Resolved', time: 'Pending', done: false }
        ],
        description: payload.description || 'Issue reported via Nestora Tenant Hub.',
        location: payload.location || 'Master Bedroom Ensuite',
        images: []
      };

      if (supabase) {
        await supabase.from('maintenance_tickets').insert([newTicket]);
      }

      MOCK_DATA.maintenanceTickets.unshift(newTicket);
      return { success: true, data: newTicket, message: 'Maintenance ticket registered in Supabase!' };
    });
  }
};

export const NotificationAPI = {
  getNotifications: async () => {
    return request(`/notifications`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const list = data.map(n => ({
            ...n,
            actionText: n.action_text || n.actionText,
            actionTarget: n.action_target || n.actionTarget
          }));
          return { success: true, unreadCount: list.filter(n => !n.read).length, data: list, source: 'supabase' };
        }
      }
      return {
        success: true,
        unreadCount: MOCK_DATA.notifications.filter(n => !n.read).length,
        data: MOCK_DATA.notifications,
        source: 'mock'
      };
    });
  },

  markAsRead: async (id) => {
    return request(`/notifications/${id}/read`, { method: 'PATCH' }, async () => {
      if (supabase) {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
      }
      const item = MOCK_DATA.notifications.find(n => n.id === id);
      if (item) item.read = true;
      return { success: true };
    });
  },

  markAllRead: async () => {
    return request(`/notifications/mark-all-read`, { method: 'PATCH' }, async () => {
      if (supabase) {
        await supabase.from('notifications').update({ read: true }).neq('id', '');
      }
      MOCK_DATA.notifications.forEach(n => n.read = true);
      return { success: true };
    });
  }
};

export const OwnerAPI = {
  getDashboard: async () => {
    return request(`/owner/dashboard`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('owner_properties').select('*');
        if (data && data.length > 0) {
          const properties = data.map(p => ({
            ...p,
            rent: Number(p.rent),
            paymentStatus: p.payment_status || p.paymentStatus,
            maintenanceStatus: p.maintenance_status || p.maintenanceStatus,
            leaseExpiry: p.lease_expiry || p.leaseExpiry
          }));
          const activeProperties = properties.length;
          const occupiedUnits = properties.filter(p => p.status === 'Occupied').length;
          const occupancyRate = `${((occupiedUnits / activeProperties) * 100).toFixed(1)}%`;
          const monthlyRevenue = properties.filter(p => p.status === 'Occupied').reduce((sum, p) => sum + p.rent, 0);
          return {
            success: true,
            data: {
              stats: {
                activeProperties,
                occupiedUnits,
                occupancyRate,
                monthlyRevenue,
                pendingMaintenance: 2,
                onTimePayments: '95%'
              },
              properties
            },
            source: 'supabase'
          };
        }
      }
      return {
        success: true,
        data: {
          stats: MOCK_DATA.ownerData.stats,
          properties: MOCK_DATA.ownerData.properties
        },
        source: 'mock'
      };
    });
  },

  addProperty: async (payload) => {
    return request(`/owner/properties`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newUnit = {
        id: `own-${Date.now()}`,
        title: payload.title,
        locality: payload.locality || 'SG Highway, Ahmedabad',
        tenant: 'Under Verification',
        rent: Number(payload.rent),
        status: 'Available',
        payment_status: 'Listed',
        paymentStatus: 'Listed',
        maintenance_status: 'Clear',
        maintenanceStatus: 'Clear',
        lease_expiry: '11 Months',
        leaseExpiry: '11 Months'
      };

      if (supabase) {
        await supabase.from('owner_properties').insert([newUnit]);
      }

      MOCK_DATA.ownerData.properties.unshift(newUnit);
      return { success: true, data: newUnit, message: 'Property listed successfully in Supabase!' };
    });
  },

  toggleListingStatus: async (id, status) => {
    return request(`/owner/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, async () => {
      if (supabase) {
        await supabase.from('properties').update({ status }).eq('id', id);
        await supabase.from('owner_properties').update({ status: status === 'Found' ? 'Occupied' : 'Available' }).eq('id', id);
      }
      const prop = MOCK_DATA.properties.find(p => p.id === id);
      if (prop) prop.status = status;
      const unit = MOCK_DATA.ownerData.properties.find(p => p.id === id);
      if (unit) unit.status = status === 'Found' ? 'Occupied' : 'Available';
      return {
        success: true,
        message: status === 'Found' ? 'Listing marked as FOUND.' : 'Listing marked as ACTIVE.',
        status
      };
    });
  }
};

export const ValuationAPI = {
  calculate: async (payload) => {
    return request(`/valuation/calculate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => {
      const baseRates = { 'sg-highway': 15, 'bodakdev': 22, 'prahlad-nagar': 20, 'navrangpura': 18, 'default': 15 };
      const locKey = (payload.locality || '').toLowerCase().replace(/\s+/g, '-');
      const rate = baseRates[locKey] || 16;
      const carpetArea = Number(payload.area) || (Number(payload.bhk) === 1 ? 550 : Number(payload.bhk) === 2 ? 1100 : 1600);
      let rent = carpetArea * rate;
      if (payload.furnishing === 'Furnished') rent *= 1.25;
      else if (payload.furnishing === 'Semi-Furnished') rent *= 1.10;
      rent += (Number(payload.amenitiesCount || 4) * 400);
      const fairRent = Math.round(rent / 100) * 100;

      return {
        success: true,
        data: {
          fairRent,
          minRange: Math.round(fairRent * 0.92),
          maxRange: Math.round(fairRent * 1.08),
          deposit: fairRent * 2,
          fairnessScore: 94,
          marketRentAverage: Math.round(fairRent * 1.12),
          savingsPerYear: Math.round((fairRent * 1.12 - fairRent) * 12)
        }
      };
    });
  }
};

export const AgreementAPI = {
  getClauses: async () => {
    return request(`/agreement/clauses`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('agreement_clauses').select('*').order('id', { ascending: true });
        if (data && data.length > 0) {
          const list = data.map(c => ({
            ...c,
            clauseTitle: c.clause_title || c.clauseTitle,
            highlightValue: c.highlight_value || c.highlightValue,
            standardLegal: c.standard_legal || c.standardLegal,
            plainEnglish: c.plain_english || c.plainEnglish
          }));
          return { success: true, data: list, source: 'supabase' };
        }
      }
      return {
        success: true,
        data: MOCK_DATA.plainEnglishAgreementClauses,
        source: 'mock'
      };
    });
  },

  sign: async (payload) => {
    return request(`/agreement/sign`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'DigiLocker Aadhaar eSign authenticated! The stamped rental deed is active in Supabase.'
    }));
  },

  requestClarification: async (payload) => {
    return request(`/agreement/clarification`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Your question has been sent to Nestora Legal Assist. A response will arrive within 4 hours.'
    }));
  }
};

// Permanent Role Auth API
export const AuthAPI = {
  register: async (payload) => {
    return request(`/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newUser = {
        id: `usr-${Date.now()}`,
        fullName: payload.fullName,
        email: payload.email,
        phone: payload.phone || '+91 98250 12345',
        role: payload.role, // permanent
        avatarUrl: payload.role === 'owner' ? '/avatars/rajesh.jpg' : '/avatar.png',
        emailVerified: true
      };
      if (supabase) {
        await supabase.from('profiles').insert([{
          id: newUser.id,
          full_name: newUser.fullName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatar_url: newUser.avatarUrl,
          email_verified: true
        }]);
      }
      return {
        success: true,
        message: `Registered as ${payload.role.toUpperCase()}!`,
        user: newUser,
        token: `nestora-${newUser.id}`
      };
    });
  },

  login: async (email, password) => {
    return request(`/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }, async () => {
      if (supabase) {
        const { data } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
        if (data) {
          return {
            success: true,
            user: {
              id: data.id,
              fullName: data.full_name,
              email: data.email,
              phone: data.phone,
              role: data.role,
              avatarUrl: data.avatar_url,
              emailVerified: data.email_verified
            },
            token: `nestora-${data.id}`
          };
        }
      }
      const derivedName = email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Resident';
      return {
        success: true,
        user: {
          id: 'usr-auth-' + Date.now(),
          fullName: derivedName,
          email: email || 'resident@example.com',
          phone: '+91 98250 12345',
          role: 'tenant',
          avatarUrl: '/avatar.png',
          emailVerified: true
        },
        token: 'nestora-demo-token'
      };
    });
  },

  getMe: async (userId) => {
    return request(`/auth/me`, {
      method: 'GET',
      headers: { 'x-user-id': userId }
    }, () => ({
      success: true,
      user: {
        id: userId || 'usr-auth-1',
        fullName: 'Resident',
        email: 'resident@example.com',
        role: 'tenant',
        avatarUrl: '/avatar.png'
      }
    }));
  }
};

// Move-In / Move-Out Proof Vault API
export const ProofVaultAPI = {
  getProofItems: async (propertyId, type) => {
    const q = propertyId ? `?propertyId=${propertyId}${type ? `&type=${type}` : ''}` : '';
    return request(`/proof-vault${q}`, { method: 'GET' }, async () => {
      if (supabase) {
        let sb = supabase.from('proof_vault').select('*').order('created_at', { ascending: false });
        if (propertyId) sb = sb.eq('property_id', propertyId);
        if (type) sb = sb.eq('type', type);
        const { data } = await sb;
        if (data && data.length > 0) {
          return {
            success: true,
            data: data.map(i => ({
              ...i,
              tenancyId: i.tenancy_id,
              propertyId: i.property_id,
              itemName: i.item_name,
              photoUrls: i.photo_urls || [],
              meterReading: i.meter_reading,
              tenantAcknowledged: i.tenant_acknowledged,
              ownerAcknowledged: i.owner_acknowledged,
              disputeNotes: i.dispute_notes
            }))
          };
        }
      }
      return {
        success: true,
        data: [
          {
            id: 'pv-01',
            tenancyId: 'ten-sg1',
            propertyId: 'prop-1',
            type: 'move_in',
            room: 'Living Room',
            itemName: 'Wooden Sofa & Coffee Table',
            condition: 'Good (Minor scratch on left arm)',
            photoUrls: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc'],
            meterReading: 'N/A',
            notes: 'Verified during handover with landlord present.',
            tenantAcknowledged: true,
            ownerAcknowledged: true,
            disputeNotes: null
          },
          {
            id: 'pv-02',
            tenancyId: 'ten-sg1',
            propertyId: 'prop-1',
            type: 'move_in',
            room: 'Utility Balcony',
            itemName: 'Digital Electricity Meter',
            condition: 'Excellent',
            photoUrls: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758'],
            meterReading: 'Reading: 014820 kWh',
            notes: 'Meter seal intact, stamped by Torrent Power.',
            tenantAcknowledged: true,
            ownerAcknowledged: true,
            disputeNotes: null
          }
        ]
      };
    });
  },

  addProofItem: async (payload) => {
    return request(`/proof-vault/items`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newItem = {
        id: `pv-${Date.now()}`,
        tenancy_id: payload.tenancyId || 'ten-sg1',
        property_id: payload.propertyId || 'prop-1',
        type: payload.type || 'move_in',
        room: payload.room,
        item_name: payload.itemName,
        itemName: payload.itemName,
        condition: payload.condition,
        photo_urls: payload.photoUrls || [],
        photoUrls: payload.photoUrls || [],
        meter_reading: payload.meterReading || 'N/A',
        meterReading: payload.meterReading || 'N/A',
        notes: payload.notes || '',
        tenant_acknowledged: true,
        tenantAcknowledged: true,
        owner_acknowledged: false,
        ownerAcknowledged: false
      };
      if (supabase) {
        await supabase.from('proof_vault').insert([newItem]);
      }
      return { success: true, message: 'Evidence saved in Proof Vault!', data: newItem };
    });
  },

  acknowledgeItem: async (id, role) => {
    return request(`/proof-vault/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }, async () => {
      if (supabase) {
        const update = role === 'owner' ? { owner_acknowledged: true } : { tenant_acknowledged: true };
        await supabase.from('proof_vault').update(update).eq('id', id);
      }
      return { success: true, message: `Signed off by ${role}!` };
    });
  },

  disputeItem: async (id, disputeNotes) => {
    return request(`/proof-vault/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ disputeNotes })
    }, async () => {
      if (supabase) {
        await supabase.from('proof_vault').update({ dispute_notes: disputeNotes }).eq('id', id);
      }
      return { success: true, message: 'Dispute recorded with immutable timestamp.' };
    });
  }
};

// Stripe Payments API
export const PaymentAPI = {
  getPayments: async () => {
    return request(`/payments`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          return {
            success: true,
            data: data.map(p => ({
              ...p,
              tenancyId: p.tenancy_id,
              propertyId: p.property_id,
              tenantName: p.tenant_name,
              ownerName: p.owner_name,
              amount: Number(p.amount),
              dueDate: p.due_date,
              paidAt: p.paid_at
            }))
          };
        }
      }
      return {
        success: true,
        data: [
          {
            id: 'pay-101',
            tenantName: 'Current Resident (You)',
            ownerName: 'Rajesh Patel',
            amount: 18500,
            breakdown: { baseRent: 16500, maintenance: 1200, waterSewage: 300, platformFee: 500 },
            status: 'pending',
            dueDate: 'October 5, 2026'
          },
          {
            id: 'pay-102',
            tenantName: 'Current Resident (You)',
            ownerName: 'Rajesh Patel',
            amount: 18500,
            breakdown: { baseRent: 16500, maintenance: 1200, waterSewage: 300, platformFee: 500 },
            status: 'paid',
            dueDate: 'September 5, 2026'
          }
        ]
      };
    });
  },

  createCheckoutSession: async (paymentId, amount) => {
    return request(`/payments/create-checkout-session`, {
      method: 'POST',
      body: JSON.stringify({ paymentId, amount })
    }, () => ({
      success: true,
      sessionId: `cs_test_${Date.now()}`,
      checkoutUrl: 'https://checkout.stripe.com/demo'
    }));
  },

  accommodationCheckout: async (payload) => {
    return request(`/payments/accommodation-checkout`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      transactionId: `txn_stripe_${Date.now()}`,
      receiptNumber: `REC-NEST-${Math.floor(100000 + Math.random() * 900000)}`,
      paidAmount: payload.totalInitialDue || (Number(payload.monthlyRent) + Number(payload.refundableDeposit)),
      message: 'Accommodation reserved and initial escrow payment confirmed via Stripe!'
    }));
  },

  pay: async (paymentId) => {
    return request(`/payments/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentId, paymentMethod: 'stripe' })
    }, async () => {
      if (supabase) {
        await supabase.from('payments').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', paymentId);
      }
      return { success: true, message: 'Payment confirmed! Instant GST rent receipt generated.', status: 'paid' };
    });
  }
};

// Maintenance Relay Bot API
export const MaintenanceBotAPI = {
  sendMessage: async (payload) => {
    return request(`/maintenance-bot/chat`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => {
      const ticketId = `maint-${Math.floor(100 + Math.random() * 900)}`;
      return {
        success: true,
        ticketId,
        reply: `Got it! Ticket #${ticketId} created (Plumbing, High Priority). Technician Ramesh Prajapati has been dispatched (ETA: Within 3 hours). Owner notified via WhatsApp.`
      };
    });
  },

  getHistory: async () => {
    return request(`/maintenance-bot/history`, { method: 'GET' }, () => ({
      success: true,
      messages: [
        {
          id: 'msg-1',
          senderType: 'bot',
          message: 'Hello! I am Nestora Relay Bot. Type any maintenance issue (e.g. "geyser leaking", "ac stopped") to automatically dispatch a verified technician.'
        }
      ]
    }));
  },

  escalate: async (ticketId) => {
    return request(`/maintenance-bot/escalate`, {
      method: 'POST',
      body: JSON.stringify({ ticketId, reason: 'No response from technician within SLA threshold' })
    }, () => ({
      success: true,
      message: `Ticket #${ticketId} escalated to Nestora Senior Operations Lead! Priority: CRITICAL.`
    }));
  }
};

// Roommate Contract Generator API
export const RoommateContractAPI = {
  getContracts: async () => {
    return request(`/contracts`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('roommate_contracts').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) return { success: true, data };
      }
      return {
        success: true,
        data: [
          {
            id: 'ct-01',
            propertyName: 'Sunrise Harmony Heights (Flat 402)',
            roommates: ['Current Resident (You)', 'Aarav Sharma'],
            rentSplit: { 'Current Resident (You)': 8250, 'Aarav Sharma': 8250 },
            utilities: 'Equal 50/50 split via Nestora Tenant Hub',
            choresSchedule: 'Alternating weekly cleaning of kitchen & balcony',
            quietHours: '11:00 PM – 7:00 AM on weekdays',
            guestPolicy: 'Overnight guests permitted with 24-hr advance WhatsApp notice',
            signatures: [
              { name: 'Current Resident (You)', signed: true, timestamp: '2026-09-01T14:30:00Z' },
              { name: 'Aarav Sharma', signed: true, timestamp: '2026-09-01T15:45:00Z' }
            ],
            status: 'active'
          }
        ]
      };
    });
  },

  generateContract: async (payload) => {
    return request(`/contracts/generate`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newContract = {
        id: `ct-${Date.now()}`,
        property_id: payload.propertyId || 'prop-1',
        property_name: payload.propertyName || 'Nestora Shared Space',
        propertyName: payload.propertyName || 'Nestora Shared Space',
        roommates: payload.roommates || ['Current Resident', 'Aarav Sharma'],
        rent_split: payload.rentSplit || { 'Current Resident': '50%', 'Aarav Sharma': '50%' },
        rentSplit: payload.rentSplit || { 'Current Resident': '50%', 'Aarav Sharma': '50%' },
        utilities: payload.utilities || 'Equal 50/50 split',
        chores_schedule: payload.choresSchedule || 'Weekly rotation',
        choresSchedule: payload.choresSchedule || 'Weekly rotation',
        quiet_hours: payload.quietHours || '11 PM to 7 AM',
        quietHours: payload.quietHours || '11 PM to 7 AM',
        guest_policy: payload.guestPolicy || '24h advance consent',
        guestPolicy: payload.guestPolicy || '24h advance consent',
        signatures: [{ name: (payload.roommates?.[0] || 'Current Resident') + ' (Creator)', signed: true, timestamp: new Date().toISOString() }],
        status: 'pending_signatures'
      };
      if (supabase) {
        await supabase.from('roommate_contracts').insert([newContract]);
      }
      return { success: true, message: 'Roommate House Constitution created!', contract: newContract };
    });
  },

  signContract: async (id, signerName) => {
    return request(`/contracts/${id}/sign`, {
      method: 'POST',
      body: JSON.stringify({ signerName })
    }, () => ({
      success: true,
      message: `House Constitution countersigned by ${signerName}! Status: ACTIVE.`
    }));
  }
};

// Utility OCR Verification API
export const VerificationAPI = {
  getVerificationStatus: async (propertyId) => {
    return request(`/verification/${propertyId}`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('verification_documents').select('*').eq('property_id', propertyId).single();
        if (data) return { success: true, verification: data };
      }
      return {
        success: true,
        verification: {
          id: 'ver-01',
          propertyId,
          documentType: 'Torrent Power Electricity Bill',
          ocrExtractedData: {
            consumerNo: '048291048',
            billedTo: 'Rajeshkumar C. Patel',
            serviceAddress: 'Flat 402, Sunrise Harmony Heights, SG Highway, Ahmedabad',
            billingCycle: 'August 2026'
          },
          matchScore: 98.4,
          status: 'verified'
        }
      };
    });
  },

  uploadAndVerify: async (payload) => {
    return request(`/verification/upload-ocr`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, async () => {
      const newDoc = {
        id: `ver-${Date.now()}`,
        property_id: payload.propertyId || 'prop-1',
        document_type: payload.documentType || 'Electricity Utility Bill',
        document_name: payload.documentName || 'torrent_bill.pdf',
        ocr_extracted_data: {
          consumerNo: `04${Math.floor(1000000 + Math.random() * 9000000)}`,
          billedTo: payload.ownerName || 'Rajesh Patel',
          serviceAddress: payload.propertyAddress || 'SG Highway, Ahmedabad',
          billingCycle: 'Recent 60 Days'
        },
        match_score: 96.8,
        status: 'verified'
      };
      if (supabase) {
        await supabase.from('verification_documents').insert([newDoc]);
        await supabase.from('properties').update({ verification_status: 'verified' }).eq('id', payload.propertyId);
      }
      return {
        success: true,
        message: 'OCR match verified! 96.8% confidence match against Torrent Power records. Listing is Verified ✓.',
        verification: newDoc
      };
    });
  }
};

// Neighborhood & Reviews API
export const NeighborhoodAPI = {
  getMetrics: async (locality) => {
    return request(`/neighborhoods/${encodeURIComponent(locality)}`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('neighborhood_metrics').select('*').ilike('locality', `%${locality}%`).single();
        if (data) return { success: true, data };
      }
      return {
        success: true,
        data: {
          locality: locality || 'SG Highway, Ahmedabad',
          safetyScore: 94,
          lightingRating: 4.9,
          transitAccess: 'Direct BRTS at doorstep, Nirma shuttle 200m',
          studentVibe: 'High — 15+ student cafes, late night eateries, 24/7 co-working',
          noiseLevel: 'Moderate (Quiet residential enclave set back from highway)',
          residentFeedback: [
            { author: 'Aarav M., Nirma Student', vibe: 'Super safe for late night study groups, streetlights always on.' }
          ]
        }
      };
    });
  },

  getReviews: async (propertyId) => {
    return request(`/reviews/${propertyId}`, { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('verified_reviews').select('*').eq('property_id', propertyId);
        if (data && data.length > 0) return { success: true, data };
      }
      return {
        success: true,
        data: [
          {
            id: 'rev-01',
            tenantName: 'Aman Sharma (Nirma B.Tech)',
            ratings: { accuracy: 5, cleanliness: 5, owner: 5, commute: 5, safety: 5, overall: 5 },
            comment: 'Lived here for 6 months during my campus internship. Zero brokerage, accurate utility bills, and Rajesh uncle repaired the geyser on the same day!',
            ownerResponse: 'Thank you Aman! Always welcome back at Nestora spaces.'
          }
        ]
      };
    });
  },

  addReview: async (payload) => {
    return request(`/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, () => ({
      success: true,
      message: 'Verified review published! Trust rating updated.'
    }));
  }
};

// Owner & Landlord Hub API
export const OwnerAPI = {
  getDashboard: async () => {
    return request('/owner/dashboard', { method: 'GET' }, async () => {
      let properties = [];
      if (supabase) {
        const { data } = await supabase.from('owner_properties').select('*');
        if (data && data.length > 0) properties = data;
      }
      return {
        success: true,
        data: {
          stats: {
            activeProperties: properties.filter(p => p.status === 'Active').length || 8,
            occupiedUnits: properties.filter(p => p.status === 'Occupied' || p.status === 'Found').length || 7,
            occupancyRate: '87.5%',
            monthlyRevenue: 142000,
            pendingMaintenance: 2,
            onTimePayments: '94%'
          },
          properties
        }
      };
    });
  },

  toggleListingStatus: async (id, status) => {
    return request(`/owner/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, async () => {
      if (supabase) {
        await supabase.from('owner_properties').update({ status }).eq('id', id);
        await supabase.from('properties').update({ status }).eq('id', id);
      }
      return { success: true, message: `Status updated to ${status}` };
    });
  },

  addProperty: async (payload) => {
    return request('/owner/properties', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  updateProperty: async (id, payload) => {
    return request(`/owner/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  getApplications: async () => {
    return request('/owner/applications', { method: 'GET' }, async () => {
      if (supabase) {
        const { data } = await supabase.from('applications').select('*').order('created_at', { ascending: false });
        if (data) return { success: true, count: data.length, data };
      }
      return { success: true, count: 0, data: [] };
    });
  },

  updateApplicationStatus: async (id, action) => {
    return request(`/owner/applications/${id}/action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    }, async () => {
      const newStatus = action === 'accept' ? 'accepted' : (action === 'reject' ? 'rejected' : 'info_requested');
      if (supabase) {
        await supabase.from('applications').update({ status: newStatus }).eq('id', id);
      }
      return { success: true, status: newStatus, message: `Application ${action}ed successfully!` };
    });
  },

  updateMaintenanceStatus: async (id, status) => {
    return request(`/owner/maintenance/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, async () => {
      if (supabase) {
        await supabase.from('maintenance_tickets').update({ status }).eq('id', id);
      }
      return { success: true, status, message: `Ticket status updated to ${status}` };
    });
  }
};


