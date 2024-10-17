import express from 'express';
import cookieParser from 'cookie-parser';
import errorHandler from './middlewares/errorHandler.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { swaggerDocs } from './configs/swagger.js';
import swaggerUi from 'swagger-ui-express';
import customJsonParser from './middlewares/jsonParser.js';
import { REFRESH_TOKEN_MAX_AGE } from './configs/config.js';

import userRoutes from './routes/userRoutes.js';
import workRoutes from './routes/workRoutes.js';
import challengeRoutes from './routes/challengeRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(customJsonParser);

export const sendRefreshToken = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: parseInt(REFRESH_TOKEN_MAX_AGE, 10),
    path: '/api/users/token/refresh',
  });
};

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        process.env.CLIENT_URL,
        'http://localhost:3000',
        'https://vercel.live',
      ],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://vercel.live',
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      frameSrc: ["'self'", 'https://vercel.live'],
      upgradeInsecureRequests: [],
    },
  })
);

// Swagger 설정
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API 라우트 설정
app.use('/api/users', userRoutes);
app.use('/api/works', workRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
  console.log(`Server is running on port http://localhost:${PORT}`)
);

export default app;
