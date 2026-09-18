const supabase = require('../config/supabase');

// In-memory fallback profiles
const localProfiles = [
  {
    id: 'usr-tenant-1',
    fullName: 'Het Darji',
    email: 'het.darji@nirmauni.ac.in',
    phone: '+91 98250 12345',
    role: 'tenant',
    avatarUrl: '/avatars/het.jpg',
    emailVerified: true
  },
  {
    id: 'usr-owner-1',
    fullName: 'Rajesh Patel',
    email: 'rajesh.patel@nestora.in',
    phone: '+91 94260 54321',
    role: 'owner',
    avatarUrl: '/avatars/rajesh.jpg',
    emailVerified: true
  }
];

// POST /api/auth/register
// Role is chosen BEFORE signup and is permanent
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields including permanent role are required.' });
    }

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be either tenant or owner.' });
    }

    const newProfile = {
      id: `usr-${Date.now()}`,
      full_name: fullName,
      fullName,
      email: email.toLowerCase(),
      phone: phone || '',
      role, // Permanent role
      avatar_url: role === 'owner' ? '/avatars/rajesh.jpg' : '/avatars/het.jpg',
      avatarUrl: role === 'owner' ? '/avatars/rajesh.jpg' : '/avatars/het.jpg',
      email_verified: true,
      emailVerified: true,
      created_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        await supabase.from('profiles').insert([{
          id: newProfile.id,
          full_name: newProfile.full_name,
          email: newProfile.email,
          phone: newProfile.phone,
          role: newProfile.role,
          avatar_url: newProfile.avatar_url,
          email_verified: true
        }]);
      } catch (err) {
        console.warn('[Supabase Profile Insert Error]:', err.message);
      }
    }

    localProfiles.push(newProfile);

    return res.status(201).json({
      success: true,
      message: `Account created successfully with permanent role: ${role.toUpperCase()}!`,
      user: {
        id: newProfile.id,
        fullName: newProfile.fullName,
        email: newProfile.email,
        phone: newProfile.phone,
        role: newProfile.role,
        avatarUrl: newProfile.avatarUrl,
        emailVerified: true
      },
      token: `nestora-token-${newProfile.id}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    let user = null;

    if (supabase) {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('email', email.toLowerCase()).single();
        if (data) {
          user = {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            avatarUrl: data.avatar_url,
            emailVerified: data.email_verified
          };
        }
      } catch (e) {
        console.warn('[Supabase Login Query]:', e.message);
      }
    }

    if (!user) {
      user = localProfiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    if (!user) {
      // Default to Het Darji if demo credentials or not found
      user = localProfiles[0];
    }

    return res.json({
      success: true,
      message: 'Signed in successfully!',
      user,
      token: `nestora-token-${user.id}`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'usr-tenant-1';
    let profile = null;

    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (data) {
        profile = {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone,
          role: data.role, // strictly permanent
          avatarUrl: data.avatar_url,
          emailVerified: data.email_verified
        };
      }
    }

    if (!profile) {
      profile = localProfiles.find(p => p.id === userId) || localProfiles[0];
    }

    return res.json({ success: true, user: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
