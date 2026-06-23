import prisma from '../config/prisma.js';

export const login = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });
    if (user) {
      return res.json({ success: true, user });
    }
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

export const register = async (req, res) => {
  const { name, email, role, avatar, skills, certifications, latitude, longitude } = req.body;
  try {
    const exists = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const newUser = await prisma.user.create({
      data: {
        id: `${role}-${Date.now()}`,
        name,
        email: email.toLowerCase(),
        role,
        avatar,
        rating: 5.0,
        reviewCount: 0,
        completedJobs: 0,
        skills: skills || [],
        certifications: certifications || [],
        balance: role === 'poster' ? 5000.0 : 100.0,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
      }
    });

    // Add registration alert notification
    await prisma.notification.create({
      data: {
        id: `notif-${Date.now()}`,
        userId: newUser.id,
        text: `Account successfully created for ${newUser.name}! Welcome to LaborLink.`,
        read: false,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    });

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
};

export const googleLogin = async (req, res) => {
  const { credential, email, name, avatar, isMock } = req.body;

  let targetEmail = '';
  let targetName = '';
  let targetAvatar = '';

  try {
    if (credential && credential !== 'mock_google_token') {
      // Decode JWT token directly to extract Google profile information
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
          const data = JSON.parse(payload);
          targetEmail = data.email;
          targetName = data.name || data.email.split('@')[0];
          targetAvatar = data.picture || '';
        }
      } catch (decodeErr) {
        console.error('Failed to parse Google JWT credential:', decodeErr);
      }

      // If direct parsing failed or is empty, try calling the Google verification API
      if (!targetEmail) {
        try {
          const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
          if (response.ok) {
            const data = await response.json();
            targetEmail = data.email;
            targetName = data.name || data.email.split('@')[0];
            targetAvatar = data.picture || '';
          }
        } catch (fetchErr) {
          console.error('Error fetching Google tokeninfo API:', fetchErr);
        }
      }

      // Fallback to mock info if provided and parsing failed
      if (!targetEmail && isMock) {
        targetEmail = email;
        targetName = name;
        targetAvatar = avatar;
      }
    } else if (isMock || credential === 'mock_google_token') {
      targetEmail = email;
      targetName = name;
      targetAvatar = avatar;
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Invalid or missing Google credentials' });
    }

    // Check if the user exists in database
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: targetEmail,
          mode: 'insensitive'
        }
      }
    });

    if (user) {
      return res.json({ success: true, user });
    }

    // Return profile data for new user registration complete step
    return res.json({
      success: false,
      isGoogleSignUp: true,
      email: targetEmail.toLowerCase(),
      name: targetName,
      avatar: targetAvatar || (avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150')
    });
  } catch (err) {
    console.error('Google login controller error:', err);
    return res.status(500).json({ success: false, message: 'Database error' });
  }
};

