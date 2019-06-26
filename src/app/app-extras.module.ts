import {
  NgModule
} from '@angular/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyListViewGridModule
} from '@skyux/list-builder-view-grids';

import {
  SkyListModule,
  SkyListFiltersModule,
  SkyListPagingModule,
  SkyListSecondaryActionsModule,
  SkyListToolbarModule
} from '@skyux/list-builder';

import {
  SkyListViewSwitcherModule
} from './public';
import { SkyModalModule } from '@skyux/modals';
import { SkyCheckboxModule } from '@skyux/forms';
import { SkyFilterModule } from '@skyux/lists';
import { SkyListFiltersModalDemoComponent } from './visual/temp/list-filters-demo-modal.component';

import {
  AppSkyModule
} from './app-sky.module';

@NgModule({
  imports: [
    SkyIconModule,
    SkyListModule,
    SkyListFiltersModule,
    SkyListPagingModule,
    SkyListSecondaryActionsModule,
    SkyListToolbarModule,
    SkyListViewSwitcherModule,
    SkyListViewGridModule
  ],
  exports: [
    AppSkyModule,
    SkyIconModule,
    SkyListModule,
    SkyListFiltersModule,
    SkyListPagingModule,
    SkyListSecondaryActionsModule,
    SkyListToolbarModule,
    SkyListViewSwitcherModule,
    SkyListViewGridModule,
    SkyModalModule,
    SkyCheckboxModule,
    SkyFilterModule
  ],
  providers: [],
  entryComponents: [SkyListFiltersModalDemoComponent]
})
export class AppExtrasModule { }
