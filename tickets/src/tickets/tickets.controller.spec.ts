import request from 'supertest';
import { app, ticketModel } from '../../test/setup';
import mongoose from 'mongoose';
import { kafkaWrapper } from '../kafka-wrapper';

describe('TicketController Index (e2e)', () => {
  it('can fetch a list of tickets', async () => {
    const createTicket = () => {
      return request(app.getHttpServer()).post('/api/tickets').set('Cookie', global.signin()).send({
        title: 'asldkf',
        price: 20,
      });
    };

    await createTicket();
    await createTicket();
    await createTicket();

    const response = await request(app.getHttpServer()).get('/api/tickets').send().expect(200);

    expect(response.body.length).toEqual(3);
  });
});

describe('TicketController New (e2e)', () => {
  it('has a route handler listening to /api/tickets for post requests', async () => {
    const response = await request(app.getHttpServer()).post('/api/tickets').send({});

    expect(response.status).not.toEqual(404);
  });

  it('can only be accessed if the user is signed in', async () => {
    await request(app.getHttpServer()).post('/api/tickets').send({}).expect(401);
  });

  it('returns a status other than 401 if the user is signed in', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({});

    expect(response.status).not.toEqual(401);
  });


  it('returns an error if an invalid title is provided', async () => {
    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: '',
        price: 10,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        price: 10,
      })
      .expect(400);
  });

  it('returns an error if an invalid price is provided', async () => {
    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'asldkjf',
        price: -10,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'laskdfj',
      })
      .expect(400);
  });


  it('creates a ticket with valid inputs', async () => {
    let tickets = await ticketModel.find({});
    expect(tickets.length).toEqual(0);

    const title = 'asldkfj';

    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price: 20,
      })
      .expect(201);

    tickets = await ticketModel.find({ title });
    expect(tickets.length).toEqual(1);
    expect(tickets[0].price).toEqual(20);
    expect(tickets[0].title).toEqual(title);
  });

  it('produces an event', async () => {
    const title = 'asldkfj';

    const producerInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    (kafkaWrapper.client.producer as jest.Mock).mockReturnValue(producerInstance);

    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price: 20,
      })
      .expect(201);

    expect(producerInstance.send).toHaveBeenCalled();
  });
});

describe('TicketController Show (e2e)', () => {
  it('returns a 404 if the ticket is not found', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app.getHttpServer()).get(`/api/tickets/${id}`).send().expect(404);
  });

  it('returns the ticket if the ticket is found', async () => {
    const title = 'concert';
    const price = 20;

    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price,
      })
      .expect(201);

    const ticketResponse = await request(app.getHttpServer())
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });
});

describe('TicketController Update (e2e)', () => {
  it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app.getHttpServer())
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'aslkdfj',
        price: 20,
      })
      .expect(404);
  });

  it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();
    await request(app.getHttpServer())
      .put(`/api/tickets/${id}`)
      .send({
        title: 'aslkdfj',
        price: 20,
      })
      .expect(401);
  });

  it('returns a 401 if the user does not own the ticket', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'asldkfj',
        price: 20,
      });

    await request(app.getHttpServer())
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'alskdjflskjdf',
        price: 1000,
      })
      .expect(401);
  });

  it('returns a 400 if the user provides an invalid title or price', async () => {
    const cookie = global.signin();

    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });

    await request(app.getHttpServer())
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 20,
      })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'alskdfjj',
        price: -10,
      })
      .expect(400);
  });

  it('updates the ticket provided valid inputs', async () => {
    const cookie = global.signin();

    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });

    await request(app.getHttpServer())
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100,
      })
      .expect(200);

    const ticketResponse = await request(app.getHttpServer())
      .get(`/api/tickets/${response.body.id}`)
      .send();

    expect(ticketResponse.body.title).toEqual('new title');
    expect(ticketResponse.body.price).toEqual(100);
  });

  it('produces an event', async () => {
    const title = 'asldkfj';

    const producerInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    (kafkaWrapper.client.producer as jest.Mock).mockReturnValue(producerInstance);

    await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title,
        price: 20,
      })
      .expect(201);

    expect(producerInstance.send).toHaveBeenCalled();
  });

  it('rejects updates if the ticket is reserved', async () => {
    const cookie = global.signin();

    const response = await request(app.getHttpServer())
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'asldkfj',
        price: 20,
      });

    const ticket = await ticketModel.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app.getHttpServer())
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'new title',
        price: 100,
      })
      .expect(400);
  });
});