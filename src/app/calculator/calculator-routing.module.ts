import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './calculator.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { ProfileComponent } from './components/profile/profile.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { MainComponent } from './components/main/main.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { TargetComponent } from './components/target/target.component';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

const routes: Routes = [
  {
    path: '',
    component: CalculatorComponent,
    children: [
      // open to everyone, a guest can sum calories here without an account
      { path: 'main', component: MainComponent },
      // the daily target is a setting of this browser, a guest sets it too
      { path: 'target', component: TargetComponent },
      // adding to the shared food list is left to the admin emails
      { path: 'add-new', component: AddNewFoodComponent, canActivate: [AuthGuard, AdminGuard] },
      { path: 'recipes', component: RecipesComponent, canActivate: [AuthGuard, AdminGuard] },
      // the rest belongs to an account
      { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
      { path: 'tracking', component: TrackingComponent, canActivate: [AuthGuard] },
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: '**', redirectTo: 'main' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalculatorRoutingModule {}
