import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
// shared
import { CalculatorRoutingModule } from './calculator-routing.module';
import { SharedModule } from '../shared/shared.module';
// components
import { CalculatorComponent } from './calculator.component';
import { FoodTableComponent } from './food-table/food-table.component';
import { AddNewFoodComponent } from './add-new-food/add-new-food.component';
import { ProfileComponent } from './profile/profile.component';
import { NotesComponent } from './notes/notes.component';
import { MainComponent } from './main/main.component';
import { SumComponent } from './sum/sum.component';
import { TrackingComponent } from './tracking/tracking.component';
import { ToFixedPipe } from '../shared/services/to-fixed.pipe';

@NgModule({
  declarations: [
    CalculatorComponent,
    AddNewFoodComponent,
    FoodTableComponent,
    ProfileComponent,
    NotesComponent,
    SumComponent,
    MainComponent,
    TrackingComponent,
    ToFixedPipe,
  ],
  imports: [
    CommonModule,
    CalculatorRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
  ],
})
export class CalculatorModule {}
