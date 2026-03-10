// src/config/schemas/gps.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GpsDocument = Gps & Document;

@Schema()
export class Gps {
  @Prop({ required: true, type: Number })
  lat: number;

  @Prop({ required: true, type: Number })
  lng: number;

  @Prop({ required: true, type: Number, default: 50 })
  radius: number;
}

export const GpsSchema = SchemaFactory.createForClass(Gps);
