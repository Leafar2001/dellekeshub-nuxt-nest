import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { type LocalizedString } from '../../lib/validation/localization';

export type PersonDocument = PersonEntity & Document;

@Schema({ collection: 'persons', timestamps: true })
export class PersonEntity {
  @Prop({ required: true })
  firstname: string;

  @Prop()
  lastname?: string;

  @Prop()
  description?: LocalizedString;
}

export const PersonSchema = SchemaFactory.createForClass(PersonEntity);
