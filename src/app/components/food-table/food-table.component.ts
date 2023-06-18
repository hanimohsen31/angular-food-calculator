import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DataService } from './../../services/data.service';
import { OperationsService } from './../../services/operations.service';

@Component({
  selector: 'app-food-table',
  templateUrl: './food-table.component.html',
  styleUrls: ['./food-table.component.scss'],
})
export class FoodTableComponent implements AfterViewInit {
  // paginator
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // angular table
  displayedColumns: string[] = [
    'name',
    'translated',
    'measure',
    'calories',
    'fats',
    'carbs',
    'protein',
    'menue',
  ];

  dataSource = new MatTableDataSource([]);

  constructor(
    private _DataService: DataService,
    private _OperationsService: OperationsService
  ) {
    this.getDate();
  }

  getDate() {
    this._DataService.getData().subscribe({
      next: (res) => {
        let array :any = Object.values(res)
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
      },
    });
  }

  // filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // handle add
  handleAdd(element: any) {
    this._OperationsService.handleAdd(element)
    this._OperationsService.handleChange()
  }
}
