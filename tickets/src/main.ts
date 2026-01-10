import { appConfig } from './app';

// Starts app instance
async function bootstrap() {
  const { app } = await appConfig()
  await app.listen(process.env.PORT ?? 3000);
  console.log("Listening on port 3000")
}
bootstrap();
