import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export interface AttendanceRecord {
  day: string
  date: Date
  status: string
  method: string
  timestamp: Date
  teacherToken: string
  mapel?: string
  guru?: string
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true })
  nis: string

  @Prop({ required: true })
  name: string

  @Prop()
  'class': string

  @Prop({ default: '-' })
  status: string

  @Prop({
    type: [
      {
        day: String,
        date: Date,
        status: String,
        method: String,
        timestamp: Date,
        teacherToken: String,
        mapel: String,
        guru: String,
      },
    ],
    default: [],
  })
  attendanceHistory: AttendanceRecord[]
}

export type StudentDocument = Student & Document
export const StudentSchema = SchemaFactory.createForClass(Student)