import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  versionKey: false,
})
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  email: string;

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    required: true,
  })
  fullName: string;

  @Prop({
    default: true,
  })
  isActive: boolean;

  @Prop({
    type: [String],
    default: ['user'],
    enum: ['user', 'admin'],
  })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
