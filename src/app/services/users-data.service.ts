import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersDataService {
  constructor() {}
  usersUrl = 'https://food-calculator-300-default-rtdb.firebaseio.com/users';
}
