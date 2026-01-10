import { BaseProducer } from './base-producer'
import { Subjects } from './subject';
import { TicketCreatedEvent } from './ticket-created-event';
import { Topics } from './topics';

export class TicketCreatedProducer extends BaseProducer<TicketCreatedEvent> {
  readonly topic = Topics.TicketEvent;
  readonly subject = Subjects.TicketCreated;
}