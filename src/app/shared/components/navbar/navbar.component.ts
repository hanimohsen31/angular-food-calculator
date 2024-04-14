import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  constructor(private LoginService: LoginService) {}
  ngOnInit(): void {}

  isAdmin = this.LoginService.isAdmin$;
  heroImg = 'assets/images/f2.jpg';

  logout() {
    this.LoginService.logOut();
  }
}
