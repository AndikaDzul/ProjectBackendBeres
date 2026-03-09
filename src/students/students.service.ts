import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Student, StudentDocument, Attendance } from './students.schema';
import { CreateStudentDto } from './dto/create-students.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const input = dto as any;
    const grade = input.grade || '';
    const major = input.major || '';
    const classNumber = input.classNumber || '';
    const combinedClass = dto.class || `${grade} ${major} ${classNumber}`.trim();

    const student = new this.studentModel({
      nis: dto.nis,
      name: dto.name,
      class: combinedClass,
      grade: grade,
      major: major,
      classNumber: classNumber,
      password: hashedPassword,
      status: 'Belum Absen',
      attendanceHistory: [],
    });

    return student.save();
  }

  async findAll(): Promise<Student[]> {
    return this.studentModel.find().exec();
  }

  async findOne(nis: string): Promise<StudentDocument> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    return student;
  }

  async login(nis: string, password: string): Promise<Omit<Student, 'password'> | null> {
    const studentDoc = await this.studentModel.findOne({ nis }).exec();
    if (!studentDoc) return null;
    
    const student = studentDoc.toObject() as any;
    const match = await bcrypt.compare(password, student.password);
    if (!match) return null;
    
    const { password: pwd, ...result } = student;
    return result;
  }

  async createAttendance(nis: string, body: CreateAttendanceDto): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    let timestamp = new Date(body.timestamp ?? Date.now());
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date();
    }

    // Menggunakan 'as any' untuk menghindari error TS2353 jika field tidak ada di interface
    const attendanceData: any = {
      status: body.status || 'Hadir',
      timestamp,
      method: body.method || 'QR Scan',
      mapel: body.mapel || 'Pelajaran Umum',
      jam: (body as any).jam || timestamp.toLocaleTimeString('id-ID'),
      day: body.day || timestamp.toLocaleDateString('id-ID', { weekday: 'long' }),
      kelas: (student as any).class,
      teacherToken: (body as any).qrToken || (body as any).teacherToken || '',
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendanceData as Attendance);
    student.status = attendanceData.status;

    return student.save();
  }

  // ================= LOGIKA PULANG =================
  async createPulangLog(nis: string, timestampStr: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    let timestamp = new Date(timestampStr ?? Date.now());
    if (isNaN(timestamp.getTime())) {
      timestamp = new Date();
    }

    const attendanceData: any = {
      status: 'Pulang',
      timestamp: timestamp,
      method: 'Siswa Self-Log',
      mapel: 'Selesai KBM',
      day: timestamp.toLocaleDateString('id-ID', { weekday: 'long' }),
      kelas: (student as any).class,
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendanceData as Attendance);
    
    student.status = 'Pulang';
    (student as any).lastPulang = timestamp;

    return student.save();
  }

  async resetOneAttendance(nis: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    
    student.status = 'Belum Absen';
    student.attendanceHistory = [];
    (student as any).lastPulang = null;
    
    return student.save();
  }

  async saveEvidencePath(nis: string, filePath: string) {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    if (student.attendanceHistory && student.attendanceHistory.length > 0) {
      const lastIndex = student.attendanceHistory.length - 1;
      const formattedPath = filePath.replace(/\\/g, '/');
      
      const lastRecord = student.attendanceHistory[lastIndex] as any;
      lastRecord.evidencePath = formattedPath;
      
      student.status = 'Hadir (Bukti Terkirim)';
      student.markModified('attendanceHistory');
      await student.save();
      
      return { 
        success: true, 
        message: 'Bukti berhasil disimpan di database',
        status: student.status,
        path: formattedPath 
      };
    } else {
      throw new HttpException('Siswa harus melakukan scan QR terlebih dahulu sebelum upload bukti.', HttpStatus.BAD_REQUEST);
    }
  }

  async updateManual(nis: string, status: string, teacherName: string): Promise<Student> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');

    const now = new Date();
    const attendanceData: any = {
      status: status,
      timestamp: now,
      method: `Manual by ${teacherName}`,
      mapel: 'Input Manual',
      day: now.toLocaleDateString('id-ID', { weekday: 'long' }),
      kelas: (student as any).class,
    };

    if (!student.attendanceHistory) student.attendanceHistory = [];
    student.attendanceHistory.push(attendanceData as Attendance);
    student.status = status;

    return student.save();
  }

  async resetAllAttendance(): Promise<Student[]> {
    await this.studentModel.updateMany(
      {},
      { $set: { status: 'Belum Absen', attendanceHistory: [], lastPulang: null } },
    );
    return this.findAll();
  }

  async remove(nis: string): Promise<{ message: string }> {
    const student = await this.studentModel.findOne({ nis }).exec();
    if (!student) throw new NotFoundException('Siswa tidak ditemukan');
    await this.studentModel.deleteOne({ nis }).exec();
    return { message: 'Siswa berhasil dihapus' };
  }
}