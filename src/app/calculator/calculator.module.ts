import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// shared
import { CalculatorRoutingModule } from './calculator-routing.module';
import { AngularMaterialModule } from './services/AngularMaterial';
import { MatNativeDateModule } from '@angular/material/core';
// components
import { CalculatorComponent } from './calculator.component';
import { FoodTableComponent } from './components/food-table/food-table.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MainComponent } from './components/main/main.component';
import { SumComponent } from './components/sum/sum.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { RecipesComponent } from './components/recipes/recipes.component';
import { TargetComponent } from './components/target/target.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InputComponent } from './components/input/input.component';
// services
import { ToFixedPipe } from './services/to-fixed.pipe';

@NgModule({
  declarations: [
    CalculatorComponent,
    AddNewFoodComponent,
    FoodTableComponent,
    ProfileComponent,
    SumComponent,
    MainComponent,
    TrackingComponent,
    RecipesComponent,
    TargetComponent,
    NavbarComponent,
    InputComponent,
    ToFixedPipe,
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    CalculatorRoutingModule,
  ],
})
export class CalculatorModule {}
