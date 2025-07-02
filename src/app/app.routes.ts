import { Routes } from '@angular/router';

export const routes: Routes = [

    // {
    //   path: 'admin',
    //   loadComponent: () => import('./admin/admin.component'),
    //   children: [
    //     {
    //       path: 'layer',
    //       title: 'Capas',
    //       loadComponent: () => import('./admin/pages/layer/layer.component'),
    //     },
    //     {
    //       path: 'institutions',
    //       title: 'Institutiones',
    //       loadComponent: () => import('./admin/pages/institutions/institutions.component'),
    //     },
    //     {
    //       path: 'index',
    //       title: 'Admin',
    //       loadComponent: () => import('./admin/pages/index/index.component'),
    //     }  
    //   ]
    // },
    {
        path: 'map',
        loadComponent: () => import('./map/map.component'),
      
    },
    {
        path: '',
        redirectTo: '/map',
        pathMatch: 'full'
      }
  
  
  ];
