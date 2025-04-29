# TaskBuddy Backend

TaskBuddy is a mobile application that connects people who need help with errands or tasks to those willing to assist. The backend, built to support the TaskBuddy mobile app, handles user authentication, task management, real-time communication, and administrative functionalities. This repository contains the server-side code for the TaskBuddy application.

🏆 The TaskBuddy project won 1st Place in the national computer science competition in the Software Development category in Croatia, 2024.

You can also check out the mobile app source code [here](https://github.com/damix00/taskbuddy-flutter).

## Features

- User Authentication: Secure registration and login using JSON Web Tokens (JWT) with bcrypt for password hashing and Twilio for phone number verification.
- Task Management: Handles task creation, editing, and deletion with data validation and classification using the Cohere API for text embeddings.
- Real-Time Communication: Implements Socket.io for real-time chat functionality, enabling seamless messaging between users.
- Content Moderation: Utilizes OpenAI Moderation API to detect and shadow-ban inappropriate content.
- Recommendation Algorithm: Personalizes task feeds based on user interests and interactions, stored in a UserInterests table.
- Administrative Interface: Provides analytics, user management, and server configuration through a dedicated admin panel.
- Location-Based Services: Integrates OpenStreetMap API for location-based task filtering and suggestions.
- Firebase Integration: Uses Firebase Storage for media uploads, Firebase Cloud Messaging (FCM) for notifications, and Firebase Remote Config for dynamic configuration.

## Technologies Used

- Node.js: Server-side JavaScript runtime for building the backend.
- Express.js: Web framework for handling HTTP requests and routing.
- PostgreSQL: Relational database for storing user data, tasks, and sessions.
- Socket.io: Enables real-time, bidirectional communication for chat functionality.
- Firebase Admin SDK: Manages file uploads to Firebase Storage and notification delivery.
- Cohere API: Generates text embeddings for task classification and search.
- OpenAI Moderation API: Checks for inappropriate content in task posts.
- Twilio API: Facilitates SMS-based phone number verification.
- OpenStreetMap API: Provides location-based services for task filtering

## Installation

Follow these steps to set up the TaskBuddy backend on your local machine for development and testing.

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL
- Firebase account with Firebase Storage, Cloud Messaging, and Remote Config enabled
- Twilio account for SMS verification
- Cohere API key for text embeddings
- OpenAI API key for content moderation

### Clone the Repository

```bash
git clone https://github.com/damix00/taskbuddy-backend
cd taskbuddy-backend
```

### Install Dependencies

```bash
npm install
```

### Environment Variables
Create a `.env` file in the root directory and configure the following variables:

```
# Database configuration
DATABASE_URL=postgresql://user:password@localhost:5432/taskbuddy

# JWT Secret for token signing
JWT_SECRET=your_jwt_secret

# Twilio configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Firebase configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Cohere API
COHERE_API_KEY=your_cohere_api_key

# OpenAI API
OPENAI_API_KEY=your_openai_api_key

# Disable phone verification (optional, for testing)
DISABLE_PHONE_VERIFICATION=true
```

### Database Setup

Set up a PostgreSQL database and ensure the DATABASE_URL in the `.env` file points to it. The schema is defined in `src/database/queries`.

### Run the Backend

Start the server in development mode:

```bash
npm run dev
```

The server will run on http://localhost:3000 by default (or the port specified in your .env file).

### Running Tests

The backend includes a test suite to ensure functionality. Run tests with:
```bash
npm test
```
or
```bash
npm run test-windws
```
if you're on Windows.

## Notes

- Twilio's free trial limits SMS to approved numbers. Use the DISABLE_PHONE_VERIFICATION environment variable for testing.
- Ensure Firebase services (Storage, FCM, Remote Config) are properly configured in your Firebase project.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.
