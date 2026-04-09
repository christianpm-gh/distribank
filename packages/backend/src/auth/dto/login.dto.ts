import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un email válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Mínimo 8 caracteres' })
  password!: string;
}
