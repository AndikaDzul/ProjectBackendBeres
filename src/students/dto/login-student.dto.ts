import { IsNotEmpty, IsString } from 'class-validator'

export class LoginStudentDto {
  @IsNotEmpty()
  @IsString()
  nis: string

  @IsNotEmpty()
  @IsString()
  password: string
}