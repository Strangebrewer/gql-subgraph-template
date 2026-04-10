export type AppConfig = {
  port: number;
  jwtPublicKey: string;
};

export default (): AppConfig => ({
  port: parseInt(process.env.PORT) || 4000,
  jwtPublicKey: process.env.JWT_PUBLIC_KEY || '',
});
