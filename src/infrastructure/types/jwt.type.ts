export type Token = string;

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayloadType = {
  deviceId: string;
  userId: string;
  exp: number;
  iat: number;
};
