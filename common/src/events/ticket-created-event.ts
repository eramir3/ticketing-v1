import { Subjects } from './subjects';
import { Topics } from './topics';

export interface TicketCreatedEvent {
  topic: Topics
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
  };
}
