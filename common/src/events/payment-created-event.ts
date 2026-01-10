import { Subjects } from './subjects';
import { Topics } from './topics';

export interface PaymentCreatedEvent {
  topic: Topics
  subject: Subjects.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}