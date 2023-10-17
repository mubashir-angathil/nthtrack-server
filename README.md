# Issue Tracker Server

Welcome to the Issue Tracker Server! This tool helps you manage and keep track of tasks, bugs, and feature requests for your projects.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Clone the Repository](#clone-the-repository)
    - [Install the Packages](#install-the-packages)
    - [Setup Environment Variables](#setup-environment-variables)
  - [Starting the Server](#starting-the-server)

## Getting Started

### Prerequisites
- Node.js and npm installed
- MySQL database configured

### Installation

#### Clone the Repository
```bash
git clone https://github.com/your-username/issue-tracker.git
cd issue-tracker
```

#### Install the Packages
```
npm install 
```
#### Setup Environment Variables
- Rename ```.env.sample``` to ```.env.development```
- Update the file with your configuration:
```bash
# Node env
NODE_ENV=development

# Port 
PORT=5000

# Database
DATABASE=<your_database>
DATABASE_USER_NAME=<database_username>
DATABASE_PASSWORD=<database_password>
HOST=<host>
DIALECT=mysql

# JWT
ACCESS_TOKEN_SECRET=<access_token_secret>
REFRESH_TOKEN_SECRET=<refresh_token_secret>

```
#### Starting the Server
- For a normal server:
  ```
  npm run start
  ```
- For a development server:
  ```
  npm run dev
  ```
