import 'dotenv/config';
import { betterAuth } from 'better-auth';
import { username } from 'better-auth/plugins';
import { Pool } from 'pg';

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: '/api/auth',
  trustedOrigins: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: 'users',
    additionalFields: {
      role: {
        type: ['user', 'admin'],
        required: false,
        defaultValue: 'user',
        input: false,
        returned: true,
      },
      avatarB64: {
        type: 'string',
        required: false,
        input: true,
        returned: true,
      },
    },
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 30,
    }),
  ],
});
