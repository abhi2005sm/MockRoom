import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const url = client.upgradeReq?.url || client.url || '';
    
    // Extract token query parameter
    const searchParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
    const token = searchParams.get('token');

    if (!token) {
      throw new UnauthorizedException('WebSocket connection token missing');
    }

    const payload = await this.authService.verifyWsToken(token);
    client.user = payload;
    return true;
  }
}
