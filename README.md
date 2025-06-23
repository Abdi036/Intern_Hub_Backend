# Intern_Hub Backend

A backend service for the Intern_Hub application, designed to connect interns and companies, manage internship opportunities, and streamline the internship experience.

---

## Project Overview

The Intern_Hub backend is built with modern technologies:

- **Backend:** Node.js with Express  
- **Database:** MongoDB  
- **Authentication:** JWT  
- **Containerization:** Docker

---

## Setup Instructions

### Prerequisites

- Docker & Docker Compose installed  
- (Optional) Node.js (v14 or higher) & npm (if running locally without Docker)  
- MongoDB instance (local or cloud, e.g. MongoDB Atlas)

---

### Running with Docker

1. Clone the repository:

    ```bash
    git clone https://github.com/Abdi036/Intern_Hub_Backend.git
    cd Intern_Hub_Backend
    ```

2. Create a `.env` file inside the `Server/` directory with your environment variables.

    Example `.env` file:

    ```env
    PORT=XXXX
    NODE_ENV=XXXXXXXX
    REMOTE_MONGO_URI=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

    # Email Configuration (Gmail)
    EMAIL_USERNAME=XXXXXXXXXXXXXXXXXX
    EMAIL_PASSWORD=XXXXXXXXXXXXXXXXXXXXXXXXX

    # Cloudinary
    CLOUD_NAME=XXXXXXXXXXXXXXXXXXXX
    CLOUD_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXX
    CLOUD_API_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXX
    ```

3. Build and start the containers:

    ```bash
    docker-compose up --build
    ```

4. The backend server will be running at:

    ```
    http://localhost:XXXXX
    ```

---

### Running Locally (Without Docker)

1. Navigate to the Server directory:

    ```bash
    cd Server
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file with your environment variables.

4. Start the server:

    ```bash
    npm start
    ```

---

## Features

- User authentication and authorization  
- Profile management  
- Internship posting and application system  
- File upload functionality  
- Search and filter capabilities  

---

## Technologies Used

**Backend:**  
- Node.js  
- Express.js  
- MongoDB  
- JWT Authentication  
- Docker  

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

---

## 📞 Contact

For any questions or concerns, please open an issue in the repository.
