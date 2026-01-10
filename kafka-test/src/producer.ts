import { randomBytes } from "node:crypto";
import { Kafka } from 'kafkajs'
import { TicketCreatedProducer } from "./events/ticker-created-producer";

const kafka = new Kafka({
  clientId: 'my-producer',
  brokers: ['localhost:9094'],
});

const producer = kafka.producer({
  //idempotent: true, // For acks
  //maxInFlightRequests: 1, // For acks
});

async function run() {
  await producer.connect();

  try {
    const result = await producer.send({
      topic: 'ticket-created',
      //acks: -1, // wait for all in-sync replicas // For acks
      messages: [
        {
          key: `key-${randomBytes(4).toString('hex')}`, value: JSON.stringify({
            id: '123',
            title: 'Concert',
            price: 20,
          }),
        },
      ],
    });

    console.log('Messages sent', { result });
  } catch (err) {
    console.error('Message NOT acknowledged', err);
  }

  await producer.disconnect();
}

run().catch(console.error);

// new TicketCreatedProducer(kafka).send([{
//   key: `key-${randomBytes(4).toString('hex')}`, value: {
//     id: '123',
//     title: 'Concert',
//     price: 20,
//   },
// }])