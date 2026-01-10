import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// Properties required to create a new Ticket
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// Properties that a Ticket Document has
type TicketDocument = HydratedDocument<Ticket>;

// Properties that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDocument> {
  build(attrs: TicketAttrs): TicketDocument;
}

@Schema({ versionKey: 'version' })
class Ticket {
  // Virtual id getter provided by Mongoose; added for typing
  id: string;

  // Mongoose will increment this on each save
  version: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: number;
}

const TicketSchema = SchemaFactory.createForClass(Ticket);

// Hide sensitive/irrelevant fields when sending JSON responses
TicketSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    ret.id = ret._id;
    delete ret._id;
  },
});

TicketSchema.statics.build = function (attrs: TicketAttrs) {
  return new this(attrs);
};

export { Ticket, TicketSchema };
export type { TicketDocument, TicketModel };
