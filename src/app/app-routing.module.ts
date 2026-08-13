import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    // login and signup, the guards send whoever is not signed in here
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'calculator',
    loadChildren: () => import('./calculator/calculator.module').then((m) => m.CalculatorModule),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'calculator',
  },
  {
    path: '**',
    redirectTo: 'calculator',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
