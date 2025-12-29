import { Routes } from '@angular/router';
import { authGuard, loginGuard, roleGuard, verifiedGuard } from './Core/guards/AuthGard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  {
    path: '',
    // canActivate: [loginGuard],
    loadComponent: () => import('./Layout/Start/start-layout').then((m) => m.StartLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./Layout/Start/home/home').then((m) => m.Home),
        title: 'Home Page',
      },
      {
        path: 'login',
        loadComponent: () => import('./Layout/Start/login/login').then((m) => m.Login),
        title: 'Login',
      },
      {
        path: 'register',
        loadComponent: () => import('./Layout/Start/register/register').then((m) => m.Register),
        title: 'Register',
      },
      {
        path: 'confirmEmail',
        loadComponent: () =>
          import('./Layout/Start/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
        title: 'Confirm Email',
      },
    ],
  },

  {
    path: 'candidate',
    // canActivate: [authGuard, roleGuard(['Candidate']), verifiedGuard],
    loadComponent: () =>
      import('./Layout/Candidate/candidate-layout').then((m) => m.CandidateLayout),
    children: [
      {
        path: '',
        redirectTo: 'availableJobs',
        pathMatch: 'full',
      },
      {
        path: 'availableJobs',
        loadComponent: () =>
          import('./Layout/Candidate/available-jobs/available-jobs').then((m) => m.AvailableJobs),
        title: 'Available Jobs',
      },
      {
        path: 'myApplication/:id',
        loadComponent: () =>
          import('./Layout/Candidate/my-application/my-application').then((m) => m.MyApplication),
        title: 'My Application',
      },
      {
        path: 'myProfile',
        loadComponent: () =>
          import('./Layout/Candidate/my-profile/my-profile').then((m) => m.MyProfile),
        title: 'My Profile',
      },
    ],
  },

  {
    path: 'manager',
    // canActivate: [authGuard, roleGuard(['Manager']), verifiedGuard],
    loadComponent: () => import('./Layout/Maneger/manger-layout').then((m) => m.MangerLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./Layout/Maneger/dash-board/dash-board').then((m) => m.DashBoard),
        title: 'Dashboard - Manager',
      },
      {
        path: 'addJob',
        loadComponent: () => import('./Layout/Maneger/add-job/add-job').then((m) => m.AddJob),
        title: 'Add New Job',
      },
      {
        path: 'editJob/:id',
        loadComponent: () => import('./Layout/Maneger/add-job/add-job').then((m) => m.AddJob),
        title: 'Edit Job',
      },
      {
        path: 'addProcess',
        loadComponent: () =>
          import('./Layout/Maneger/add-process/add-process').then((m) => m.AddProcess),
        title: 'Add Hiring Process',
      },
      {
        path: 'viewJobs',
        loadComponent: () => import('./Layout/Maneger/view-jobs/view-jobs').then((m) => m.ViewJobs),
        title: 'View All Jobs',
      },
      {
        path: 'viewUsers',
        loadComponent: () =>
          import('./Layout/Maneger/view-users/view-users').then((m) => m.ViewUsers),
        title: 'View All Users',
      },
    ],
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./Layout/Start/unauthorized/unauthorized').then((m) => m.Unauthorized),
    title: 'Access Denied',
  },
  {
    path: 'verify-account',
    loadComponent: () =>
      import('./Layout/Start/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
    title: 'Verify Your Account',
  },
  {
    path: 'notFound',
    loadComponent: () => import('./Layout/not-found').then((m) => m.NotFound),
    title: 'Page Not Found - 404',
  },
  {
    path: '**',
    redirectTo: 'notFound',
  },
];
