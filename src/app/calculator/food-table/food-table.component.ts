import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FoodDataService } from 'src/app/shared/services/food-data.service';
import { OperationsService } from 'src/app/shared/services/operations.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-food-table',
  templateUrl: './food-table.component.html',
  styleUrls: ['./food-table.component.scss'],
})
export class FoodTableComponent implements AfterViewInit {
  // paginator
  displayedColumns: string[] = [
    'ShortFoodName',
    'Translation',
    'MeasureUnit',
    'Equavlint',
    'Energy',
    'Fat',
    'Carbohydrate',
    'Protein',
    'menue',
  ];
  // angular table
  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  constructor(
    private FoodDataService: FoodDataService,
    private OperationsService: OperationsService
  ) {
    this.getFoodData();
  }

  getFoodData() {
    this.FoodDataService.getFoodData().subscribe({
      next: (res) => {
        let array: any = Object.values(res);
        // fill table and sort
        this.dataSource = new MatTableDataSource(array);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
    });
  }

  // filter
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // handle add
  handleAdd(element: any) {
    this.OperationsService.handleAdd(element);
  }

  // word breaker
  wordBreaker(value: String) {
    return value ? value.replace('/', ' ') : '_______';
  }
}
