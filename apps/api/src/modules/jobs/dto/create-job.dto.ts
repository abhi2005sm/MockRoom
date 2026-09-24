import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Company name is required' })
  company: string;

  @IsString()
  @IsNotEmpty({ message: 'Experience level is required' })
  experienceLevel: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description text is required' })
  jdText: string;

  @IsString()
  @IsOptional()
  resumeText?: string;

  @IsString()
  @IsOptional()
  targetInterviewDate?: string;
}
