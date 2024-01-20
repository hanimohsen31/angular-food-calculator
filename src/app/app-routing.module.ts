import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorPageComponent } from './pages/calculator-page/calculator-page.component';
import { AddNewPageComponent } from './pages/add-new-page/add-new-page.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LoginComponent } from './components/login/login.component';
import { HidePagesAfterLoginGuard } from './services/hide-pages-after-login.guard';

import {
  AngularFireAuthGuard,
  redirectUnauthorizedTo,
} from '@angular/fire/compat/auth-guard';
import { NotesComponent } from './pages/notes/notes.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LandingComponent } from './pages/landing/landing.component';
import { TrackingComponent } from './pages/tracking/tracking.component';
import { PersonalDeitComponent } from './pages/personal-deit/personal-deit.component';
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
// const redirectUnauthorizedToHome = () => redirectUnauthorizedTo(['home']);

const routes: Routes = [
  {
    path: 'calculator',
    component: CalculatorPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'add-new',
    component: AddNewPageComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'notes',
    component: NotesComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'tracking',
    component: TrackingComponent,
    canActivate: [AngularFireAuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToLogin },
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [HidePagesAfterLoginGuard],
  },
  {
    path: 'home',
    component: LandingComponent,
    canActivate: [HidePagesAfterLoginGuard],
  },
  {
    path: 'deit',
    component: PersonalDeitComponent,
    canActivate: [redirectUnauthorizedToLogin],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
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
