import {
  NgModule
} from '@angular/core';

import {
  SkyIconModule
} from '@skyux/indicators';

import {
  SkyRadioModule
} from '@skyux/forms';

import {
  SkyListFiltersModule,
  SkyListModule,
  SkyListPagingModule,
  SkyListSecondaryActionsModule,
  SkyListToolbarModule
} from './public';

import { ListViewTestComponent } from './public/modules/list/fixtures';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations:
  [
    ListViewTestComponent
  ],
  imports: [
    BrowserModule,
    SkyIconModule,
    SkyListModule,
    SkyListFiltersModule,
    SkyListPagingModule,
    SkyListSecondaryActionsModule,
    SkyListToolbarModule,
    SkyRadioModule
  ],
  exports: [
    SkyIconModule,
    SkyListModule,
    SkyListFiltersModule,
    SkyListPagingModule,
    SkyListSecondaryActionsModule,
    SkyListToolbarModule,
    SkyRadioModule,
    ListViewTestComponent
  ],
  providers: [],
  entryComponents: []
})
export class AppExtrasModule { }
