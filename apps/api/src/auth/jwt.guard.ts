// apps/api/src/auth/jwt.guard.ts (example)
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwt.verify(token) as { sub:number; email:string; role:string; orgId:number|null };
      req.user = payload; // <-- contains orgId now
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}