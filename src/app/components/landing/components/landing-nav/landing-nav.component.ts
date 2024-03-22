import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-nav',
  templateUrl: './landing-nav.component.html',
  styleUrls: ['./landing-nav.component.scss'],
})
export class LandingNavComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  navigateToSection(section: string) {
    window.location.hash = '/home';
    window.location.hash = section;
  }
}
