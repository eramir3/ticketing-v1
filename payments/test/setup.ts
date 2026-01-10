import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { appConfig } from "../src/app";
import { getModelToken } from '@nestjs/mongoose';
import { Order, OrderModel } from '../src/orders/schemas/order.schema';
import { Payment, PaymentModel } from '../src/payments/schemas/payment.schema';

jest.mock('../src/kafka-wrapper');
jest.mock('../src/stripe');

declare global {
  var signin: (id?: string) => string[];
}

export let orderModel: OrderModel;
export let paymentModel: PaymentModel;
export let app: INestApplication;

let mongo: MongoMemoryServer | null = null;

beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  process.env.KAFKA_CLIENT_ID = "12345667";
  process.env.KAFKA_URL = "kafka-serv:9092";

  // Starts MongoMemoryServer
  mongo = await MongoMemoryServer.create();

  const mongoUri = mongo.getUri();
  process.env.MONGO_URI = mongoUri;

  // Waits for mongoose to connect to MongoMemoryServer
  await mongoose.connect(mongoUri, {});

  // Configures nestjs app
  const { app: testApp } = await appConfig()
  app = testApp
  orderModel = app.get<OrderModel>(getModelToken(Order.name));
  paymentModel = app.get<PaymentModel>(getModelToken(Payment.name));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.init();
});

beforeEach(async () => {
  jest.clearAllMocks()

  if (!mongoose.connection.db) {
    return;
  }

  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await app?.close();
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signin = (id?: string) => {
  // Build a JWT payload.  { id, email }
  const payload = {
    id: id ?? new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object. { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
