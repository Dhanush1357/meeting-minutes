# MoM Management System

This is a Minutes of Meeting (MoM) Management System designed to streamline the process of creating, reviewing, approving, and managing meeting notes across projects. The system allows project administrators (Super Admin) to manage users, while the MoM Creators, Reviewers, and Approvers handle the process of creating and finalizing MoMs for projects.

## Project Structure

This project follows a monorepo structure using TurboRepo for managing multiple apps and packages in one repository.

### Directory Structure

```bash
mom-management/
├── .gitignore
├── package.json
├── turbo.json
├── README.md
├── apps/
│   ├── backend/       # Backend API (NestJS with PrismaORM)
│   ├── frontend/      # Frontend (NextJS)
├── packages/
│   ├── eslint-config/ # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
```

## Features

### 1. User Management
- Admin users can send email invitations to onboard new users
- New users must fill in necessary details upon their first login
- Users can update their profile details and change their password
- Reset Password functionality with an email-based link

### 2. Project Management
- Super Admin can create and manage projects, assign roles.
- Each project has its own set of roles:
  - MoM Creators
  - Reviewers
  - Approvers
- Projects List View to display all created projects
- Project Detail View with options to edit details
- Super Admin can edit projects by adding users or marking them inactive
- Super Admin can close a project when it's completed

### 3. MoM Management
- MoM Creators can create and submit MoMs
- MoMs can be created from scratch or by importing topics from previous MoMs within the same project
- MoM List View displaying all created MoMs
- MoM Detail View for reviewing and editing MoMs
- MoM Creators can send MoMs for review.
- Reviewers can edit MoMs before approval if required
- Reviewers can approve MoMs or send them back for revision with change comments.
- Approvers can finalize MoMs by approving them.
- Approvers can send MoMs back for revision with change comments
- PDF Generation and Download PDF option for approved MoMs.
- MoM Creators, Reviewers, and Approvers can add weekly updates to an open MoM until it is closed.
- Approvers can close MoMs once all actions are completed.


### 4. Security & Permissions
- Secure API calls with token validation
- Role-based access control ensures users receive data based on their roles
- API endpoints are paginated for better performance
- Activity tracking for all models to maintain logs of changes

### 5. Notifications

### Email Notifications
- Sent when a project is created to the assigned creator
- Sent for MoM-related activities:
  - Creation (Super Admin flow)
  - Review requests
  - Approval requests
  - Rejection notifications
  - Final approval with PDF generation

### Web Notifications
- Sent to attached users when:
  - A project is created
  - A project is edited
  - A project is closed
  - A MoM is sent for review
  - A MoM is sent for approval
  - A MoM is rejected by a reviewer
  - A MoM is approved
  - A MoM is rejected by the approver
  - A MoM is closed


## Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or above)
- npm or yarn (preferably npm)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Dhanush1357/meeting-minutes.git
cd mom-management
```

2. Install dependencies for the entire project using TurboRepo:
```bash
npm install
```

3. Follow the steps in the backend & frontend README :


4. Run the development environment in the root of the project:
```bash
npm run dev
```

This will start all apps (backend, frontend, etc.) in development mode.

## Folder Structure

### Apps
- `apps/backend/`: The backend API built with NestJS. This handles user authentication, project and MoM management, and PDF generation.
- `apps/frontend/`: The frontend built with Next.js and React. This provides the UI for managing MoMs and viewing project details.

### Packages
- `packages/eslint-config/`: Shared ESLint configuration for the entire repo.
- `packages/typescript-config/`: Shared TypeScript configuration for all apps and packages.

## Contributing

1. Fork the repository
2. Create a new branch for your feature/bugfix
3. Write tests for new features or bug fixes
4. Make changes to the code
5. Run the tests and ensure everything works
6. Create a pull request
