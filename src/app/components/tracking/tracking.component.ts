import { Component, OnInit } from '@angular/core';
import { DataService } from './../../services/data.service';
import { OperationsService } from 'src/app/services/operations.service';

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  constructor(
    private DataService: DataService,
    private OperationsService: OperationsService
  ) {}

  dataArray: any[];

  ngOnInit(): void {
    this.DataService.getTrackingData().subscribe((res) => {
      this.dataArray = Object.values(res).reverse();
    });
  }

  dateFormat(value: string) {
    return this.OperationsService.dateFormater(value)
  }
}
