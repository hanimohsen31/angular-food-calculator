import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  isLoggedin$ = new BehaviorSubject(false);
  isLoggedinAction$ = this.isLoggedin$.asObservable();

  isAdmin$ = new BehaviorSubject(false);
  isAdminAction$ = this.isAdmin$.asObservable();

  adminsEmail: any[] = environment.admins;

  constructor(
    private _AngularFireAuth: AngularFireAuth,
    private Router: Router,
    private ActivatedRoute:ActivatedRoute
  ) {
    let user: any = localStorage.getItem('user');
    let email: any = JSON.parse(user)?.email;
    if (user) {
      this.isLoggedin$.next(true);
      this.adminsEmail.find((eml) =>
        email === eml ? this.isAdmin$.next(true) : null
      );
    } else {
      this.logOut();
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
        this.adminsEmail.find((eml) =>
          response.user.email === eml ? this.isAdmin$.next(true) : null
        );
        this.Router.navigate(['calculator']);
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
    this.Router.navigate(['/home']);
  }

  getCurruntUrl(){
    console.log(this.ActivatedRoute.snapshot)
  }
}
