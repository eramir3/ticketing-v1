import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@er3tickets/common';
import { app, orderModel, paymentModel } from '../../test/setup';

const mutation = `
  mutation ($input: CreatePaymentInput!) {
    createPayment(createPaymentInput: $input) {
      orderId
    }
  }
`;

it('returns a 404 when purchasing an order that does not exist', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/payments/graphql')
    .set('Cookie', global.signin())
    .send({
      query: mutation,
      variables: {
        input: {
          orderId: new mongoose.Types.ObjectId().toHexString(),
        },
      },
    });
  expect(response.status).toBe(200);
  expect(response.body.errors[0].extensions.code).toBe(404);
});

it('returns a 401 when purchasing an order that doesnt belong to the user', async () => {
  const order = orderModel.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  const response = await request(app.getHttpServer())
    .post('/api/payments/graphql')
    .set('Cookie', global.signin())
    .send({
      query: mutation,
      variables: {
        input: {
          orderId: order.id,
        },
      },
    });

  expect(response.status).toBe(200);
  expect(response.body.errors[0].extensions.code).toBe(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = orderModel.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  const response = await request(app.getHttpServer())
    .post('/api/payments/graphql')
    .set('Cookie', global.signin(userId))
    .send({
      query: mutation,
      variables: {
        input: {
          orderId: order.id,
        },
      },
    })

  expect(response.status).toBe(200);
  expect(response.body.errors[0].extensions.code).toBe(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = orderModel.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  const response = await request(app.getHttpServer())
    .post('/api/payments/graphql')
    .set('Cookie', global.signin(userId))
    .send({
      query: mutation,
      variables: {
        input: {
          orderId: order.id,
        },
      },
    })

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();

  // const stripeCharges = await stripe.charges.list({ limit: 50 });
  // const stripeCharge = stripeCharges.data.find((charge) => {
  //   return charge.amount === price * 100;
  // });

  // expect(stripeCharge).toBeDefined();
  // expect(stripeCharge!.currency).toEqual('usd');

  const payment = await paymentModel.findOne({
    orderId: order.id,
    stripeId: { _id: 'pi_test_123' }
  });
  expect(payment).not.toBeNull();
});
