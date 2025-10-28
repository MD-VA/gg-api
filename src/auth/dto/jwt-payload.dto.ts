export interface JwtPayload {
  userId: string;
  email: string;
  firebaseUid: string;
  iat?: number;
  exp?: number;
}
