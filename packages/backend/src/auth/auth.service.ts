import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { NodeRouterService } from '../database/node-router.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly nodeRouter: NodeRouterService,
  ) {}

  async login(email: string, password: string) {
    const customer = await this.findCustomerByEmail(email);
    if (!customer) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: Number(customer.id), role: 'customer' };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      customer_id: Number(customer.id),
      role: 'customer',
      expires_in: 3600,
    };
  }

  private async findCustomerByEmail(email: string) {
    for (const prisma of this.nodeRouter.getHealthyNodes()) {
      try {
        const customer = await prisma.customers.findUnique({ where: { email } });
        if (customer) return customer;
      } catch {
        // nodo inactivo en tiempo de ejecución, continuar con el siguiente
      }
    }
    return null;
  }
}
