import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_ROLE } from '@turbovets21/auth'; // path based on npmScope

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext) {
    const allowed = this.reflector.get<(string[])>(REQUIRE_ROLE, ctx.getHandler()) || [];
    
    if (allowed.length === 0) 
      return true;
    
    const req = ctx.switchToHttp().getRequest();
    const role: 'owner'|'admin'|'viewer' = req.user?.role;
    
    if (!role) throw new ForbiddenException();
    
    // Simple inheritance: owner > admin > viewer
    const weight = (r: string) => r==='owner'?3:r==='admin'?2:1;
    const maxAllowed = Math.max(...allowed.map(weight));
    
    if (weight(role) >= maxAllowed) return true;
    throw new ForbiddenException();
  }
}
