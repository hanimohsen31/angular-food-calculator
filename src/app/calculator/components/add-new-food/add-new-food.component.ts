import { Component, HostListener, OnInit } from '@angular/core';
import { FoodDataService } from '../../services/food-data.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { concat, of } from 'rxjs';
import { catchError, toArray } from 'rxjs/operators';
import {
  FOOD_COLUMN_LABELS,
  FOOD_LABELS,
  MEASURE_UNITS,
  NAME_MAX_LENGTH,
} from '../../services/constants';

@Component({
  standalone: false,
  selector: 'app-add-new-food',
  templateUrl: './add-new-food.component.html',
  styleUrls: ['./add-new-food.component.scss'],
})
export class AddNewFoodComponent implements OnInit {
  formDataCopy: any = {};
  measureUnits: string[] = MEASURE_UNITS;
  labels: any = FOOD_LABELS;
  columnLabels: any = FOOD_COLUMN_LABELS;
  nameMaxLength: number = NAME_MAX_LENGTH;
  // what went wrong with the last submit, shown above the buttons
  formError: string = '';

  // saved food items, the recipes are left to the recipes screen
  foodList: any[] = [];
  filteredFoodList: any[] = [];
  searchTerm: string = '';
  loading: boolean = false;

  // the list is read one page at a time
  pageSize: number = 5;
  currentPage: number = 1;
  pagedFoodList: any[] = [];
  pageNumbers: number[] = [];

  // edit / delete state
  editedFoodKey: string = '';
  editedFoodID: string = '';
  deletePopup: boolean = false;
  foodToDelete: any = null;

  // multi select, the rows are held by their FoodKey so the marks survive a
  // reload, a search and a move to another page
  selectedKeys: Set<string> = new Set<string>();
  bulkDelete: boolean = false;
  bulkError: string = '';

