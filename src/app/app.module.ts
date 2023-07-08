import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialExampleModule } from './services/AngularMaterial';
import { AngularFireModule } from '@angular/fire/compat';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AppComponent } from './app.component';
import { FoodTableComponent } from './components/food-table/food-table.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToFixedPipe } from './services/to-fixed.pipe';
import { SumComponent } from './components/sum/sum.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { AddNewPageComponent } from './pages/add-new-page/add-new-page.component';
import { CalculatorPageComponent } from './pages/calculator-page/calculator-page.component';
import { LoginComponent } from './components/login/login.component';
import { environment } from '../environments/environment';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NotesComponent } from './pages/notes/notes.component';
import { ProfileComponent } from './pages/profile/profile.component';

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
    LoginComponent,
    NotFoundComponent,
    NotesComponent,
    ProfileComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MaterialExampleModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireModule,
    // ------------------
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
