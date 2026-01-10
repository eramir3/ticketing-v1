import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ExpirationCompleteProducer } from 'src/events/producer/expiration-complete-producer';

@Processor('orders')
export class ExpirationProcessorService extends WorkerHost {
  constructor(private readonly expirationProducer: ExpirationCompleteProducer) {
    super()
  }

  async process(job: Job) {
    switch (job.name) {
      case 'order-expiration':
        return this.handleOrderCreated(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }

  private async handleOrderCreated(
    job: Job<{ orderId: string }>,
  ) {
    const { orderId } = job.data;

    console.info(`Processing order!!:  ${orderId}`);

    // 👉 BUSINESS LOGIC HERE
    // - charge payment
    // - send email
    // - generate invoice
    // - publish event (Kafka, SNS, etc)
    this.expirationProducer.send([{
      value: {
        orderId
      }
    }])

    return { success: true };
  }
}
