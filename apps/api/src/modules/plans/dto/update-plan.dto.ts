import { IsOptional, IsString } from 'class-validator';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  personaId?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;
}
