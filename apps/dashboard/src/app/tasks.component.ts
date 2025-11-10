import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService, Task } from './tasks.service';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  template: `
  <div class="tasks-header">
    <div class="tasks-header-left">
      <h2>Tasks</h2>
        <span class="role-badge">Role: {{ auth.role }}</span>
        <a routerLink="/audit" class="btn mr-auto">Audit Log</a>
      </div>
    <button class="btn btn-logout" (click)="logout()">Logout</button>
  </div>

  <!-- Filters -->
  <div class="row mt-2">
    <label>Category:
      <select [(ngModel)]="filter" name="filter" (change)="applyFilter()">
        <option value="">All</option>
        <option *ngFor="let c of categories" [value]="c">{{ c }}</option>
      </select>
    </label>

    <label>Sort:
      <select [(ngModel)]="sort" name="sort" (change)="applyFilter()">
        <option value="order">Manual</option>
        <option value="id">Newest</option>
        <option value="title">Title</option>
        <option value="done">Status</option>
      </select>
    </label>
  </div>

  <!-- Create -->
  <form (ngSubmit)="add()" class="mt-2">
    <div class="row">
      <input [(ngModel)]="title" name="title" placeholder="title" [disabled]="isViewer()" class="mr-2" />
      <button class="btn btn-success" [disabled]="pending || isViewer()">Add</button>
    </div>
  </form>

  <p *ngIf="error" class="error mt-2">{{ error }}</p>

  <!-- List with drag & drop -->
  <ul cdkDropList (cdkDropListDropped)="dropped($event)" class="mt-2">
    <li *ngFor="let t of tasks; let i = index" cdkDrag>
      <span *ngIf="!isViewer()" class="cdk-drag-handle" style="cursor:grab;">⋮⋮</span>
      <input type="checkbox" [checked]="t.done" (change)="toggle(t)" [disabled]="isViewer()" />
      <strong>[{{ t.category || 'General' }}]</strong> {{ t.title }}
      <button class="btn btn-danger" (click)="del(t)" [disabled]="isViewer()">Delete</button>
    </li>
  </ul>

  <p *ngIf="tasks.length===0" class="mt-2">No tasks yet.</p>
`
})
export class TasksComponent {
  public tasks: Task[] = [];
  public raw: Task[] = [];                    // unfiltered source
  public title = '';
  public error = '';
  public pending = false;

  // filter/sort state
  public filter = '';                          // '' = All
  public sort: 'order' | 'id' | 'title' | 'done' = 'order'; // default to manual order
  public categories = ['General', 'Work', 'Personal'];

  constructor(
    private api: TasksService,
    public auth: AuthService,
    private router: Router
  ) {
    this.refresh();
  }

  refresh() {
    this.error = '';
    this.api.list().subscribe({
      next: ts => { this.raw = ts; this.applyFilter(); },
      error: e => this.error = this.msg(e)
    });
  }

  applyFilter() {
    let v = [...this.raw];
    if (this.filter) v = v.filter(t => (t.category || 'General') === this.filter);

    // When sort=order we keep backend order (position ASC)
    if (this.sort === 'title') v.sort((a, b) => a.title.localeCompare(b.title));
    else if (this.sort === 'done') v.sort((a, b) => Number(a.done) - Number(b.done));
    else if (this.sort === 'id') v.sort((a, b) => b.id - a.id); // newest first

    this.tasks = v;
  }

  add() {
    if (!this.title.trim()) return;
    this.pending = true;
    this.error = '';
    const category = this.filter || undefined;
    this.api.create(this.title.trim(), category).subscribe({
      next: _ => { this.title = ''; this.refresh(); this.pending = false; },
      error: e => { this.error = this.msg(e); this.pending = false; }
    });
  }

  toggle(t: Task) {
    this.error = '';
    this.api.update(t.id, { done: !t.done }).subscribe({
      next: _ => this.refresh(),
      error: e => this.error = this.msg(e)
    });
  }

  del(t: Task) {
    this.error = '';
    this.api.remove(t.id).subscribe({
      next: _ => this.refresh(),
      error: e => this.error = this.msg(e)
    });
  }

  // Drag & drop handler
  dropped(ev: CdkDragDrop<Task[]>) {
    if (this.isViewer()) return; // viewers cannot reorder
    moveItemInArray(this.tasks, ev.previousIndex, ev.currentIndex);
    const ids = this.tasks.map(t => t.id);
    this.api.reorder(ids).subscribe({
      next: () => {},
      error: e => { this.error = this.msg(e); this.refresh(); } // rollback by refresh
    });
  }

  isViewer() { return this.auth.role === 'viewer'; }
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }

  private msg(e: any) {
    const m = e?.error?.message || e?.message || 'Request failed';
    return e?.status ? `${e.status}: ${m}` : m;
  }
}
