import { Controller, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('accounts/:id/transactions')
  async getByAccount(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.transactionsService.getByAccount(req.user.customerId, id);
  }

  @Get('transactions/:uuid')
  async getDetail(@Param('uuid') uuid: string, @Request() req: any) {
    return this.transactionsService.getDetail(req.user.customerId, uuid);
  }
}
