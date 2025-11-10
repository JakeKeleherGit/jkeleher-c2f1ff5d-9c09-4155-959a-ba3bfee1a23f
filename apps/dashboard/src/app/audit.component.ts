import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="row">
    <h2 class="h2 mr-auto">Audit Log</h2>
    <a routerLink="/tasks" class="btn">Back to Tasks</a>
  </div>

  <p *ngIf="error" class="error mt-2">{{ error }}</p>
  <button class="btn mt-2" (click)="refresh()">Refresh</button>

  <ul class="mt-2">
    <li *ngFor="let a of logs">
      {{ a.ts | date:'short' }} — {{ a.type }} — {{ a.data | json }}
    </li>
  </ul>
`

})
export class AuditComponent {
  logs: any[] = [];
  error = '';
  constructor(private http: HttpClient) { this.refresh(); }
  refresh() {
    this.error = '';
    this.http.get<any[]>(`${environment.api}/audit-log`).subscribe({
      next: d => this.logs = d,
      error: e => this.error = `${e.status}: ${e.error?.message || 'Forbidden'}`
    });
  }
}
