import mongoose from 'mongoose';
import request from 'supertest';
import { app, orderModel, ticketModel } from '../../test/setup';
import { OrderStatus } from '@er3tickets/common';
import { kafkaWrapper } from '../kafka-wrapper';

const mutation = `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(createOrderInput: $input) {
      id
    }
  }
`;

const queryAll = `
  query Orders {
    orders {
      id
      ticket {
        id
      }
    }
  }
`;

const query = `
  query GetOrder($id: String!) {
    order(id: $id) {
      id
      status
      expiresAt
      userId
      ticket {
        id
        title
        price
      }
    }
  }
`

const cancelOrderMutation = `
  mutation CancelOrder($id: String!) {
    cancelOrder(id: $id) {
      id
    }
  }
`;

describe('OrdersResolver create order', () => {
  it('returns an error if the ticket does not exist', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    const response = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', global.signin())
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe(404);
  })

  it('returns an error if the ticket is already reserved', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    await orderModel.create({
      ticket: ticket.id,
      userId,
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    const response = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', global.signin())
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
          },
        },
      });

    //console.log(JSON.stringify(response.body.errors))
    expect(response.status).toBe(200);
    expect(response.body.errors[0].extensions.code).toBe(400);
  });

  it('reserves a ticket', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const response = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', global.signin())
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
          },
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
  });

  it('emits an order created event', async () => {
    const producerInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    (kafkaWrapper.client.producer as jest.Mock).mockReturnValue(producerInstance);

    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', global.signin())
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
            userId: new mongoose.Types.ObjectId().toHexString(),
            status: 'Created',
            expiresAt: new Date().toISOString(),
          },
        },
      });

    expect(producerInstance.send).toHaveBeenCalled();
  });
});

describe('OrdersResolver find all orders', () => {
  it('fetches orders for an particular user', async () => {
    // Create three tickets
    const ticketOne = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const ticketTwo = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const ticketThree = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const userOneId = new mongoose.Types.ObjectId().toHexString();
    const userTwoId = new mongoose.Types.ObjectId().toHexString();
    const userOne = global.signin(userOneId);
    const userTwo = global.signin(userTwoId);

    // Create one order as User #1
    await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', userOne)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticketOne.id,
          },
        },
      })

    // Create two orders as User #2
    const { body: orderOne } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', userTwo)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticketTwo.id,
          },
        },
      })

    const { body: orderTwo } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', userTwo)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticketThree.id,
          },
        },
      })

    // Make request to get orders for User #2
    const response = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', userTwo)
      .send({ query: queryAll })

    // Make sure we only got the orders for User #2
    expect(response.body.data.orders.length).toEqual(2);
    expect(response.body.data.orders[0].id).toEqual(orderOne.data.createOrder.id);
    expect(response.body.data.orders[1].id).toEqual(orderTwo.data.createOrder.id);
    expect(response.body.data.orders[0].ticket.id).toEqual(ticketTwo.id);
    expect(response.body.data.orders[1].ticket.id).toEqual(ticketThree.id);
  });
});

describe('OrdersResolver find order', () => {
  it('fetches the order', async () => {
    // Create a ticket
    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const userId = new mongoose.Types.ObjectId().toHexString();
    const user = global.signin(userId);
    // make a request to build an order with this ticket
    const { body: order } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
          },
        },
      })

    // make request to fetch the order
    const { body: fetchedOrder } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query,
        variables: { id: order.data.createOrder.id.toString() },
      })

    expect(order.data.createOrder.id).toEqual(fetchedOrder.data.order.id);
  });

  it('returns an error if one user tries to fetch another users order', async () => {
    // Create a ticket
    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const userId = new mongoose.Types.ObjectId().toHexString();
    const user = global.signin();
    // make a request to build an order with this ticket
    const { body: order } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
          },
        },
      })

    // make request to fetch the order
    const { body: fetchedOrder } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', global.signin())
      .send({
        query,
        variables: { id: order.data.createOrder.id.toString() },
      })

    expect(fetchedOrder.errors[0].extensions.code).toBe(401);
  });
});

describe('OrdersResolver cancel order', () => {
  it('marks an order as cancelled', async () => {
    // create a ticket with Ticket Model
    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const userId = new mongoose.Types.ObjectId().toHexString();
    const user = global.signin(userId);
    // make a request to create an order
    const { body: order } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
          },
        },
      })

    // make a request to cancel the order
    await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: cancelOrderMutation,
        variables: { id: order.data.createOrder.id.toString() },
      })
    // expectation to make sure the thing is cancelled
    const updatedOrder = await orderModel.findById(order.data.createOrder.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });

  it('emits a order cancelled event', async () => {
    const producerInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    };
    (kafkaWrapper.client.producer as jest.Mock).mockReturnValue(producerInstance);

    const ticket = await ticketModel.create({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 20,
    });

    const userId = new mongoose.Types.ObjectId().toHexString();
    const user = global.signin(userId);

    // make a request to create an order
    const { body: order } = await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: mutation,
        variables: {
          input: {
            ticketId: ticket.id,
            userId,
            status: 'Created',
            expiresAt: new Date().toISOString(),
          },
        },
      });

    // make a request to cancel the order
    await request(app.getHttpServer())
      .post('/api/orders/graphql')
      .set('Cookie', user)
      .send({
        query: cancelOrderMutation,
        variables: { id: order.data.createOrder.id.toString() },
      })

    expect(producerInstance.send).toHaveBeenCalled();
  });
});
