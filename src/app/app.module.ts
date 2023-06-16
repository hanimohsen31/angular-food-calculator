import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FoodTableComponent } from './components/food-table/food-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialExampleModule } from './store/AngularMaterial';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ToFixedPipe } from './store/to-fixed.pipe';
import { HttpClientModule } from '@angular/common/http';
import { SumComponent } from './components/sum/sum.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { AddNewPageComponent } from './pages/add-new-page/add-new-page.component';
import { CalculatorPageComponent } from './pages/calculator-page/calculator-page.component';
@NgModule({
  declarations: [
    AppComponent,
    FoodTableComponent,
    NavbarComponent,
    ToFixedPipe,
    SumComponent,
    AddNewFoodComponent,
    AddNewPageComponent,
    CalculatorPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MaterialExampleModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
