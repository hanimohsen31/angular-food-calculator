import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

// the back gesture on a phone leaves the app in one press, which is easy to do
// by accident while scrolling, so the home screen asks for it twice
const HOME_ROUTE = '/calculator/main';
const MOBILE_WIDTH = 767;
const EXIT_WINDOW = 2000;

@Component({
  standalone: false,
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <div class="exitToast" [class.show]="showExitHint" role="status" aria-live="polite">
      Press back again to exit
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'food-calculator';
  showExitHint: boolean = false;

  // an extra history entry sits on top of the home screen, the first back press
  // spends it instead of leaving the app
  private guardArmed: boolean = false;
  private lastBackPress: number = 0;
  private hintTimer: any = null;

  constructor(private Router: Router) {}

  ngOnInit() {
    this.Router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        let url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
        if (url === HOME_ROUTE) {
          this.armGuard();
        } else {
          // every other screen has somewhere to go back to inside the app, the
          // press belongs to the router there
          this.guardArmed = false;
          this.hideHint();
        }
      });
  }

  @HostListener('window:popstate')
  onPopState() {
    if (!this.guardArmed) {
      return;
    }
    this.guardArmed = false;

    let now = Date.now();
    if (now - this.lastBackPress < EXIT_WINDOW) {
      // the second press inside the window is let through, it lands on
      // whatever was open before the app and closes an installed one
      this.hideHint();
      history.back();
      return;
    }

    this.lastBackPress = now;
    this.armGuard();
    this.showHint();
  }

  private armGuard() {
    if (this.guardArmed || !this.isMobile()) {
      return;
    }
    history.pushState({ exitGuard: true }, '', location.href);
    this.guardArmed = true;
  }

  private isMobile(): boolean {
    return window.innerWidth <= MOBILE_WIDTH;
  }

  private showHint() {
    this.showExitHint = true;
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => (this.showExitHint = false), EXIT_WINDOW);
  }

  private hideHint() {
    clearTimeout(this.hintTimer);
    this.showExitHint = false;
  }
}
