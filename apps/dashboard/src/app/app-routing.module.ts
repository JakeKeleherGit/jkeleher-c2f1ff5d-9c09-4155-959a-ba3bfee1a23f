import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './auth.guard';

const routes: Routes = [
  { path: 'login', loadComponent: () => import('./login.component').then(m => m.LoginComponent) },
  { path: 'tasks', canActivate: [authGuard], loadComponent: () => import('./tasks.component').then(m => m.TasksComponent) },
  { path: 'audit', canActivate: [authGuard], loadComponent: () => import('./audit.component').then(m => m.AuditComponent) },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
