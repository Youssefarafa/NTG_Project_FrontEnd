# NG Recruitment Platform

**Angular-Based Recruitment Management System**

## 📌 Overview

NG Recruitment Platform is a modern recruitment management system built
with Angular, designed to streamline the hiring lifecycle for both
candidates and hiring managers.\
The platform provides clearly separated workflows, secure
authentication, and automated communication to manage recruitment
processes efficiently from job posting to candidate evaluation.

------------------------------------------------------------------------

## 🚀 Key Features

### 👤 Candidate Experience

-   Secure registration and authentication
-   Browse available job opportunities
-   Apply to multiple job positions
-   Responsive and user-friendly interface

### 👔 Manager Experience

-   Centralized management dashboard
-   Job creation and management
-   Custom hiring process configuration
-   Candidate selection and evaluation
-   Automated email communication

------------------------------------------------------------------------

## 🛠️ Technology Stack

### Frontend

-   Angular 21
-   TypeScript 5.9
-   RxJS 7.8
-   Zone.js 0.16

### UI & Styling

-   PrimeNG 21
-   PrimeIcons 6
-   Tailwind CSS 3
-   Angular CDK

### Utilities

-   CryptoJS
-   ngx-spinner
-   FontAwesome

------------------------------------------------------------------------

## 🔐 Authentication & Security

-   Role-based access control (Candidate / Manager)
-   Protected routes via Angular Guards
-   Token-based authentication ready
-   Encrypted sensitive data

------------------------------------------------------------------------

## ⚙️ Environment Configuration

### Development

``` ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  emailServiceUrl: 'http://localhost:3000/email'
};
```

### Production

``` ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  emailServiceUrl: 'https://your-api-domain.com/email'
};
```

------------------------------------------------------------------------

## 🚦 Getting Started

### Installation

``` bash
npm install
npm start
```

------------------------------------------------------------------------

## 📈 Future Enhancements

-   Backend integration
-   Database persistence
-   Real-time notifications
-   Advanced analytics
-   Multi-language support

------------------------------------------------------------------------

## 📄 License

Proprietary Software -- All Rights Reserved

------------------------------------------------------------------------

**Status**: In Development\
**Version**: 0.0.0\
**Last Updated**: February 2024
