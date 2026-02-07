import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type LocalizedString } from '../../lib/validation/localization';

export type PersonDocument = Person & Document;

@Schema({ timestamps: true })
export class Person {
  @Prop({ required: true })
  firstname: string;

  @Prop()
  lastname?: string;

  @Prop()
  description?: LocalizedString;
}

export const PersonSchema = SchemaFactory.createForClass(Person);
