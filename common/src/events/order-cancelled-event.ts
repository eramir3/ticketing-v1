import { Subjects } from './subjects';
import { Topics } from './topics';

export interface OrderCancelledEvent {
  topic: Topics
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    };
  };
}
