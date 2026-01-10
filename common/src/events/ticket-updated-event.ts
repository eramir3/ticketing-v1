import { Subjects } from './subjects';
import { Topics } from './topics';

export interface TicketUpdatedEvent {
  topic: Topics
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    orderId?: string;
  };
}
