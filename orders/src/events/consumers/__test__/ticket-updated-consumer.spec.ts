import mongoose from 'mongoose';
import { Subjects } from '@er3tickets/common';
import { TicketUpdatedConsumer } from '../ticket-updated-consumer';
import { app, ticketModel } from '../../../../test/setup';
import { TicketCreatedConsumer } from '../ticket-created-consumer';

let createConsumer: TicketCreatedConsumer;
let updateConsumer: TicketUpdatedConsumer;

beforeEach(() => {
  createConsumer = app.get(TicketCreatedConsumer); // uses mocked Kafka + real TicketsService
  updateConsumer = app.get(TicketUpdatedConsumer); // uses mocked Kafka + real TicketsService
});

it('finds, updates, and saves a ticket', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString()

  await ticketModel.create({
    _id: ticketId,
    version: 0,
    title: 'concert',
    price: 10,
  });

  const value = {
    version: 1,
    id: ticketId,
    title: 'concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  await updateConsumer.onMessage({
    offset: '0',
    partition: 0,
    subject: Subjects.TicketUpdated,
    value,
  });

  const updatedTicket = await ticketModel.findById(ticketId);

  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toBe(value.title);
  expect(updatedTicket!.price).toEqual(value.price);
});