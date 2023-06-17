import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(private _AngularFireAuth: AngularFireAuth) {}

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
        localStorage.setItem("user" , JSON.stringify(user))
        console.log(user);
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
