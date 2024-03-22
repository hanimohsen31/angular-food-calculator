import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { MaterialExampleModule } from './services/imports/AngularMaterial';
import { ReactiveFormsModule } from '@angular/forms';

// import { PrimeNgModule } from './services/PrimeNgModules';
import { AngularFireModule } from '@angular/fire/compat';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AppComponent } from './app.component';
import { FoodTableComponent } from './components/calculator-page/components/food-table/food-table.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { ToFixedPipe } from './services/pipes/to-fixed.pipe';
import { SumComponent } from './components/calculator-page/components/sum/sum.component';
import { AddNewFoodComponent } from './components/add-new-food/add-new-food.component';
import { CalculatorPageComponent } from './components/calculator-page/calculator-page.component';
import { LoginComponent } from './components/login/login.component';
import { environment } from '../environments/environment';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NotesComponent } from './components/notes/notes.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LandingComponent } from './components/landing/landing.component';
import { LandingNavComponent } from './components/landing/components/landing-nav/landing-nav.component';
import { LandingHeroComponent } from './components/landing/components/landing-hero/landing-hero.component';
import { LandingAboutComponent } from './components/landing/components/landing-about/landing-about.component';
import { LandingTeamComponent } from './components/landing/components/landing-team/landing-team.component';
import { LandingContactComponent } from './components/landing/components/landing-contact/landing-contact.component';
import { LandingMapComponent } from './components/landing/components/landing-map/landing-map.component';
import { LandingFooterComponent } from './components/landing/components/landing-footer/landing-footer.component';
import { TrackingComponent } from './components/tracking/tracking.component';
import { InputComponent } from './shared/input/input.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    FoodTableComponent,
    NavbarComponent,
    ToFixedPipe,
    SumComponent,
    AddNewFoodComponent,
    CalculatorPageComponent,
    LoginComponent,
    NotFoundComponent,
    NotesComponent,
    ProfileComponent,
    LandingComponent,
    LandingNavComponent,
    LandingHeroComponent,
    LandingAboutComponent,
    LandingTeamComponent,
    LandingContactComponent,
    LandingMapComponent,
    LandingFooterComponent,
    TrackingComponent,
    InputComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    CommonModule,
    MaterialExampleModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireModule,
    ReactiveFormsModule,
    // ------------------
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    // ------------------
    // PrimeNgModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
