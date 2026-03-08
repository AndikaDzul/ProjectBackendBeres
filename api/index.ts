import { bootstrap } from '../src/main';

let cachedServer: any;

export default async (req: any, res: any) => {
  if (!cachedServer) {
    const app = await bootstrap();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
};