  // the rules are the ones the server stores under: the english name is the
  // only required key, the arabic one is optional, both are capped at 200
  // characters, and every nutrient is a number that cannot go below zero
  formData: any = new FormGroup({
    ShortFoodName: new FormControl('', [
      Validators.required,
      Validators.maxLength(NAME_MAX_LENGTH),
    ]),
    Translation: new FormControl('', [Validators.maxLength(NAME_MAX_LENGTH)]),
    Measure: new FormControl(0, [Validators.required, Validators.min(0)]),
    MeasureUnit: new FormControl('gm', [Validators.required]),
    Quantity: new FormControl(1),
    Energy: new FormControl(0, [Validators.required, Validators.min(0)]),
    Carbohydrate: new FormControl(0, [Validators.required, Validators.min(0)]),
    Fat: new FormControl(0, [Validators.required, Validators.min(0)]),
    Protein: new FormControl(0, [Validators.required, Validators.min(0)]),
    Sugars: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  constructor(private FoodDataService: FoodDataService) {}

  ngOnInit(): void {
    this.getFoodData();
  }

  // ------------------------------ data ------------------------------
  // a reload that follows a save or a delete keeps the page being read, only
  // a fresh read of the screen starts from the first one
  getFoodData(keepPage: boolean = false) {
    this.loading = true;
    this.FoodDataService.getFoodData().subscribe({
      next: (res: any) => {
        // every row carries its id as FoodKey, it is needed to update / delete
        this.foodList = (res || [])
          .filter((elm: any) => !elm.isRecipe)
          .sort((a: any, b: any) => (a.ShortFoodName || '').localeCompare(b.ShortFoodName || ''));
        // a row that is no longer there cannot stay marked
        let keys = new Set(this.foodList.map((elm: any) => elm.FoodKey));
        this.selectedKeys.forEach((key) => {
          if (!keys.has(key)) {
            this.selectedKeys.delete(key);
          }
        });
        this.applyFilter(!keepPage);
        this.loading = false;
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
      },
    });
  }

  // ------------------------------ list ------------------------------
  applyFilter(resetPage: boolean = true) {
    let term = this.searchTerm.trim().toLowerCase();
    this.filteredFoodList = term
      ? this.foodList.filter(
          (elm: any) =>
            (elm.ShortFoodName || '').toLowerCase().includes(term) ||
            (elm.Translation || '').includes(term),
        )
      : this.foodList;
    // a new search starts from the first page of its own results
    if (resetPage) {
      this.currentPage = 1;
    }
    this.applyPaging();
  }

  clearSearch() {
    this.searchTerm = '';
    this.applyFilter();
  }

  // ------------------------------ save ------------------------------
  get formTitle(): string {
    return this.editedFoodKey ? 'Edit Food Item' : 'Add New Food';
  }

  // an invalid form is not sent, every field that is wrong is made to say so
  // rather than the whole form being refused with one message
  onSubmit() {
    if (!this.formData.valid) {
      this.formData.markAllAsTouched();
      this.formError = 'Fix the fields marked below before saving';
      return;
    }
    this.formError = '';
    this.editedFoodKey ? this.updateFood() : this.addNewFood(this.formData.value);
  }

  addNewFood(formdata: any) {
    this.loading = true;
    this.FoodDataService.addNewFood(formdata).subscribe({
      next: (res: any) => {
        this.resetForm();
        this.getFoodData();
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        // the server states which key it refused, that is more use than a
        // message written here could be
        this.formError = err?.error?.message || 'Could not save the food item';
      },
    });
  }

  // the whole row is written back, so the fields the form does not show
  // (FoodID, the recipe items of a recipe, ...) survive the edit
  updateFood() {
    let food = { ...this.formDataCopy, ...this.formData.value, FoodID: this.editedFoodID };
    delete food.FoodKey;
    this.loading = true;
    this.FoodDataService.updateFood(this.editedFoodKey, food).subscribe({
      next: () => {
        this.resetForm();
        this.getFoodData(true);
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        this.formError = err?.error?.message || 'Could not save the food item';
      },
    });
  }

  // ------------------------------ edit ------------------------------
  editFood(food: any) {
    this.formError = '';
    this.editedFoodKey = food.FoodKey;
    this.editedFoodID = food.FoodID || '';
    this.formDataCopy = { ...food };
    this.formData.patchValue({
      ShortFoodName: food.ShortFoodName || '',
      Translation: food.Translation || '',
      Measure: +food.Measure || 0,
      MeasureUnit: food.MeasureUnit || this.measureUnits[0],
      Quantity: +food.Quantity || 1,
      Energy: +food.Energy || 0,
      Carbohydrate: +food.Carbohydrate || 0,
      Fat: +food.Fat || 0,
      Protein: +food.Protein || 0,
      Sugars: +food.Sugars || 0,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // a bare reset would leave the unit empty, which is not one of the options
  resetForm() {
    this.formData.reset({
      ShortFoodName: '',
      Translation: '',
      Measure: 0,
      MeasureUnit: this.measureUnits[0],
      Quantity: 1,
      Energy: 0,
      Carbohydrate: 0,
      Fat: 0,
      Protein: 0,
      Sugars: 0,
    });
    this.editedFoodKey = '';
    this.editedFoodID = '';
    this.formDataCopy = {};
    this.formError = '';
  }

  // ------------------------------ delete ------------------------------
  toggleDeletePopup(food: any = null) {
    this.foodToDelete = food;
    this.bulkDelete = false;
    this.deletePopup = !this.deletePopup;
  }

  // the same pop up asks for the marked rows, only the question changes
  toggleBulkDeletePopup() {
    if (!this.deletePopup && !this.selectedCount) {
      return;
    }
    this.foodToDelete = null;
    this.bulkDelete = !this.deletePopup;
    this.deletePopup = !this.deletePopup;
  }

  handleDelete() {
    if (this.bulkDelete) {
      this.deleteSelected();
      return;
    }
    let key = this.foodToDelete?.FoodKey;
    if (!key) {
      return;
    }
    this.loading = true;
    this.FoodDataService.deleteFood(key).subscribe({
      next: () => {
        // the row being edited is gone, the form has nothing to save to
        if (this.editedFoodKey === key) {
          this.resetForm();
        }
        this.toggleDeletePopup();
        this.getFoodData(true);
      },
      error: (err: any) => {
        console.log(err);
        this.loading = false;
        this.formError = err?.error?.message || 'Could not delete the food item';
      },
    });
  }

  // ------------------------------ multi select ------------------------------
  get selectedCount(): number {
    return this.selectedKeys.size;
  }

  isSelected(food: any): boolean {
    return this.selectedKeys.has(food?.FoodKey);
  }

  toggleSelect(food: any) {
    let key = food?.FoodKey;
    if (!key) {
      return;
    }
    this.selectedKeys.has(key) ? this.selectedKeys.delete(key) : this.selectedKeys.add(key);
  }

  // the header box only speaks for the rows the page shows
  get allOnPageSelected(): boolean {
    return (
      !!this.pagedFoodList.length && this.pagedFoodList.every((elm: any) => this.isSelected(elm))
    );
  }

  get someOnPageSelected(): boolean {
    return !this.allOnPageSelected && this.pagedFoodList.some((elm: any) => this.isSelected(elm));
  }

  toggleSelectAllOnPage() {
    let selectAll = !this.allOnPageSelected;
    this.pagedFoodList.forEach((elm: any) => {
      selectAll ? this.selectedKeys.add(elm.FoodKey) : this.selectedKeys.delete(elm.FoodKey);
    });
  }

  clearSelection() {
    this.selectedKeys.clear();
    this.bulkError = '';
  }

  // the server takes one item per call, so the marked rows are sent one after
  // the other. a row the server refuses stays marked and is reported, the rest
  // are still deleted
  deleteSelected() {
    let keys = this.foodList
      .filter((elm: any) => this.selectedKeys.has(elm.FoodKey))
      .map((elm: any) => elm.FoodKey);
    if (!keys.length) {
      this.toggleBulkDeletePopup();
      return;
    }
    this.loading = true;
    this.bulkError = '';
    let failed: string[] = [];
    concat(
      ...keys.map((key: string) =>
        this.FoodDataService.deleteFood(key).pipe(
          catchError((err: any) => {
            console.log(err);
            failed.push(key);
            return of(null);
          }),
        ),
      ),
    )
      .pipe(toArray())
      .subscribe({
        next: () => {
          // only what the server refused is left marked
          this.selectedKeys = new Set<string>(failed);
          if (this.editedFoodKey && !this.selectedKeys.has(this.editedFoodKey)) {
            if (keys.includes(this.editedFoodKey)) {
              this.resetForm();
            }
          }
          if (failed.length) {
            this.bulkError = `${failed.length} of ${keys.length} item(s) could not be deleted`;
          }
          this.deletePopup = false;
          this.bulkDelete = false;
          this.getFoodData(true);
        },
      });
  }

  // ------------------------------ paging ------------------------------
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredFoodList.length / this.pageSize));
  }

  // the first item shown on this page, counted from one for the reader
  get rangeStart(): number {
    return this.filteredFoodList.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredFoodList.length);
  }

  applyPaging() {
    let total = this.totalPages;
    // a save or a delete can leave the page being read past the last item
    this.currentPage = Math.min(Math.max(this.currentPage, 1), total);
    let start = (this.currentPage - 1) * this.pageSize;
    this.pagedFoodList = this.filteredFoodList.slice(start, start + this.pageSize);
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
  }

  handlePageSizeChange() {
    this.pageSize = +this.pageSize || 5;
    this.currentPage = 1;
    this.applyPaging();
  }
}
