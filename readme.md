# Simple Metrics Tracker (SMT)

## Project Purpose
The Simple Metrics Tracker (SMT) is a web application designed to track and analyze metrics for a given URL. It provides insights into user visits, current page, session durations, traffic sources, and custom events. Built using **Node.js**, **Express**, and **MongoDB**, SMT includes a dashboard for visualizing metrics and APIs for tracking and retrieving data.

## Tracking
- **Traffic source**:

When sharing your website url (ex: https://mywebsite.me/), add an extra param, like so:
```https://mywebsite.me/?urm_source=linkedin```, where "linkedin" is the source from which users came from.

- **Tracking event**:

The event is an important concept. When we track event we track a user action. And Action is an important metric in the analytics world. It will determine your users' engagement.
An event can be a click, hover or any user interaction. Make sure to add a ```type``` and ```value``` to your request body as though:
```REST
POST http://localhost:3000/event HTTP/1.1
Content-Type: application/json

{
    "type": "click",
    "value": "CTA"
}
````

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Steps
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smt
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following environment variables:
   ```
   PORT=3000
   MONGODB_URI=<your-mongodb-connection-string>
   ```

## Running the Project

### Development Setup
1. Start the development server with **nodemon**:
   ```bash
   npm run dev
   ```
2. The server will run at `http://localhost:3000`.

### Production Setup
1. Start the production server:
   ```bash
   npm start
   ```
2. The server will run at `http://localhost:<PORT>` (default is 3000).


## Features
- **Track Visits**: Log user visits, referrers, and session durations.
- **Custom Events**: Record and analyze user interactions.
- **Dashboard**: Visualize metrics such as total views, average session duration, top referrers, and traffic sources.


## What to Do Next
1. **Use TypeScript Instead of JavaScript**:
    - [ ] Migrate the codebase to TypeScript for better type safety and maintainability.

2. **Enhance Dashboard**:
    - [ ] Add a new page to display detailed data for each visit, including referrer, session duration, and traffic source.

3. **Add authentication**:
    - Add simple authentification, using a password and token system for the api endpoints.

4. **Add template Engine**:
    - [ ] Study which is the minimalist solution for templating.
    - [ ] Display current version in dashboard.


## Contributing
Feel free to fork the repository and submit pull requests for new features or bug fixes.

## License
This project is licensed under the MIT License.

