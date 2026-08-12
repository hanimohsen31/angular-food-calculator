import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from '../login.service';

// keeps a signed in user away from the login page
@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  constructor(private LoginService: LoginService, private Router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.LoginService.isLoggedin.getValue()) {
      return this.Router.createUrlTree(['/calculator/main']);
    }
    return true;
  }
}
