import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OperationsService } from '../calculator/services/operations.service';
import { TOKEN_KEY, USER_KEY } from './session';

export { TOKEN_KEY, USER_KEY } from './session';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private url = `${environment.baseUrl}${environment.apiPrefix}`;

  isLoggedin = new BehaviorSubject(false);
  isLoggedin$ = this.isLoggedin.asObservable();

  isAdmin = new BehaviorSubject(false);
  isAdmin$ = this.isAdmin.asObservable();

  // the account behind the calculator right now, null for a guest
  currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private HttpClient: HttpClient,
    private Router: Router,
    private OperationsService: OperationsService
  ) {
    // a service never gets an ngOnInit hook, so the stored session
    // has to be read here, otherwise every reload looks logged out
    this.restoreSession();
  }

  get token(): string {
    return localStorage.getItem(TOKEN_KEY) || '';
  }

  restoreSession() {
    let stored = localStorage.getItem(USER_KEY);
    if (!stored || !this.token) {
      return;
    }
    try {
      this.applySession(JSON.parse(stored));
    } catch (error) {
      // a corrupted entry is not a session
      this.clearSession();
      return;
    }
    // the stored user is only what the last request saw, the server is asked
    // again so a demoted, disabled or deleted account stops being one here too
    this.HttpClient.get(`${this.url}/me`).subscribe({
      next: (res: any) => this.applySession(res?.data),
      error: () => this.clearSession(),
    });
  }

  // ------------------------------ session ------------------------------
  private applySession(user: any) {
    if (!user) {
      return;
    }
    let stored = { ...user };
    // the token is kept on its own key, it does not belong on the user entry
    delete stored.token;
    localStorage.setItem(USER_KEY, JSON.stringify(stored));
    this.currentUser.next(stored);
    this.isLoggedin.next(true);
    this.isAdmin.next(stored?.role === 'admin');
  }

  private clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.next(null);
    this.isLoggedin.next(false);
    this.isAdmin.next(false);
  }

  // the token comes back beside the user on signup, login and a password
  // change, all three open a session from the same place
  private openSession(res: any) {
    let user = res?.data;
    if (user?.token) {
      localStorage.setItem(TOKEN_KEY, user.token);
    }
    this.applySession(user);
    // the calculator can already be the open page, the list of the user who
    // just signed in is pulled here rather than waiting on a page to load,
    // and their target and body come down with it so the calculator opens
    // on what they set on whichever device they set it
    this.OperationsService.loadSettings();
    this.OperationsService.loadAddedFoodList();
  }

  // ------------------------------ endpoints ------------------------------
  signup(body: any): Observable<any> {
    return this.HttpClient.post(`${this.url}/signup`, body).pipe(
      tap((res: any) => this.openSession(res))
    );
  }

  login(body: any): Observable<any> {
    return this.HttpClient.post(`${this.url}/login`, body).pipe(
      tap((res: any) => this.openSession(res))
    );
  }

  updateProfile(body: any): Observable<any> {
    return this.HttpClient.patch(`${this.url}/me`, body).pipe(
      tap((res: any) => this.applySession(res?.data))
    );
  }

  changePassword(body: any): Observable<any> {
    return this.HttpClient.patch(`${this.url}/me/password`, body).pipe(
      // a password change invalidates every token issued before it, the fresh
      // one comes back with the response
      tap((res: any) => this.openSession(res))
    );
  }

  deleteAccount(): Observable<any> {
    return this.HttpClient.delete(`${this.url}/me`).pipe(tap(() => this.logOut()));
  }

  logOut() {
    // what was pulled down for this user is taken out of the browser first, it
    // is kept under their id and that is only readable while the session is
    this.OperationsService.clearUserSettings();
    this.clearSession();
    // the calculator is already the open page, so nothing re init it, the table
    // of the user who just left is dropped here instead, together with the
    // target and the body their day was being read against
    this.OperationsService.resetToGuest();
    this.Router.navigate(['/calculator/main']);
  }
}
