import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Interface untuk Record riwayat absensi
export interface Attendance {
  day?: string;
  date?: Date;
  status: string;
  method: string;
  timestamp: Date;
  teacherToken?: string;
  mapel?: string;
  guru?: string;
  kelas?: string;
  jam?: string;
  evidencePath?: string;
}

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true, unique: true })
  nis: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  class: string;

  @Prop({ default: 'Belum Absen' })
  status: string;

  @Prop()
  password?: string;

  @Prop()
  lastPulang?: Date;

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
        kelas: String,
        jam: String,
        evidencePath: String,
      },
    ],
    default: [],
  })
  attendanceHistory: Attendance[];
}

export type StudentDocument = Student & Document;
export const StudentSchema = SchemaFactory.createForClass(Student);