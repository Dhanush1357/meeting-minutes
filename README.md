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

### 1. Project Management
- Super Admin can create and manage projects, assign roles, and onboard users
- Each project has its own set of roles: MoM Creators, Reviewers, and Approvers

### 2. MoM Management
- MoM Creators can create and submit MoMs
- MoMs can be created from scratch or by pulling topics from previous MoMs within the same project-
- Reviewers can approve or reject MoMs, add comments
- Approvers can finalize MoMs and trigger PDF generation for download

### 3. User Management
- Admin users can send email invitations to onboard new users
- Users can update their profile details and reset passwords

### 4. Notifications
- Email notifications are sent for MoM submission, review, approval, and updates
- Users are notified when they are assigned to a MoM or when their action is required

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

3. Set up the environment variables in a `.env` file in the root of backend folder. The following environment variables are required:
```bash
DATABASE_URL=your_database_url
```

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
