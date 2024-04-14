import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalculatorComponent } from './calculator.component';
import { FoodTableComponent } from './food-table/food-table.component';
import { AddNewFoodComponent } from './add-new-food/add-new-food.component';
import { NotesComponent } from './notes/notes.component';
import { ProfileComponent } from './profile/profile.component';
import { TrackingComponent } from './tracking/tracking.component';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {
    path: '',
    component: CalculatorComponent,
    children: [
      { path: 'main', component: MainComponent },
      { path: 'add-new', component: AddNewFoodComponent },
      { path: 'notes', component: NotesComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'tracking', component: TrackingComponent },
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
