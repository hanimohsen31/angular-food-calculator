import { Component, OnInit } from '@angular/core';
import { OperationsService } from 'src/app/shared/services/operations.service';
import { FoodDataService } from 'src/app/shared/services/food-data.service';

@Component({
  selector: 'app-sum',
  templateUrl: './sum.component.html',
  styleUrls: ['./sum.component.scss'],
})
export class SumComponent implements OnInit {
  // properties
  addedFoodList: any = [];
  targetResult: any = {};
  sumResult: any = {};
  clearPopup: boolean = false;
  savePopup: boolean = false;
  date = new Date();
  curruntDate: any = '';

  constructor(
    private FoodDataService: FoodDataService,
    private OperationsService: OperationsService
  ) {}

  ngOnInit() {
    this.getUserAddedFoodList();
    this.observeAddedFoodList();
    this.observeSumResult();
    this.observeTargetResult();
  }

  getUserAddedFoodList() {
    this.FoodDataService.getUserAddedFoodList().subscribe({
      next: (res: any) => {
        if (res) {
          this.OperationsService.addedFoodList.next(res);
          this.OperationsService.calculateSumResult();
          this.OperationsService.calculateTargetResult();
        } else this.OperationsService.addedFoodList.next([]);
      },
      error: (err: any) => console.log(err),
    });
  }

  observeAddedFoodList() {
    this.OperationsService.addedFoodList$.subscribe({
      next: (res: any) => (this.addedFoodList = res),
      error: (err: any) => console.log(err),
    });
  }

  observeSumResult() {
    this.OperationsService.sumResult$.subscribe({
      next: (res: any) => (this.sumResult = res),
      error: (err: any) => console.log(err),
    });
  }

  observeTargetResult() {
    this.OperationsService.targetResult$.subscribe({
      next: (res: any) => (this.targetResult = res),
      error: (err: any) => console.log(err),
    });
  }

  // handle remove from food added list
  handleRemove(index: any) {
    this.OperationsService.handleRemove(index);
  }

  // handle change food added list
  handleChange() {
    this.OperationsService.handleChange();
  }

  // handle clear food added list
  handleClear() {
    this.clearPopup = !this.clearPopup;
    this.OperationsService.handleClear();
  }

  saveData() {
    this.OperationsService.saveUserTrackingData(this.sumResult).subscribe({
      next: (res) => this.toggleSavePopup(),
      error: (err) => console.log(err),
    });
  }

  toggleClearPopup() {
    this.clearPopup = !this.clearPopup;
  }

  toggleSavePopup() {
    this.savePopup = !this.savePopup;
    let date = this.OperationsService.getNowDateString();
    this.curruntDate = this.OperationsService.dateFormater(date);
  }
}
