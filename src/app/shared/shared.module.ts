import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedRoutingModule } from './shared-routing.module';
import { SharedComponent } from './shared.component';

import { AngularMaterialModule } from './services/AngularMaterial';
import { MatNativeDateModule } from '@angular/material/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { InputComponent } from './components/input/input.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

@NgModule({
  declarations: [
    SharedComponent,
    NavbarComponent,
    InputComponent,
    NotFoundComponent,
  ],
  imports: [CommonModule, SharedRoutingModule, FormsModule],
  exports: [
    AngularMaterialModule,
    MatNativeDateModule,
    NavbarComponent,
    InputComponent,
    NotFoundComponent,
  ],
})
export class SharedModule {}
