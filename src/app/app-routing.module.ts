import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodTableComponent } from './components/food-table/food-table.component';

const routes: Routes = [
  { path: 'table', component: FoodTableComponent },
  { path: '', pathMatch: 'full', redirectTo: 'table' },
  { path: '**', redirectTo: 'table' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
