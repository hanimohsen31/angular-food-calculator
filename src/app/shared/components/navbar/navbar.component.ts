import { Component, OnInit } from '@angular/core';
import { user } from '@angular/fire/auth';
import { LoginService } from 'src/app/auth/login.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  constructor(private LoginService: LoginService) {}
  ngOnInit(): void {}

  isLoggedIn$ = this.LoginService.isLoggedin$;
  isAdmin = this.LoginService.isAdmin$;
  heroImg = 'assets/images/f2.jpg';

  logout() {
    this.LoginService.logOut();
  }
}
