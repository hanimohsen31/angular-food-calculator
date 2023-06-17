import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  heroImg =
  'https://cals.cornell.edu/sites/default/files/styles/hero_home_desktop/public/2022-06/ifs-hero-food-still-life-1920x1080x72.jpg?h=36398e41&itok=3jGAIYIE';

}
