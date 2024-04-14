import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class LoggedInGuard implements CanActivate {
  isLoggedIn = new BehaviorSubject(false);

  constructor(private LoginService: LoginService, private Router: Router) {
    this.LoginService.isLoggedin$.subscribe((res) => {
      this.isLoggedIn.next(res);
    });
  }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.isLoggedIn.getValue()) {
      this.Router.navigate(['/calculator']);
      return false;
    } else {
      return true;
    }
  }
}
