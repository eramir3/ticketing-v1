import { Kafka, Message, Producer } from "kafkajs";
import { Subjects } from "./subject";
import { Topics } from "./topics";
import { randomBytes } from "node:crypto";

interface Event {
  topic: Topics
  subject: Subjects;
  data: any;
}

export interface ProducerMessage<T extends Event> {
  key?: Message['key']
  value: T['data'];
}

export abstract class BaseProducer<T extends Event> {
  protected abstract topic: T['topic']
  protected abstract subject: T['subject']
  private client: Kafka
  protected producer: Producer


  constructor(client: Kafka) {
    this.client = client
  }

  async send(messages: ProducerMessage<T>[]) {
    this.producer = this.client.producer({
      //idempotent: true, // For acks
      //maxInFlightRequests: 1, // For acks
    });

    const serialzedMessages = this.serializeMessage(messages)

    try {
      await this.producer.connect();
      await this.producer.send({
        topic: this.topic,
        //acks: -1, // wait for all in-sync replicas // For acks
        messages: serialzedMessages
      });

      console.log('Messages sent', { serialzedMessages });
      await this.producer.disconnect();
    } catch (err) {
      console.error('Producer processing failed!', err);
      process.exit(1);
    }
  }

  serializeMessage(data: ProducerMessage<T>[]) {
    return data.map(d => ({
      key: d.key,
      value: JSON.stringify(d.value)
    }))
  }
}