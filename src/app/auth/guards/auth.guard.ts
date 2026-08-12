import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { LoginService } from '../login.service';

// guards everything a guest is not allowed to reach, the calculator tab itself
// stays open so calories can be summed without an account
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private LoginService: LoginService, private Router: Router) {}

  canActivate(): boolean | UrlTree {
    if (this.LoginService.isLoggedin.getValue()) {
      return true;
    }
    return this.Router.createUrlTree(['/auth']);
  }
}
