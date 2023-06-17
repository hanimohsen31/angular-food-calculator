import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  isLoggedin$ = new BehaviorSubject(false);
  isLoggedinAction$ = this.isLoggedin$.asObservable();

  constructor(
    private _AngularFireAuth: AngularFireAuth,
    private _Router: Router
  ) {
    if (localStorage.getItem('user')) {
      this.isLoggedin$.next(true);
    }
  }

  logInWithGoogle() {
    this._AngularFireAuth.signInWithPopup(new GoogleAuthProvider()).then(
      (response: any) => {
        let user = {
          idToken: response.credential.idToken,
          name: response.user.displayName,
          email: response.user.email,
          photoURL: response.user.photoURL,
          uid: response.additionalUserInfo.profile.id,
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.isLoggedin$.next(true);
        this._Router.navigate(['calculator']);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  logOut() {
    this.isLoggedin$.next(false);
    localStorage.removeItem('user');
    this._AngularFireAuth.signOut();
  }
}
