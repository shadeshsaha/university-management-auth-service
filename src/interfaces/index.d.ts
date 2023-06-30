import { JwtPayload } from 'jsonwebtoken';
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: JwtPayload | null;
    }
  }
}

// Here we are attaching a user into Express
