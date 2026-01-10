import { Consumer, EachMessagePayload, Message } from "kafkajs";
import { Kafka } from 'kafkajs'
import { Subjects } from "./subject";
import { Topics } from "./topics";

interface Event {
  topic: Topics
  subject: Subjects;
  data: any;
}

export interface ConsumerMessage<T extends Event> {
  key?: Message['key']
  value: T['data'];
  partition: number,
  offset: string,
}

export abstract class BaseConsumer<T extends Event> {
  protected abstract topic: T['topic']
  protected abstract subject: T['subject']
  protected abstract consumerGroupId: string
  protected abstract onMessage(data: ConsumerMessage<T>): void;
  private client: Kafka
  protected consumer: Consumer;

  constructor(client: Kafka) {
    this.client = client
  }

  async start() {
    this.consumer = this.client.consumer({
      groupId: this.consumerGroupId,
    });
    this.setupGracefulShutdown();
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({
        topic: this.topic,
        fromBeginning: false, // safer default
      });

      await this.consumer.run({
        autoCommit: true,
        eachMessage: async (payload) => {
          // Business logic
          const parsedData = this.parseMessage(payload);
          this.onMessage(parsedData);
        },
      });
    } catch (err) {
      console.error('Consumer processing failed!', err);
      process.exit(1);
    }
  }

  protected parseMessage({ partition, message }: EachMessagePayload): ConsumerMessage<T> {
    let value = null;

    try {
      value = message.value
        ? JSON.parse(message.value.toString())
        : null;
    } catch (err) {
      console.error('Invalid JSON message', err);
    }

    return {
      partition,
      offset: message.offset,
      key: message.key?.toString(),
      value,
    };
  }

  private setupGracefulShutdown() {
    let shuttingDown = false;

    const shutdown = async () => {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log('Disconnecting consumer...');
      try {
        await this.consumer.disconnect();
      } finally {
        process.exit(0);
      }
    };

    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }
}