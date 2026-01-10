import { Consumer, EachMessagePayload, Message } from "kafkajs";
import { Kafka } from 'kafkajs'
import { Subjects } from "./subjects";
import { Topics } from "./topics";

interface Event {
  topic: Topics
  subject: Subjects;
  data: any;
}

export interface ConsumerMessage<T extends Event> {
  key?: Message['key']
  value: T['data'],
  partition: number,
  offset: string,
  subject: T['subject'],
}

export abstract class BaseConsumer<T extends Event> {
  protected abstract topic: T['topic']
  protected abstract onMessage(data: ConsumerMessage<T>): void
  protected subject: T['subject']
  protected consumer: Consumer
  private client: Kafka

  constructor(client: Kafka, private consumerGroupId: string) {
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
          const parsedMessage = this.parseMessage(payload);
          if (parsedMessage.subject !== this.subject) {
            console.warn(`Skipping subject ${parsedMessage.subject}, expected ${this.subject}`);
            return;
          }
          this.onMessage(parsedMessage);
        },
      });
    } catch (err) {
      console.error('Consumer processing failed!', err);
    }
  }

  protected parseMessage({ partition, message }: EachMessagePayload): ConsumerMessage<T> {
    const parsed = message.value ? JSON.parse(message.value.toString()) : {};
    console.log('Message received:', {
      topic: this.topic,
      subject: parsed.subject,
      value: parsed.data,
    });
    return {
      partition,
      offset: message.offset,
      key: message.key?.toString(),
      subject: parsed.subject,
      value: parsed.data,
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