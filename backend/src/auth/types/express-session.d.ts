import 'express-session';
import 'express';
import type { Role } from '../../lib/project';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: Role;
  }
}

declare module 'express' {
  interface Request {
    session: import('express-session').Session &
      Partial<import('express-session').SessionData>;
  }
}
