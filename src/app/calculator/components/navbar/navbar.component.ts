import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/auth/login.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PwaInstallService } from '../../services/pwa-install.service';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {

  constructor(
    private LoginService: LoginService,
    private PwaInstallService: PwaInstallService,
    private Router: Router
  ) {}
  ngOnInit(): void {}

  isLoggedIn$ = this.LoginService.isLoggedin$;
  isAdmin$ = this.LoginService.isAdmin$;
  heroImg = 'assets/images/f2.jpg';

  // chrome and edge can install on a click, safari on iphone only through the
  // share sheet, so there the button opens a short how to instead
  canInstall$ = this.PwaInstallService.canInstall$;
  showIosHelp = false;

  get isIosInstallable(): boolean {
    return this.PwaInstallService.isIos && !this.PwaInstallService.isInstalled;
  }

  install() {
    if (this.isIosInstallable) {
      this.showIosHelp = true;
      return;
    }
    this.PwaInstallService.install();
  }

  closeIosHelp() {
    this.showIosHelp = false;
  }

  // an account is typed into now, so the button opens the page it is typed on
  login() {
    this.Router.navigate(['/auth']);
  }

  logout() {
    this.LoginService.logOut();
  }
}
