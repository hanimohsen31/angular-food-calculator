import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingRoutingModule } from './landing-routing.module';
import { LandingComponent } from './landing.component';
// components
import { LandingAboutComponent } from './landing-about/landing-about.component';
import { LandingFooterComponent } from './landing-footer/landing-footer.component';
import { LandingHeroComponent } from './landing-hero/landing-hero.component';
import { LandingNavComponent } from './landing-nav/landing-nav.component';
import { LandingTeamComponent } from './landing-team/landing-team.component';

let components = [
  LandingAboutComponent,
  LandingFooterComponent,
  LandingHeroComponent,
  LandingNavComponent,
  LandingTeamComponent
]
@NgModule({
  declarations: [
    ...components,
    LandingComponent,
  ],
  imports: [
    CommonModule,
    LandingRoutingModule
  ]
})
export class LandingModule { }
