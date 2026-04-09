import { Controller, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get(':id/profile')
  async getProfile(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    if (req.user.customerId !== id) {
      return { message: 'Acceso denegado' };
    }
    return this.customersService.getProfile(id);
  }
}
