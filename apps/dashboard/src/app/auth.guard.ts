import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
class GuardSvc {
  constructor(private auth: AuthService, private router: Router) {}
  check() {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigateByUrl('/login');
    return false;
  }
}

export const authGuard: CanActivateFn = () => inject(GuardSvc).check();
