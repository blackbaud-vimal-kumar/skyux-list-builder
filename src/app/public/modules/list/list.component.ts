import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges
} from '@angular/core';

import {
  ListItemsLoadAction,
  ListItemsSetLoadingAction
} from './state/items/actions';

import {
  ListSelectedLoadAction,
  ListSelectedSetLoadingAction
} from './state/selected/actions';

import {
  ListSortModel
} from './state/sort/sort.model';

import {
  ListSortSetFieldSelectorsAction
} from './state/sort/actions';

import {
  ListFilterModel
} from './state/filters/filter.model';

import {
  getValue
} from 'microedge-rxstate/dist/helpers';

import {
  ListDataRequestModel
} from './list-data-request.model';

import {
  ListDataResponseModel
} from './list-data-response.model';

import {
  ListDataProvider
} from './list-data.provider';

import {
  SkyListInMemoryDataProvider
} from '../list-data-provider-in-memory';

import {
  ListState,
  ListStateDispatcher
} from './state';

import {
  Observable
} from 'rxjs/Observable';

import {
  Subject
} from 'rxjs/Subject';

import 'rxjs/add/observable/combineLatest';

import 'rxjs/add/observable/of';

import 'rxjs/add/operator/distinctUntilChanged';

import 'rxjs/add/operator/mergeMap';

import 'rxjs/add/operator/take';

import 'rxjs/add/operator/skip';

import {
  isObservable,
  ListItemModel,
  ListSortFieldSelectorModel
} from '@skyux/list-builder-common';

import {
  ListViewComponent
} from './list-view.component';

import {
  ListSearchModel
} from './state/search/search.model';

import {
  ListViewsLoadAction,
  ListViewsSetActiveAction
} from './state/views/actions';

import {
  ListViewModel
} from './state/views/view.model';

import {
  SkyComparisonHelper
} from '../shared/comparison-helper';

let idIndex = 0;

