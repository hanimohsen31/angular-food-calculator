import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, map, tap, Observable } from 'rxjs';
import { OperationsService } from './../../services/operations.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  displayDetails = false;

  sumArray$ = this._OperationsService.sumArrayAction$.pipe(
    map((response: any) => response.map((elm: any) => elm))
  );

  finalSumObject$ = this._OperationsService.finalSumAction$.pipe(
    map((response: any) => response.map((elm: any) => elm))
  );

  constructor(private _OperationsService: OperationsService) {}

  ngOnInit(): void {}

  // handle remove
  handleRemove(index: any) {
    this._OperationsService.handleRemove(index);
  }

  // handle change
  handleChange() {
    this._OperationsService.handleChange();
  }

  // handle clear
  handleClear() {
    this._OperationsService.handleClear();
  }

  toggleDetails() {
    this.displayDetails = !this.displayDetails;
  }
}
