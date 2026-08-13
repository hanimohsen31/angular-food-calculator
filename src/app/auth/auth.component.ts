import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

// one page for both, the same fields are typed either way and the extra ones a
// new account needs are only shown while it is being created
@Component({
  standalone: false,
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  mode: 'login' | 'signup' = 'login';
  loading: boolean = false;
  errorMessage: string = '';
  showPassword: boolean = false;

  loginForm = new FormGroup({
    // the server takes a username or an email in the same field
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  signupForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(30),
      Validators.pattern(/^[a-zA-Z0-9._-]+$/),
    ]),
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  constructor(private LoginService: LoginService, private Router: Router) {}

  get form(): FormGroup {
    return this.mode === 'login' ? this.loginForm : this.signupForm;
  }

  // a field only complains once it has been visited or the form was submitted,
  // nothing is red while it is still being filled in for the first time
  showError(name: string): boolean {
    let control = this.form.get(name);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  get passwordsDiffer(): boolean {
    let { password, confirmPassword } = this.signupForm.value;
    return !!confirmPassword && password !== confirmPassword;
  }

  // length is the only rule the server has, so the bar only reads length
  get passwordStrength(): number {
    let length = (this.signupForm.value.password || '').length;
    return Math.min(100, Math.round((length / 12) * 100));
  }

  get passwordStrengthLabel(): string {
    let strength = this.passwordStrength;
    if (strength < 67) {
      return 'Too short';
    }
    return strength < 100 ? 'Good' : 'Strong';
  }

  switchMode(mode: 'login' | 'signup') {
    this.mode = mode;
    this.errorMessage = '';
    this.showPassword = false;
  }

  onSubmit() {
    if (this.loading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Fill in every field before submitting';
      return;
    }
    if (
      this.mode === 'signup' &&
      this.signupForm.value.password !== this.signupForm.value.confirmPassword
    ) {
      this.errorMessage = 'The two passwords are not the same';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    let request =
      this.mode === 'login'
        ? this.LoginService.login(this.loginForm.value)
        : this.LoginService.signup(this.signupForm.value);

    request.subscribe({
      next: () => {
        this.loading = false;
        // login and signup both land on the calculator, the app is entered
        // there whether there is an account behind it or not
        this.Router.navigate(['/calculator/main']);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'That did not work, try again';
      },
    });
  }
}
