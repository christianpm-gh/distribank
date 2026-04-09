import { IsUUID, IsNumber, IsString, IsOptional, Matches, Min, MaxLength } from 'class-validator';

export class CreateTransferDto {
  @IsUUID('4')
  transaction_uuid!: string;

  @IsNumber()
  from_account_id!: number;

  @IsString()
  @Matches(/^DIST(CHK|CRD)\d{10}$/, { message: 'Formato de cuenta inválido' })
  to_account_number!: string;

  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a cero' })
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Máximo 100 caracteres' })
  description?: string;
}
