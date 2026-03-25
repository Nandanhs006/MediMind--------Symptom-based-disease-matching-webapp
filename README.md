# MediMind - Symptom-Based Disease Matching WebApp

A web application that helps users explore potential health conditions based on symptoms they experience. It uses intelligent pattern matching with a structured medical database to identify possible matches and provide quick insights.

## Features

- 🔍 **Smart Symptom Search** - Autocomplete suggestions as you type
- 🎯 **Intelligent Matching** - Compares symptoms against medical database
- 📊 **Match Percentage** - See confidence scores for each potential condition
- 🎨 **Clean UI** - Simple and intuitive interface
- ⚡ **Fast Response** - Instant results without long wait times

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **API**: RESTful endpoints

## Project Structure

```
.
├── public/                 # Frontend assets (served statically)
│   ├── assets/            # Images and logos
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   ├── pages/             # HTML pages
│   └── index.html         # Home page
├── src/                   # Backend code
│   ├── app.js             # Express app setup
│   ├── config/            # Configuration (database)
│   ├── controllers/       # Business logic
│   ├── models/            # Database schema
│   ├── routes/            # API routes
│   └── services/          # Helper services
├── server.js              # Server entry point
├── package.json           # Dependencies
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (running)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Symptom-based-disease-matching-webapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```

4. **Initialize the database**
   ```bash
   psql -U postgres -f src/models/schema.sql
   ```

5. **Start the server**
   ```bash
   node server.js
   ```

6. **Open in browser**
   ```
   http://localhost:5000
   ```

## API Endpoints

### Get Symptoms (Search)
- **URL**: `GET /api/symptoms?q=<query>`
- **Example**: `/api/symptoms?q=fever`
- **Response**: Array of matching symptom names

### Predict Disease
- **URL**: `POST /api/predict`
- **Body**: `{ "symptoms": ["fever", "cough"] }`
- **Response**: Array of diseases with match percentages

## Usage

1. **Home Page** - Click "CHECK SYMPTOMS" to start
2. **Search Page** - Type symptoms, select from suggestions
3. **Results Page** - View predicted diseases with match confidence scores
4. **Navigation** - Use sidebar to explore other sections (How it Works, About)

## Disclaimer

MediMind is intended for **informational purposes only** and does not replace professional medical advice. Always consult a qualified healthcare provider for accurate diagnosis and treatment.

## License

This project is part of an educational initiative.

## Support

For questions or issues, please contact: support@medimind.com
