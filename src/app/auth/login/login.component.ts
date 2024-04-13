import { Component, OnInit } from '@angular/core';
import { LoginService } from '../login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private LoginService: LoginService, private Router: Router) {}

  logInWithGoogle() {
    this.LoginService.logInWithGoogle();
  }
  goBack() {
    this.Router.navigate(['/home']);
  }
}
