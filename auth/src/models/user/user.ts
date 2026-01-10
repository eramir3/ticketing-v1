import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Password } from '../../utils/password';

// Properties required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

// Properties that a User Document has
type UserDocument = HydratedDocument<User>;

// Properties that a User Model has
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}


@Schema()
class User {
  // Virtual id getter provided by Mongoose; added for typing
  id: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;
}

const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await Password.toHash(this.password);
});

// Hide sensitive/irrelevant fields when sending JSON responses
UserSchema.set('toJSON', {
  transform(_doc, ret: Record<string, any>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
  },
});

UserSchema.statics.build = function (attrs: UserAttrs) {
  return new this(attrs);
};

export { User, UserSchema };
export type { UserDocument, UserModel };
