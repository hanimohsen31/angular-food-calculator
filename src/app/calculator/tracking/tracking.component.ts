import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';
import { OperationsService } from 'src/app/shared/services/operations.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  dataArray: any[];

  constructor(
    private DataService: DataService,
    private OperationsService: OperationsService
  ) {}

  ngOnInit(): void {
    this.DataService.getTrackingData().subscribe((res) => {
      this.dataArray = Object.values(res).reverse();
    });
  }

  dateFormat(value: string) {
    return this.OperationsService.dateFormater(value)
  }
}
