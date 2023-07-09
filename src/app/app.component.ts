import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoginService } from './services/login.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'food-calculator';
  constructor(private LoginService: LoginService) {}
  isLoggedin = this.LoginService.isLoggedinAction$;
}
