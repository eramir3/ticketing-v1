import { Subjects } from './subjects';
import { Topics } from './topics';

export interface ExpirationCompleteEvent {
  topic: Topics
  subject: Subjects.ExpirationComplete;
  data: {
    orderId: string;
  };
}
