import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// Properties required to create a new Payment
interface PaymentAttrs {
  orderId: string
  stipeId: string
}

// Properties that a Payment Document has
type PaymentDocument = HydratedDocument<Payment>;

// Properties that a Payment Model has
interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attrs: PaymentAttrs): PaymentDocument;
}

@Schema({ versionKey: 'version' })
class Payment {
  id: string;

  version: number; // Mongoose will increment this on each save

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  stripeId: string;
}

const PaymentSchema = SchemaFactory.createForClass(Payment);

// Hide sensitive/irrelevant fields when sending JSON responses
PaymentSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    ret.id = ret._id;
    delete ret._id;
  },
});

PaymentSchema.statics.build = function (attrs: PaymentAttrs) {
  return new this(attrs);
};

export { Payment, PaymentSchema };
export type { PaymentDocument, PaymentModel };
