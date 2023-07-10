import { Component, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { LoginService } from 'src/app/services/login.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(private LoginService: LoginService) {}
  isLoggedIn$ = this.LoginService.isLoggedinAction$;
  isAdmin = this.LoginService.isAdmin$;
  ngOnInit(): void {}

  heroImg = 'assets/images/f2.jpg';
  // 'https://cals.cornell.edu/sites/default/files/styles/hero_home_desktop/public/2022-06/ifs-hero-food-still-life-1920x1080x72.jpg?h=36398e41&itok=3jGAIYIE';
  logout() {
    this.LoginService.logOut();
  }
}
