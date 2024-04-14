import { Component, OnInit } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent implements OnInit {
  constructor(private LoginService: LoginService, private Router: Router) {}
  ngOnInit() {}

  logInWithGoogle() {
    this.LoginService.logInWithGoogle();
  }
  goBack() {
    this.Router.navigate(['/landing']);
  }
}
