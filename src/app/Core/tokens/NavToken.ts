import { InjectionToken } from '@angular/core';
import { AppNavigation } from '../models/NavData';

// ======================================================

export const NAVIGATION_TOKEN_START = new InjectionToken<AppNavigation>('app.navigation.start');

export const BRAND_INFO_START = {
  name: 'Recruitment System',
  logoUrl: 'Logo.png',
  Link: '/home',
  logoAlt: 'Recruitment System Logo',
};

export const NAV_LINKS_START = [];

export const NAV_BUTTONS_START = [
  {
    label: 'Login',
    link: '/login',
    Classes:
      'bg-Primary-200 dark:bg-slate-900/50 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-primary-100/90 dark:border-slate-700/50 font-medium py-1.5 px-4 rounded-xl hover:bg-primary-100/30 dark:hover:bg-slate-800/70 hover:border-white/80 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm',
    activeClasses: [
      'bg-gradient-to-r from-teal-500/90 to-cyan-500/90 dark:from-teal-600/90 dark:to-cyan-600/90',
      'text-white',
      'border-transparent',
      'shadow-2xl',
      'backdrop-blur-xl',
      'scale-105',
      'ring-2 ring-blue-300/30 dark:ring-cyan-700/30',
    ],
  },
  {
    label: 'Sign Up',
    link: '/register',
    Classes:
      'bg-Primary-200/20 dark:bg-slate-900/50 backdrop-blur-md text-slate-800 dark:text-slate-200 border border-primary-100/90 dark:border-slate-700/50 font-medium py-1.5 px-4 rounded-xl hover:bg-primary-100/30 dark:hover:bg-slate-800/70 hover:border-white/50 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm',
    activeClasses: [
      'bg-gradient-to-r from-teal-500/90 to-cyan-500/90 dark:from-teal-600/90 dark:to-cyan-600/90',
      'text-white',
      'border-transparent',
      'shadow-2xl',
      'backdrop-blur-xl',
      'scale-105',
      'ring-2 ring-blue-300/30 dark:ring-cyan-700/30',
    ],
  },
];

export const APP_NAVIGATION_START: AppNavigation = {
  brand: BRAND_INFO_START,
  navLinks: NAV_LINKS_START,
  navButtons: NAV_BUTTONS_START,
};

// ======================================================

export const NAVIGATION_TOKEN_CANDIDATE = new InjectionToken<AppNavigation>(
  'app.navigation.candidate'
);

export const BRAND_INFO_CANDIDATE = {
  name: 'Recruitment System',
  logoUrl: 'Logo.png',
  Link: '/candidate/availableJobs',
  logoAlt: 'Recruitment System Logo',
};

export const NAV_LINKS_CANDIDATE = [
  { label: 'Available Jobs', link: '/candidate/availableJobs' },
  { label: 'My Profile', link: '/candidate/myProfile' },
];

export const NAV_BUTTONS_CANDIDATE = [
  {
    label: 'Logout',
    Classes:
      'bg-red-500 text-white font-medium py-1.5 px-4 rounded-lg hover:bg-red-600 hover:shadow-lg transition-all duration-300 text-sm shadow-md dark:bg-red-600 dark:hover:bg-red-700',
    activeClasses: [
      'bg-red-600',
      'shadow-lg',
      'hover:bg-red-700',
      'dark:bg-red-700',
      'dark:hover:bg-red-800',
    ],
  },
];

export const APP_NAVIGATION_CANDIDATE: AppNavigation = {
  brand: BRAND_INFO_CANDIDATE,
  navLinks: NAV_LINKS_CANDIDATE,
  navButtons: NAV_BUTTONS_CANDIDATE,
};

// ======================================================

export const NAVIGATION_TOKEN_MANGER = new InjectionToken<AppNavigation>('app.navigation.manger');

export const BRAND_INFO_MANGER = {
  name: 'Dashboard',
  logoUrl: 'Logo.png',
  Link: '/manager/dashboard',
  logoAlt: 'Recruitment System Logo',
};

export const NAV_LINKS_MANGER = [
  { label: 'Add Job', link: '/manager/addJob' },
  { label: 'Add Process', link: '/manager/addProcess' },
  { label: 'View Users', link: '/manager/viewUsers' },
  { label: 'View Jobs', link: '/manager/viewJobs' },
];

export const NAV_BUTTONS_MANGER = [
  {
    label: 'Logout',
    Classes:
      'bg-red-500 text-white font-medium py-1.5 px-4 rounded-lg hover:bg-red-600 hover:shadow-lg transition-all duration-300 text-sm shadow-md dark:bg-red-600 dark:hover:bg-red-700',
    activeClasses: [
      'bg-red-600',
      'shadow-lg',
      'hover:bg-red-700',
      'dark:bg-red-700',
      'dark:hover:bg-red-800',
    ],
  },
];

export const APP_NAVIGATION_MANGER: AppNavigation = {
  brand: BRAND_INFO_MANGER,
  navLinks: NAV_LINKS_MANGER,
  navButtons: NAV_BUTTONS_MANGER,
};
