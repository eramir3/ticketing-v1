import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { appConfig } from "../src/app";
import { Ticket } from '../src/tickets/schemas/ticket.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Order } from '../src/orders/schemas/order.schema';
import { OrderCancelledProducer } from '../src/events/producers/order-cancelled-producer';
import { OrderCreatedProducer } from '../src/events/producers/order-created-producer';

jest.mock('../src/kafka-wrapper');

declare global {
  var signin: (id?: string) => string[];
}

export let orderModel: Model<Order>;
export let ticketModel: Model<Ticket>;
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
  ticketModel = app.get(getModelToken(Ticket.name))
  orderModel = app.get(getModelToken(Order.name))
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

  // Reset cached Kafka producers between tests so fresh mocks are used
  // Para borrar
  const producers = [
    app?.get(OrderCreatedProducer),
    app?.get(OrderCancelledProducer),
  ];
  producers.forEach((producer) => {
    (producer as any)?.resetProducerForTests?.();
  });

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
