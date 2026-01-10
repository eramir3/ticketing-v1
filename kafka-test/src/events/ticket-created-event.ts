import { Subjects } from './subject';
import { Topics } from './topics';

export interface TicketCreatedEvent {
  topic: Topics
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
