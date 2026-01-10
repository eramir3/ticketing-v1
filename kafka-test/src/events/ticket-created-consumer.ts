import { BaseConsumer, ConsumerMessage } from "./base-consumer";
import { Subjects } from "./subject";
import { TicketCreatedEvent } from "./ticket-created-event";
import { Topics } from "./topics";

export class TicketCreatedConsumer extends BaseConsumer<TicketCreatedEvent> {
  readonly topic = Topics.TicketEvent
  readonly subject = Subjects.TicketCreated
  consumerGroupId = 'payments-service'// cambiar a ticket-event-consumer-afser53sdfa23 ??
  onMessage(data: ConsumerMessage<TicketCreatedEvent>): void {
    const { value } = data
    console.log('Event data!', { data });

    console.log(this.topic)
    console.log(this.subject)
    console.log(value.id);
    console.log(value.title);
    console.log(value.price);
  }
}