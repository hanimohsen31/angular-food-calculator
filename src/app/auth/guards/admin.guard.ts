import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from '../login.service';

// the food list is shared by everyone using the app, so writing to it is kept
// to the admin emails, a signed in user alone is not enough here
@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private LoginService: LoginService, private Router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.LoginService.isAdmin.getValue()) {
      return true;
    }
    // a signed in user is simply not allowed here, sending them to the login
    // page would only loop them back, so they land on the calculator
    return this.Router.createUrlTree(['/calculator/main']);
  }
}
