import { OrderStatus } from '@er3tickets/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// Properties required to create a new Order
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// Properties that a Order Document has
type OrderDocument = HydratedDocument<Order>;

// Properties that a Order Model has
interface OrderModel extends mongoose.Model<OrderDocument> {
  build(attrs: OrderAttrs): OrderDocument;
}

@Schema({ versionKey: 'version' })
class Order {
  id: string;

  version: number; // Mongoose will increment this on each save

  @Prop({ type: String, enum: OrderStatus, required: true, default: OrderStatus.Created })
  status: OrderStatus;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  price: number
}

const OrderSchema = SchemaFactory.createForClass(Order);

// Hide sensitive/irrelevant fields when sending JSON responses
OrderSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    ret.id = ret._id;
    delete ret._id;
  },
});

OrderSchema.statics.build = function (attrs: OrderAttrs) {
  return new this(attrs);
};

export { Order, OrderSchema };
export type { OrderDocument, OrderModel };
