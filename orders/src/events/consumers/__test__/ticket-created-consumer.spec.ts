import mongoose from 'mongoose';
import { Subjects } from '@er3tickets/common';
import { TicketCreatedConsumer } from '../ticket-created-consumer';
import { app, ticketModel } from '../../../../test/setup';

let consumer: TicketCreatedConsumer;

beforeEach(() => {
  consumer = app.get(TicketCreatedConsumer); // uses mocked Kafka + real TicketsService
});

it('creates and saves a ticket', async () => {
  const value = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  await consumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.TicketCreated,
    value,
  });

  const ticket = await ticketModel.findById(value.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toBe(value.title);
  expect(ticket!.price).toEqual(value.price);
});
