import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="row">
    <h2 class="h2 mr-auto">Login</h2>
  </div>

  <form (ngSubmit)="submit()" class="mt-2">
    <div class="row">
      <input [(ngModel)]="email" name="email" placeholder="email" style="min-width:260px" />
      <input [(ngModel)]="password" name="password" type="password" placeholder="password" style="min-width:220px" />
      <button class="btn btn-primary">Sign in</button>
    </div>
  </form>

  <p *ngIf="error" class="error mt-2">{{ error }}</p>
`
})
export class LoginComponent {
  email = 'admin@acme.test';
  password = 'pass123';
  error = '';
  constructor(private auth: AuthService, private router: Router) {}
  submit() {
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigateByUrl('/tasks'),
      error: e => this.error = e.error?.message ?? 'Login failed'
    });
  }
}
