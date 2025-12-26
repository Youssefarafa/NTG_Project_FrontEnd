# Recruitment System - NTG Recruitment Platform

## 📌 Overview
A comprehensive recruitment management system built with Angular that enables candidates to apply for jobs and managers to oversee the entire hiring process. The platform features separate workflows for candidates and hiring managers with secure authentication and automated communication.

## 🚀 Features

### 👤 Candidate Module
- **User Registration & Login** - Secure account creation and authentication
- **Job Browsing** - View all available job postings
- **Application Submission** - Apply for multiple job positions
- **Responsive Interface** - Clean, user-friendly design

### 👔 Manager Module
- **Dashboard** - Centralized management interface
- **Job Management** - Create and manage job postings
- **Hiring Process Creation** - Set up custom recruitment workflows
- **Candidate Selection** - Choose candidates for specific processes
- **Automated Communication** - Send test links via email
- **Candidate Evaluation** - Grade candidates and provide feedback
- **Analytics** - View all users, jobs, and processes

## 🛠️ Technology Stack

### Frontend Framework
- **Angular 21.0.0** - Core framework
- **TypeScript 5.9.2** - Development language
- **RxJS 7.8.0** - Reactive programming
- **Zone.js 0.16.0** - Change detection

### UI Libraries & Styling
- **PrimeNG 21.0.2** - UI component library
- **PrimeIcons 6.0.1** - Icon set
- **Tailwind CSS 3.3.3** - Utility-first CSS framework
- **Angular CDK 21.0.3** - Component dev kit

### Additional Dependencies
- **FontAwesome 7.1.0** - Additional icons
- **CryptoJS 4.2.0** - Encryption utilities
- **ngx-spinner 19.0.0** - Loading indicators

### Development Tools
- **Angular CLI 21.0.0** - Development scaffolding
- **Vitest 4.0.8** - Testing framework
- **Prettier** - Code formatting
- **PostCSS** - CSS processing

## 📋 User Stories & Acceptance Criteria

### Candidate Workflow
1. **US-01: Candidate Registration** - Secure account creation with form validation
2. **US-02: Candidate Login** - Authentication with email/password
3. **US-03: View Available Jobs** - Browse all active job postings
4. **US-04: Apply for a Job** - Submit applications to multiple positions

### Manager Workflow
5. **US-05: Manager Login** - Administrative access with predefined credentials
6. **US-06: View Manager Dashboard** - Centralized management interface
7. **US-07: Add Job** - Create new job postings with details
8. **US-08: Add Hiring Process** - Set up recruitment workflows per job
9. **US-09: Select Candidates** - Choose candidates for specific processes
10. **US-10: Send Test Links** - Automated email notifications with assessment links
11. **US-11: View & Manage Processes** - Track all recruitment processes
12. **US-12: Evaluate Candidates** - Grade and provide feedback
13. **US-13: Save Evaluations** - Store candidate assessment results
14. **US-14: View All Users** - Monitor all registered candidates
15. **US-15: View All Jobs** - Review all created job postings

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v11.1.0 or higher)
- Angular CLI 21.0.0

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ntg-recruitment_system
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
ng serve
```

4. Open your browser and navigate to:
```
http://localhost:4200
```

### Building for Production
```bash
npm run build
```

### Running Tests
```bash
npm test
```

## 🔧 Configuration

### Environment Setup
Create environment files in `src/environments/`:

**environment.ts (development):**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  emailServiceUrl: 'http://localhost:3000/email'
};
```

**environment.prod.ts (production):**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  emailServiceUrl: 'https://your-api-domain.com/email'
};
```

### Tailwind CSS Configuration
The project uses Tailwind CSS with custom configurations in `tailwind.config.js`. PrimeNG themes are integrated for consistent styling.

## 📁 Key Components

### Authentication System
- JWT-based authentication (implied by CryptoJS usage)
- Role-based access control (Candidate/Manager)
- Secure credential storage

### Email Integration
- Automated test link distribution
- Candidate notification system
- Template-based email generation

### Data Management
- In-memory data storage (for demo purposes)
- Expandable to backend API integration
- Candidate evaluation persistence

## 🎨 Styling Guidelines

The project follows a consistent design system:
- **Primary Color Scheme**: Professional blue-based palette
- **Component Library**: PrimeNG for consistent UI elements
- **Responsive Design**: Mobile-first approach with Tailwind
- **Icons**: PrimeIcons + FontAwesome combination

## 🔒 Security Considerations

1. **Input Validation**: All form inputs are validated
2. **Authentication**: Secure login for both candidates and managers
3. **Data Protection**: Encryption for sensitive data
4. **Access Control**: Role-based permissions

## 📈 Future Enhancements

1. **Backend Integration**: Connect to Node.js/Express or .NET API
2. **Database Integration**: MongoDB/PostgreSQL for data persistence
3. **Real-time Notifications**: WebSocket implementation
4. **Advanced Analytics**: Dashboard with charts and metrics
5. **Multi-language Support**: Internationalization
6. **Document Upload**: Resume/CV attachment support
7. **Interview Scheduling**: Calendar integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Support

For support, please contact the development team or create an issue in the repository.

---

**Last Updated**: February 2025
**Version**: 0.0.0  
**Status**: In Development