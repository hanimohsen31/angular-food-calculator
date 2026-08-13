import { Component, HostListener, OnInit } from '@angular/core';
import { FoodDataService } from '../../services/food-data.service';
import { OperationsService } from '../../services/operations.service';

interface Macro {
  label: string;
  valueKey: string;
  targetKey: string;
  percentKey: string;
  unit: string;
  digits: string;
  theme: string;
}

@Component({
  standalone: false,
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
})
export class TrackingComponent implements OnInit {
  dataArray: any = [];
  loading: boolean = true;

  // the days are read one page at a time, newest first
  pageSize: number = 5;
  currentPage: number = 1;
  pagedData: any = [];
  pageNumbers: number[] = [];

  deletePopup: boolean = false;
  dayToDelete: any = null;
  deleting: boolean = false;
  deleteError: string = '';

  // the four rows drawn on every tracked day, in the order they are read
  macros: Macro[] = [
    {
      label: 'Calories',
      valueKey: 'Energy',
      targetKey: 'enrgTrg',
      percentKey: 'enrgPer',
      unit: 'kcal',
      digits: '1.0-0',
      theme: 'energy',
    },
    {
      label: 'Fats',
      valueKey: 'Fat',
      targetKey: 'fatTarg',
      percentKey: 'fatPerc',
      unit: 'g',
      digits: '1.0-1',
      theme: 'fat',
    },
    {
      label: 'Carbs',
      valueKey: 'Carbohydrate',
      targetKey: 'carbTarg',
      percentKey: 'carbPer',
      unit: 'g',
      digits: '1.0-1',
      theme: 'carb',
    },
    {
      label: 'Protein',
      valueKey: 'Protein',
      targetKey: 'proTrg',
      percentKey: 'proPer',
      unit: 'g',
      digits: '1.0-1',
      theme: 'protein',
    },
  ];

  constructor(
    private FoodDataService: FoodDataService,
    private OperationsService: OperationsService
  ) {}

  ngOnInit() {
    this.getTrackingData();
  }

  getTrackingData() {
    this.FoodDataService.getUserTrackingData().subscribe({
      next: (res: any) => {
        // the server hands the days back newest first already
        this.dataArray = res || [];
        this.loading = false;
        this.applyPaging();
      },
      error: () => {
        this.dataArray = [];
        this.loading = false;
        this.applyPaging();
      },
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.dataArray.length / this.pageSize));
  }

  // the first day shown on this page, counted from one for the reader
  get rangeStart(): number {
    return this.dataArray.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.dataArray.length);
  }

  applyPaging() {
    let total = this.totalPages;
    this.currentPage = Math.min(Math.max(this.currentPage, 1), total);
    let start = (this.currentPage - 1) * this.pageSize;
    this.pagedData = this.dataArray.slice(start, start + this.pageSize);
    this.buildPageNumbers(total);
  }

  // a narrow screen only has room for a short run of page buttons
  compactPager: boolean = window.matchMedia('(max-width: 767px)').matches;

  @HostListener('window:resize')
  handleResize() {
    let compact = window.matchMedia('(max-width: 767px)').matches;
    if (compact != this.compactPager) {
      this.compactPager = compact;
      this.applyPaging();
    }
  }

  // at most five page buttons, kept around the page being read
  buildPageNumbers(total: number) {
    let width = this.compactPager ? 3 : 5;
    let start = Math.max(1, this.currentPage - Math.floor(width / 2));
    let end = Math.min(total, start + width - 1);
    start = Math.max(1, end - width + 1);
    this.pageNumbers = [];
    for (let page = start; page <= end; page++) {
      this.pageNumbers.push(page);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages || page == this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.applyPaging();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  handlePageSizeChange() {
    this.pageSize = +this.pageSize || 5;
    this.currentPage = 1;
    this.applyPaging();
  }

  // a day is saved under "MonJul172023", read it back as "Mon Jul 17 2023"
  formatDate(id: any) {
    return id ? this.OperationsService.dateFormater(id) : '';
  }

  value(item: any, macro: Macro): number {
    return +item?.[macro.valueKey] || 0;
  }

  target(item: any, macro: Macro): number {
    return +item?.[macro.targetKey] || 0;
  }

  // days saved before the targets existed carry no percentage, work it out
  // from the totals instead
  percent(item: any, macro: Macro): number {
    let stored = item?.[macro.percentKey];
    if (stored !== undefined && stored !== null && stored !== '') {
      return +stored || 0;
    }
    let target = this.target(item, macro);
    return target > 0 ? (this.value(item, macro) / target) * 100 : 0;
  }

  // the bar stops at the end of its track, the number beside it still tells
  // the whole truth
  barWidth(item: any, macro: Macro): number {
    return Math.min(this.percent(item, macro), 100);
  }

  statusClass(item: any, macro: Macro): string {
    let percent = this.percent(item, macro);
    if (percent > 105) {
      return 'over';
    }
    return percent >= 85 ? 'onTarget' : 'under';
  }

  toggleDeletePopup(item?: any) {
    this.deletePopup = !this.deletePopup;
    this.dayToDelete = this.deletePopup ? item : null;
    this.deleteError = '';
  }

  handleDelete() {
    if (this.deleting || !this.dayToDelete?.id) {
      return;
    }
    this.deleting = true;
    this.deleteError = '';
    let id = this.dayToDelete.id;
    this.FoodDataService.deleteUserTrackingDay(id).subscribe({
      next: () => {
        this.dataArray = this.dataArray.filter((day: any) => day?.id != id);
        this.deleting = false;
        this.deletePopup = false;
        this.dayToDelete = null;
        // the page can end up past the last day once one is taken off it
        this.applyPaging();
      },
      error: () => {
        this.deleting = false;
        this.deleteError = 'Deleting this day failed, try again.';
      },
    });
  }

  trackById(index: number, item: any) {
    return item?.id || index;
  }
}
