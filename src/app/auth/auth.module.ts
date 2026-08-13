import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoggedInGuard } from './guards/logged-in.guard';

const routes: Routes = [
  { path: '', component: AuthComponent, canActivate: [LoggedInGuard] },
];

@NgModule({
  declarations: [AuthComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule.forChild(routes)],
})
export class AuthModule {}
