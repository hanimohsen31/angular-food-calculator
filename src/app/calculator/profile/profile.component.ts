import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = JSON.parse(localStorage.getItem('user') || '');
  img: any = this.user.photoURL;

  constructor() {}
  ngOnInit(): void {}
}
