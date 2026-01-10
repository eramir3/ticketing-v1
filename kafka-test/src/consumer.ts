import { Consumer, EachMessagePayload, KafkaMessage } from "kafkajs";
import { randomBytes } from "node:crypto";
import { Kafka } from 'kafkajs'
import { TicketCreatedConsumer } from "./events/ticket-created-consumer";

// Kafka client for local broker used by the consumer test harness
const kafka = new Kafka({
  clientId: 'my-consumer',
  brokers: ['localhost:9094']
});


// Consumer instance that will subscribe to ticket events under the shared group
const consumer = kafka.consumer({ groupId: `my-group` });
//const consumer = kafka.consumer({ groupId: `my-group-${randomBytes(4).toString('hex')}` });

async function run() {
  await consumer.connect();

  await consumer.subscribe({
    topic: 'ticket-events', // ticket-created
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      try {
        if (message?.value) {
          console.log({
            topic,
            partition,
            key: message.key?.toString(),
            value: JSON.parse(message.value.toString()),
            offset: message.offset
          });
          // For acks
          // await consumer.commitOffsets([
          //   {
          //     topic,
          //     partition,
          //     offset: (Number(message.offset) + 1).toString(),
          //   },
          // ]);
        }
      } catch (err) {
        console.error('Consumer Processing failed', err);
      }
    },
  });
}

run().catch(console.error);


// new TicketCreatedConsumer(kafka).start()

