export type AppConfig = {
  port: number;
  jwtPublicKey: string;
};

const appConfig: AppConfig = {
  port: parseInt(process.env.PORT) || 4000,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY || '',
};

export default appConfig;
