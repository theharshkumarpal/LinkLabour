import prisma from '../config/prisma.js';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Invalid authorization token' });
  }

  try {
    let email = '';
    // If token is a JWT (Google ID Token), decode it to fetch the user's email
    if (token.split('.').length === 3) {
      try {
        const payload = Buffer.from(token.split('.')[1], 'base64').toString('utf-8');
        const data = JSON.parse(payload);
        email = data.email;
      } catch (e) {
        // Token isn't a valid JWT payload, treat as regular ID
      }
    }

    let user = null;
    if (email) {
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id: token
        }
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(501).json({ success: false, message: 'Authentication error' });
  }
};
