import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/auth/login.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = null;
  img: string = '';
  initials: string = '';

  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;

  savingProfile: boolean = false;
  profileMessage: string = '';
  profileError: string = '';

  savingPassword: boolean = false;
  passwordMessage: string = '';
  passwordError: string = '';

  deletePopup: boolean = false;
  deleting: boolean = false;
  deleteError: string = '';

  profileForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    photoURL: new FormControl(''),
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  constructor(private LoginService: LoginService) {}

  ngOnInit(): void {
    // the user is followed rather than read once, a save further down this page
    // puts the updated one back through the same stream
    this.LoginService.currentUser$.subscribe({
      next: (user: any) => {
        this.user = user;
        this.img = user?.photoURL || '';
        this.initials = this.readInitials(user);
        this.profileForm.patchValue(
          {
            name: user?.name || '',
            email: user?.email || '',
            photoURL: user?.photoURL || '',
          },
          { emitEvent: false }
        );
      },
    });
  }

  // the avatar falls back to the first letters of the name, so a user without a
  // photo still gets something of their own rather than a blank circle
  private readInitials(user: any): string {
    const source: string = user?.name || user?.username || user?.email || '';
    return source
      .trim()
      .split(/[\s._-]+/)
      .filter((part: string) => part.length > 0)
      .slice(0, 2)
      .map((part: string) => part[0].toUpperCase())
      .join('');
  }

  // ------------------------------ profile ------------------------------
  saveProfile() {
    if (this.savingProfile || this.profileForm.invalid) {
      this.profileError = 'A valid email is required';
      return;
    }
    this.savingProfile = true;
    this.profileMessage = '';
    this.profileError = '';
    this.LoginService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.savingProfile = false;
        this.profileMessage = 'Profile saved';
      },
      error: (err: any) => {
        this.savingProfile = false;
        this.profileError = err?.error?.message || 'Could not save the profile';
      },
    });
  }

  // ------------------------------ password ------------------------------
  savePassword() {
    if (this.savingPassword) {
      return;
    }
    if (this.passwordForm.invalid) {
      this.passwordError = 'A new password of at least eight characters is required';
      return;
    }
    if (this.passwordForm.value.password !== this.passwordForm.value.confirmPassword) {
      this.passwordError = 'The two passwords are not the same';
      return;
    }
    this.savingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';
    this.LoginService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.savingPassword = false;
        this.passwordMessage = 'Password changed';
        this.passwordForm.reset();
      },
      error: (err: any) => {
        this.savingPassword = false;
        this.passwordError = err?.error?.message || 'Could not change the password';
      },
    });
  }

  // ------------------------------ account ------------------------------
  toggleDeletePopup() {
    this.deletePopup = !this.deletePopup;
    this.deleteError = '';
  }

  // the settings and every tracked day go with the account, the server takes
  // them off together, there is nothing left to own them
  deleteAccount() {
    if (this.deleting) {
      return;
    }
    this.deleting = true;
    this.LoginService.deleteAccount().subscribe({
      next: () => {
        this.deleting = false;
        this.deletePopup = false;
      },
      error: (err: any) => {
        this.deleting = false;
        this.deleteError = err?.error?.message || 'Could not delete the account';
      },
    });
  }
}
