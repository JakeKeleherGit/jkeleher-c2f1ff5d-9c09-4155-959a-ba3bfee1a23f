import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export interface Task { id: number; title: string; done: boolean; category?: string | null; }

@Injectable({ providedIn: 'root' })
export class TasksService {
  private base = `${environment.api}/tasks`;
  constructor(private http: HttpClient) {}
  list() { return this.http.get<Task[]>(this.base); }
  create(title: string, category?: string) { return this.http.post<Task>(this.base, { title, category }); }
  update(id: number, patch: Partial<Task>) { return this.http.put<Task>(`${this.base}/${id}`, patch); }
  remove(id: number) { return this.http.delete(`${this.base}/${id}`); }
  reorder(ids: number[]) {return this.http.patch(`${this.base}/reorder`, { ids });
}
}
