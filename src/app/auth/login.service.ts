import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OperationsService } from 'src/app/shared/services/operations.service';

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
    private Router: Router,
    private OperationsService: OperationsService
  ) {
    // a service never gets an ngOnInit hook, so the stored session
    // has to be read here, otherwise every reload looks logged out
    this.restoreSession();
  }

  restoreSession() {
    let user: any = localStorage.getItem('user');
    if (!user) {
      return;
    }
    try {
      let email = JSON.parse(user)?.email;
      this.isLoggedin.next(true);
      this.setAdminStatus(email);
    } catch (error) {
      // a corrupted entry is not a session
      localStorage.removeItem('user');
    }
  }

  setAdminStatus(email: string) {
    this.isAdmin.next(this.adminsEmail.includes(email));
  }

  logInWithGoogle() {
    this.AngularFireAuth.signInWithPopup(new GoogleAuthProvider()).then(
      (response: any) => {
        console.log(response);
        // save user info in localstorage
        let user = {
          idToken: response.credential.idToken,
          name: response.user.displayName,
          email: response.user.email,
          photoURL: response.user.photoURL,
          uid: response.additionalUserInfo.profile.id,
        };
        localStorage.setItem('user', JSON.stringify(user));
        // set isLoggedin status
        this.isLoggedin.next(true);
        // set admin status
        this.setAdminStatus(response.user.email);
        // the calculator can already be the open page, the list of the user who
        // just signed in is pulled here rather than waiting on a page to load
        this.OperationsService.loadAddedFoodList();
        // login and logout both land on the calculator, the app is entered
        // there whether there is an account behind it or not
        this.Router.navigate(['/calculator/main']);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  logOut() {
    localStorage.removeItem('user');
    this.isLoggedin.next(false);
    this.isAdmin.next(false);
    // the calculator is already the open page, so nothing re init it, the table
    // of the user who just left is dropped here instead
    this.OperationsService.resetToGuest();
    this.AngularFireAuth.signOut();
    this.Router.navigate(['/calculator/main']);
  }
}
