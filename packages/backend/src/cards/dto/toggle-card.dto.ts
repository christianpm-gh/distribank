import { IsIn, IsString } from 'class-validator';

export class ToggleCardDto {
  @IsString()
  @IsIn(['ACTIVE', 'BLOCKED'], { message: 'Estado debe ser ACTIVE o BLOCKED' })
  new_status!: 'ACTIVE' | 'BLOCKED';
}
