import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: number;
  email: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};
