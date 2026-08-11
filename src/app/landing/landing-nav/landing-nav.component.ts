import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-landing-nav',
  templateUrl: './landing-nav.component.html',
  styleUrls: ['./landing-nav.component.scss'],
})
export class LandingNavComponent implements OnInit {
  @ViewChild('navToggler') navToggler!: ElementRef<HTMLButtonElement>;

  constructor() {}
  ngOnInit(): void {}

  navigateToSection(section: string) {
    window.location.hash = '/home';
    window.location.hash = section;
    this.closeNav();
  }

  // collapse the menu only when the toggler is visible (mobile view)
  closeNav() {
    const toggler = this.navToggler?.nativeElement;
    if (toggler && toggler.offsetParent !== null && toggler.getAttribute('aria-expanded') === 'true') {
      toggler.click();
    }
  }
}
