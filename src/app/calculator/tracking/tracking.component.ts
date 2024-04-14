import { Component, OnInit } from '@angular/core';
import { FoodDataService } from 'src/app/shared/services/food-data.service';
import { OperationsService } from 'src/app/shared/services/operations.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  dataArray: any = [];

  constructor(private FoodDataService: FoodDataService) {}

  ngOnInit() {
    this.getTrackingData();
  }

  getTrackingData() {
    this.FoodDataService.getUserTrackingData().subscribe({
      next: (res) => {
        this.dataArray = Object.values(res).reverse();
        console.log(this.dataArray);
      },
    });
  }
}
