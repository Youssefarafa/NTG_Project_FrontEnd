import { VerifyCode } from './Layout/Start/verify-code/verify-code';
import { Routes } from '@angular/router';
import { authGuard } from './Core/guards/AuthGard';
import { loginGuard } from './Core/guards/loginGuard';
import { unverifiedGuard } from './Core/guards/unverifiedGuard';
import { featureGuard } from './Core/guards/featureGuard';
import { verifiedGuard } from './Core/guards/verifiedGuard';
import { roleGuard } from './Core/guards/roleGuard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },

  /* ================= START LAYOUT (Public & Guest) ================= */
  {
    path: '',
    loadComponent: () => import('./Layout/Start/start-layout').then((m) => m.StartLayout),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./Layout/Start/home/home').then((m) => m.Home),
        title: 'Home Page',
        data: { animation: 'HomePage' },
      },
      {
        path: 'login',
        // canActivate: [loginGuard],
        loadComponent: () => import('./Layout/Start/login/login').then((m) => m.Login),
        title: 'Login',
        data: { animation: 'LoginPage' },
      },
      {
        path: 'register',
        // canActivate: [loginGuard],
        loadComponent: () => import('./Layout/Start/register/register').then((m) => m.Register),
        title: 'Register',
        data: { animation: 'RegisterPage' },
      },
      {
        path: 'confirmEmail',
        // canActivate: [unverifiedGuard],
        loadComponent: () =>
          import('./Layout/Start/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
        title: 'Confirm Your Email',
        data: { animation: 'ConfirmEmailPage' },
      },
      {
        path: 'forgotPassword',
        // canActivate: [featureGuard('isForgetPasswordEnabled')],
        loadComponent: () =>
          import('./Layout/Start/forgot-password/forgot-password').then((m) => m.ForgotPassword),
        title: 'Forgot Password',
        data: { animation: 'ForgotPasswordPage' },
      },
      {
        path: 'verifyCode',
        // canActivate: [featureGuard('isForgetPasswordEnabled')],
        loadComponent: () =>
          import('./Layout/Start/verify-code/verify-code').then((m) => m.VerifyCode),
        title: 'Verify Code',
        data: { animation: 'VerifyCodePage' },
      },
      {
        path: 'resetPassword',
        // canActivate: [featureGuard('isForgetPasswordEnabled')],
        loadComponent: () =>
          import('./Layout/Start/reset-password/reset-password').then((m) => m.ResetPassword),
        title: 'Reset Password',
        data: { animation: 'ResetPasswordPage' },
      },
    ],
  },

  /* ================= CANDIDATE LAYOUT (Protected) ================= */
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
        data: { animation: 'AvailableJobsPage' },
      },
      {
        path: 'myApplication/:id',
        loadComponent: () =>
          import('./Layout/Candidate/my-application/my-application').then((m) => m.MyApplication),
        title: 'My Application',
        data: { animation: 'MyApplicationPage' },
      },
      {
        path: 'myApplications',
        loadComponent: () =>
          import('./Layout/Candidate/my-applications/my-applications').then((m) => m.MyApplications),
        title: 'My Applications',
        data: { animation: 'MyApplicationsPage' },
      },
      {
        path: 'myProfile',
        loadComponent: () =>
          import('./Layout/Candidate/my-profile/my-profile').then((m) => m.MyProfile),
        title: 'My Profile',
        data: { animation: 'MyProfilePage' },
      },
    ],
  },

  /* ================= MANAGER LAYOUT (Protected) ================= */
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
        data: { animation: 'ManagerDashboardPage' },
      },
      {
        path: 'addJob',
        loadComponent: () => import('./Layout/Maneger/add-job/add-job').then((m) => m.AddJob),
        title: 'Add New Job',
        data: { animation: 'AddJobPage' },
      },
      {
        path: 'editJob/:id',
        loadComponent: () => import('./Layout/Maneger/add-job/add-job').then((m) => m.AddJob),
        title: 'Edit Job',
        data: { animation: 'EditJobPage' },
      },
      {
        path: 'processActive/:id',
        loadComponent: () =>
          import('./Layout/Maneger/process-active/process-active').then((m) => m.ProcessActive),
        title: 'Process Active',
        data: { animation: 'ProcessActivePage' },
      },
      {
        path: 'processComplete/:id',
        loadComponent: () =>
          import('./Layout/Maneger/process-complete/process-complete').then(
            (m) => m.ProcessComplete
          ),
        title: 'Process Complete',
        data: { animation: 'ProcessCompletePage' },
      },
      {
        path: 'addProcess',
        loadComponent: () =>
          import('./Layout/Maneger/add-process/add-process').then((m) => m.AddProcess),
        title: 'Add Hiring Process',
        data: { animation: 'AddProcessPage' },
      },
      {
        path: 'viewJobs',
        loadComponent: () => import('./Layout/Maneger/view-jobs/view-jobs').then((m) => m.ViewJobs),
        title: 'View All Jobs',
        data: { animation: 'ViewJobsPage' },
      },
      {
        path: 'viewUsers',
        loadComponent: () =>
          import('./Layout/Maneger/view-users/view-users').then((m) => m.ViewUsers),
        title: 'View All Users',
        data: { animation: 'ViewUsersPage' },
      },
    ],
  },

  /* ================= SYSTEM ROUTES ================= */
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./Layout/Start/unauthorized/unauthorized').then((m) => m.Unauthorized),
    title: 'Access Denied',
    data: { animation: 'UnauthorizedPage' },
  },
  {
    path: 'verify-account',
    // canActivate: [unverifiedGuard],
    loadComponent: () =>
      import('./Layout/Start/confirm-email/confirm-email').then((m) => m.ConfirmEmail),
    title: 'Verify Your Account',
    data: { animation: 'VerifyAccountPage' },
  },
  {
    path: 'notFound',
    loadComponent: () => import('./Layout/not-found').then((m) => m.NotFound),
    title: 'Page Not Found - 404',
    data: { animation: 'NotFoundPage' },
  },
  {
    path: '**',
    redirectTo: 'notFound',
  },
];
