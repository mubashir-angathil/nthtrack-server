<h1>
    Nth Track (Server)
    <img src="https://github.com/mubashir-angathil/nthtrack-client/blob/master/public/vite.png" height="40px" alt="Movie Trends Logo"/>
 
</h1>
Welcome to "Nth Track" – an advanced project management system designed to streamline the process of handling permission-based requests for your projects. This comprehensive README guide aims to assist you in seamlessly initiating the project, providing crucial insights for both developers and users.

## Table of Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [Clone the Repository](#clone-the-repository)
    - [Install the Packages](#install-the-packages)
    - [Setup Environment Variables](#setup-environment-variables)
  - [Starting the Server](#starting-the-server)
  - [Technologies Used](#technologies-used)

## Getting Started

### Prerequisites
Before running the server, ensure you have the following dependencies installed:
- Node.js: [Download Node.js](https://nodejs.org/)
- MySQL Server: [Download MySQL Server](https://dev.mysql.com/downloads/mysql/)


### Installation

#### Clone the Repository
```bash
git clone https://github.com/your-username/nthtrack-server.git
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
### Technologies Used
- Node.js
- Express
- Sequelize ORM
- MSSQL
- Socket.io
- JWT
