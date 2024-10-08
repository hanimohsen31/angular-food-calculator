import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  isLoggedin = new BehaviorSubject(false);
  isLoggedin$ = this.isLoggedin.asObservable();

  isAdmin = new BehaviorSubject(false);
  isAdmin$ = this.isAdmin.asObservable();

  adminsEmail: any[] = environment.admins;

  constructor(
    private AngularFireAuth: AngularFireAuth,
    private Router: Router
  ) {}

  ngOnInit() {
    let user: any = localStorage.getItem('user');
    let email: any = JSON.parse(user)?.email;
    if (user) {
      this.isLoggedin.next(true);
      this.adminsEmail.find((eml) =>
        email === eml ? this.isAdmin.next(true) : null
      );
    } else {
      this.logOut();
    }
  }

  logInWithGoogle() {
    this.Router.navigate(['/calculator']);

    // this.AngularFireAuth.signInWithPopup(new GoogleAuthProvider()).then(
    //   (response: any) => {
    //     console.log(response);
    //     // save user info in localstorage
    //     let user = {
    //       idToken: response.credential.idToken,
    //       name: response.user.displayName,
    //       email: response.user.email,
    //       photoURL: response.user.photoURL,
    //       uid: response.additionalUserInfo.profile.id,
    //     };
    //     localStorage.setItem('user', JSON.stringify(user));
    //     // set isLoggedin status
    //     this.isLoggedin.next(true);
    //     // set admin status
    //     this.adminsEmail.find((eml) =>
    //       response.user.email === eml ? this.isAdmin.next(true) : null
    //     );
    //     this.Router.navigate(['/calculator']);
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );
  }

  logOut() {
    localStorage.removeItem('user');
    this.isLoggedin.next(false);
    this.AngularFireAuth.signOut();
    this.Router.navigate(['/home']);
  }
}
