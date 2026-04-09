import { Controller, Get, Patch, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { CardsService } from './cards.service';
import { ToggleCardDto } from './dto/toggle-card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('customers/:id/cards')
  async getCards(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.cardsService.getCards(req.user.customerId);
  }

  @Patch('cards/:id/toggle')
  async toggleCard(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToggleCardDto,
    @Request() req: any,
  ) {
    return this.cardsService.toggleCard(req.user.customerId, id, dto.new_status);
  }
}
