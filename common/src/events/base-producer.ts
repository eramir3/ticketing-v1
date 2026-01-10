import { Kafka, Message, Producer } from "kafkajs";
import { Subjects } from "./subjects";
import { Topics } from "./topics";
import { OnModuleDestroy, Logger } from "@nestjs/common";

interface Event {
  topic: Topics
  subject: Subjects;
  data: any;
}

export interface ProducerMessage<T extends Event> {
  key?: Message['key']
  value: T['data'];
}

export abstract class BaseProducer<T extends Event> implements OnModuleDestroy {
  protected abstract topic: T['topic']
  protected abstract subject: T['subject']
  private readonly client: Kafka
  private producer?: Producer
  private connectPromise?: Promise<void>
  private readonly logger = new Logger(BaseProducer.name)

  constructor(client: Kafka) {
    this.client = client
  }

  protected async getProducer() {
    if (!this.producer) {
      this.producer = this.client.producer({
        // idempotent: true,
        // maxInFlightRequests: 1,
      });
    }

    if (!this.connectPromise) {
      this.connectPromise = this.producer.connect().catch((err) => {
        this.connectPromise = undefined;
        throw err;
      });
    }

    await this.connectPromise;
    return this.producer;
  }

  async onModuleDestroy() {
    if (!this.producer) return;
    await this.producer.disconnect()
    this.logger.log(`Producer disconnected: ${this.topic}`)
  }

  async send(messages: ProducerMessage<T>[]) {
    const producer = await this.getProducer();
    const serializedMessages = this.serializeMessage(messages)

    try {
      await producer.send({
        topic: this.topic,
        //acks: -1, // wait for all in-sync replicas // For acks
        messages: serializedMessages
      });

      console.log('Message sent:', { topic: this.topic, subject: this.subject, serializedMessages });
    } catch (err) {
      console.error('Producer processing failed!', err);
    }
  }

  serializeMessage(messages: ProducerMessage<T>[]) {
    return messages.map(({ key, value }) => ({
      key,
      value: JSON.stringify({ subject: this.subject, data: value }),
    }))
  }
}
