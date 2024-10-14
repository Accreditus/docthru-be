import jwt from 'jsonwebtoken';
import { UnauthorizedException } from '../errors/customException.js';

const { ACCESS_TOKEN_SECRET } = process.env;

export const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new UnauthorizedException('접근 토큰이 없습니다');
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      throw new UnauthorizedException('유효하지 않은 접근 토큰입니다.');
    }
    req.user = user;
    next();
  });
};