@Component({
  selector: 'sky-list',
  template: '<ng-content></ng-content>',
  providers: [ListState, ListStateDispatcher],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkyListComponent implements AfterContentInit, OnChanges, OnDestroy {
  public id: string = `sky-list-cmp-${++idIndex}`;
  @Input()
  public data?: Array<any> | Observable<Array<any>> = [];

  @Input()
  public dataProvider?: ListDataProvider;

  @Input()
  public defaultView?: ListViewComponent;

  @Input()
  public initialTotal?: number;

  @Input()
  public selectedIds?: Array<string> | Observable<Array<string>>;

  @Input()
  public sortFields?: ListSortFieldSelectorModel |
    Array<ListSortFieldSelectorModel> |
    Observable<Array<ListSortFieldSelectorModel>> |
    Observable<ListSortFieldSelectorModel>;

  @Input()
  public appliedFilters: Array<ListFilterModel> = [];

  @Output()
  public selectedIdsChange = new EventEmitter<Map<string, boolean>>();

  @Output()
  public appliedFiltersChange = new EventEmitter<Array<ListFilterModel>>();

  /* tslint:disable */
  @Input('search')
  private searchFunction: (data: any, searchText: string) => boolean;
  /* tslint:enable */

  private dataFirstLoad: boolean = false;

  @ContentChildren(ListViewComponent)
  private listViews: QueryList<ListViewComponent>;

  private lastSelectedIds: string[];

  private ngUnsubscribe = new Subject();

  // Used for backwards compatability with old selectedIdMap
  private _selectedIdMap = new Map<string, boolean>();

  constructor(
    private state: ListState,
    private dispatcher: ListStateDispatcher
  ) {}

  public ngAfterContentInit() {
    if (this.data && this.dataProvider && this.initialTotal) {
      this.dataFirstLoad = true;
    }

    if (this.listViews.length > 0) {
      let defaultView: ListViewComponent =
        (this.defaultView === undefined) ? this.listViews.first : this.defaultView;

      this.dispatcher.next(
        new ListViewsLoadAction(this.listViews.map(v => new ListViewModel(v.id, v.label)))
      );

      // activate the default view
      this.dispatcher.next(new ListViewsSetActiveAction(defaultView.id));
    } else {
      return;
    }

    // set sort fields
    getValue(this.sortFields,
      (sortFields: ListSortFieldSelectorModel[] | ListSortFieldSelectorModel) => {
        let sortArray: any;
        if (!Array.isArray(sortFields) && sortFields) {
          sortArray = [sortFields];
        } else {
          sortArray = sortFields;
        }
        this.dispatcher.next(new ListSortSetFieldSelectorsAction(sortArray || []));
      });

    this.displayedItems.subscribe(result => {
      this.dispatcher.next(new ListItemsSetLoadingAction());
      this.dispatcher.next(new ListItemsLoadAction(result.items, true, true, result.count));
    });

    // The ListState selected property is deprecated.
    // This is left in for backwards compatability.
    if (this.selectedIdsChange.observers.length > 0) {
      this.state.map(current => current.selected).distinctUntilChanged()
        .skip(1)
        .subscribe((selected: any) => {
          // console.log('selected!');
          this.selectedIdsChange.emit(selected.item.selectedIdMap);
        });
    }

    // Watch for selection changes.
    this.state.map(current => current.items.items)
      .takeUntil(this.ngUnsubscribe)
      .distinctUntilChanged()
      .subscribe((listItemModels: ListItemModel[]) => {

        // Update lastSelectedIds to help us retain user selections.
        let selectedIdsList: string[] = [];
        listItemModels.forEach(item => {
          if (item.isSelected) {
            selectedIdsList.push(item.id);
          }
        });
        this.lastSelectedIds = selectedIdsList;

        // Emit new selected items if there is an observer.
        if (this.selectedIdsChange.observers.length > 0) {
          this.setSelectedIdMap(listItemModels);
          this.selectedIdsChange.emit(this._selectedIdMap);
        }
    });

    if (this.appliedFiltersChange.observers.length > 0) {
      this.state.map(current => current.filters)
        .takeUntil(this.ngUnsubscribe)
        .distinctUntilChanged(SkyComparisonHelper.arraysEqual)
        .skip(1)
        .subscribe((filters: any) => {
          this.appliedFiltersChange.emit(filters);
        });
    }

  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes['appliedFilters'] &&
      changes['appliedFilters'].currentValue !== changes['appliedFilters'].previousValue) {
      this.dispatcher.filtersUpdate(this.appliedFilters);
    }
  }

  public ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public refreshDisplayedItems(): void {
    this.displayedItems.take(1).subscribe((result: any) => {
      this.dispatcher.next(new ListItemsSetLoadingAction());
      this.dispatcher.next(new ListItemsLoadAction(result.items, true, true, result.count));
    });
  }

  get displayedItems(): Observable<ListDataResponseModel> {
    if (!this.data && !this.dataProvider) {
      throw new Error('List requires data or dataProvider to be set.');
    }

    let data: any = this.data;
    if (!isObservable(data)) {
      data = Observable.of(this.data);
    }

    if (!this.dataProvider) {
      this.dataProvider = new SkyListInMemoryDataProvider(data, this.searchFunction);
    }

    let selectedIds: any = this.selectedIds || Observable.of([]);
    if (!isObservable(selectedIds)) {
      selectedIds = Observable.of(selectedIds);
    }

    let selectedChanged: boolean = false;

    return Observable.combineLatest(
      // TODO the filter comparer needs to allow value=true vs value=false trigger a reload.
      // However, when selections are updated when trigger is engaged, it somehow gets caught in
      // these comparers and does not reload
      this.state.map(s => s.filters).distinctUntilChanged(this.filtersEqual),
      this.state.map(s => s.search).distinctUntilChanged(),
      this.state.map(s => s.sort.fieldSelectors).distinctUntilChanged(),
      this.state.map(s => s.paging.itemsPerPage).distinctUntilChanged(),
      this.state.map(s => s.paging.pageNumber).distinctUntilChanged(),
      this.state.map(s => s.toolbar.disabled).distinctUntilChanged(),
      selectedIds.distinctUntilChanged().map((selectedId: any) => {
        selectedChanged = true;
        return selectedId;
      }),
      data.distinctUntilChanged(),
      (
        filters: ListFilterModel[],
        search: ListSearchModel,
        sortFieldSelectors: Array<ListSortFieldSelectorModel>,
        itemsPerPage: number,
        pageNumber: number,
        isToolbarDisabled: boolean,
        selected: Array<string>,
        itemsData: Array<any>
      ) => {

        // TODO: What to do here?
        if (selectedChanged) {
          this.dispatcher.next(new ListSelectedSetLoadingAction());
          this.dispatcher.next(new ListSelectedLoadAction(selected));
          this.dispatcher.next(new ListSelectedSetLoadingAction(false));
          selectedChanged = false;
        }

        let response: Observable<ListDataResponseModel>;
        if (this.dataFirstLoad) {
          this.dataFirstLoad = false;
          let initialItems = itemsData.map(d =>
            new ListItemModel(d.id || `sky-list-item-model-${++idIndex}`, d));
          response = Observable.of(new ListDataResponseModel({
            count: this.initialTotal,
            items: initialItems
          }));
        } else {
          response = this.dataProvider.get(new ListDataRequestModel({
            filters: filters,
            pageSize: itemsPerPage,
            pageNumber: pageNumber,
            search: search,
            sort: new ListSortModel({ fieldSelectors: sortFieldSelectors }),
            isToolbarDisabled: isToolbarDisabled
          }));
        }

        return response;
      })
      .takeUntil(this.ngUnsubscribe)
      .map(response => {
        // Retain user selections from previous state.
        return response.map(listDataResponseModel => {
          return new ListDataResponseModel({
            count: listDataResponseModel.count,
            items: this.getItemsAndRetainSelections(listDataResponseModel.items, this.lastSelectedIds)
          });
        });
      })
      .flatMap((value: Observable<ListDataResponseModel>, index: number) => {
        return value;
      });
  }

  public get lastUpdate() {
    return this.state
      .takeUntil(this.ngUnsubscribe)
      .map(s =>
        s.items.lastUpdate ? new Date(s.items.lastUpdate) : undefined
      );
  }

  public get views() {
    return this.listViews.toArray();
  }

  public get itemCount() {
    return this.dataProvider.count();
  }

  private getItemsAndRetainSelections(newList: ListItemModel[], selectedIds: string[]): ListItemModel[] {
    if (!selectedIds) {
      return newList;
    }
    let updatedListModel = newList.slice();
    updatedListModel.forEach(item => {
      item.isSelected = selectedIds.indexOf(item.id) > -1 ? true : false;
    });
    return updatedListModel;
  }

  // Only set map value to false if it already exists.
  // This is for backwards compatability to support the map object.
  private setSelectedIdMap(listItemModel: any[]) {
    listItemModel.forEach(item => {
      if (item.isSelected) {
        this._selectedIdMap.set(item.id, true);
      } else {
        if (this._selectedIdMap.get(item.id)) {
          this._selectedIdMap.set(item.id, false);
        }
      }
    });
  }

  private filtersEqual(filtersA: ListFilterModel[], filtersB: ListFilterModel[]) {
    return filtersA.length === filtersB.length && filtersA.every(arrAFilter => {
      const arrBFilter = filtersB.find(filter => filter.name === arrAFilter.name);
      return arrAFilter.value === arrBFilter.value;
    });
  }
}
