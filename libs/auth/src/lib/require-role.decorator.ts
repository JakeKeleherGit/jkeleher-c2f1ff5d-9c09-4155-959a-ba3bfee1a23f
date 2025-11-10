// libs/auth/src/lib/require-role.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const REQUIRE_ROLE = 'require_role';
export const RequireRole = (...roles: ('owner'|'admin'|'viewer')[]) =>
  SetMetadata(REQUIRE_ROLE, roles);
