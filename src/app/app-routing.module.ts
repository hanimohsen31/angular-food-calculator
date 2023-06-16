import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FoodTableComponent } from './components/food-table/food-table.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { CalculatorPageComponent } from './pages/calculator-page/calculator-page.component';
import { AddNewPageComponent } from './pages/add-new-page/add-new-page.component';

const routes: Routes = [
  { path: 'calculator', component: CalculatorPageComponent },
  { path: 'add-new', component: AddNewPageComponent },
  { path: '**', redirectTo: 'calculator' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
