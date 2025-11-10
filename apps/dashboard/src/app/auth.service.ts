import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'jwt';
  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${environment.api}/auth/login`, { email, password })
      .pipe(tap(res => localStorage.setItem(this.key, res.token)));
  }

  get token() { return localStorage.getItem(this.key) ?? ''; }
  logout() { localStorage.removeItem(this.key); }
  isLoggedIn() { return !!this.token; }

  get role(): 'owner' | 'admin' | 'viewer' | '' {
  try {
    const t = this.token;
    if (!t) return '';
    const payload = JSON.parse(atob(t.split('.')[1]));
    return payload.role || '';
  } catch {
    return '';
  }
}


}
