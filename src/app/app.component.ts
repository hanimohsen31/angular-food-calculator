import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { PwaInstallService } from './calculator/services/pwa-install.service';

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
      {{ hintText }}
    </div>
  `,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'food-calculator';
  showExitHint: boolean = false;
  hintText: string = 'Press back again to exit';

  // an extra history entry sits on top of the home screen, the first back press
  // spends it instead of leaving the app
  private guardArmed: boolean = false;
  private lastBackPress: number = 0;
  private hintTimer: any = null;
  private routerSub: Subscription | null = null;

  constructor(private Router: Router, private pwa: PwaInstallService) {}

  ngOnInit() {
    this.hintText = this.isInstalled()
      ? 'Press back again to close the app'
      : 'Press back again to exit';

    this.routerSub = this.Router.events
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

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    clearTimeout(this.hintTimer);
  }

  @HostListener('window:popstate')
  onPopState() {
    if (!this.guardArmed) {
      return;
    }
    this.guardArmed = false;

    let now = Date.now();
    if (now - this.lastBackPress < EXIT_WINDOW) {
      // the second press inside the window is the one that leaves
      this.hideHint();
      this.exitApp();
      return;
    }

    this.lastBackPress = now;
    this.armGuard();
    this.showHint();
  }

  // installed windows are allowed to close themselves, a plain tab is not, so
  // the back entry the app was launched from is the fallback
  private exitApp() {
    if (this.isInstalled()) {
      window.close();
      if (window.closed) {
        return;
      }
    }
    history.back();
  }

  private armGuard() {
    if (this.guardArmed || !this.guardApplies()) {
      return;
    }
    // a round trip out of the home screen and back would otherwise leave a new
    // guard entry behind on every pass
    if (history.state && history.state.exitGuard) {
      this.guardArmed = true;
      return;
    }
    history.pushState({ exitGuard: true }, '', location.href);
    this.guardArmed = true;
  }

  // a phone sized screen, a touch screen, or a window with no browser chrome
  // around it, which is what an installed app is
  private guardApplies(): boolean {
    return (
      this.isInstalled() ||
      window.innerWidth <= MOBILE_WIDTH ||
      window.matchMedia('(pointer: coarse)').matches
    );
  }

  private isInstalled(): boolean {
    return this.pwa.isInstalled;
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
