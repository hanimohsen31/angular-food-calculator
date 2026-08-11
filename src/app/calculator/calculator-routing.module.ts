import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './calculator.component';
import { FoodTableComponent } from './food-table/food-table.component';
import { AddNewFoodComponent } from './add-new-food/add-new-food.component';
import { NotesComponent } from './notes/notes.component';
import { ProfileComponent } from './profile/profile.component';
import { TrackingComponent } from './tracking/tracking.component';
import { MainComponent } from './main/main.component';
import { RecipesComponent } from './recipes/recipes.component';
import { TargetComponent } from './target/target.component';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

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
      { path: 'notes', component: NotesComponent, canActivate: [AuthGuard] },
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
