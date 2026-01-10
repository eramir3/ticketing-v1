import { Kafka } from 'kafkajs';

class KafkaWrapper {
  private _client?: Kafka;

  get client(): Kafka {
    if (!this._client) {
      throw new Error('Kafka client not initialized. Call connect() first.');
    }
    return this._client;
  }

  connect({
    clientId,
    brokers,
  }: {
    clientId: string;
    brokers: string[];
  }) {
    if (this._client) {
      return; // prevent re-initialization
    }

    this._client = new Kafka({
      clientId,
      brokers,
    });
    console.log('Connected to Kafka')
  }
}

export const kafkaWrapper = new KafkaWrapper();
