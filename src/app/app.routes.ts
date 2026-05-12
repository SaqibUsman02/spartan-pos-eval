import { Routes } from '@angular/router';

import { PosDemo } from './pos-demo/pos-demo';
import { PosKassa } from './pos-kassa/pos-kassa';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pos-demo' },
  { path: 'pos-demo', component: PosDemo },
  { path: 'pos', component: PosKassa },
];
