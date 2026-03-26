# MediMind - Symptom-Based Disease Matching Web Application

## Overview

MediMind is a full-stack web application that predicts possible diseases based on user-input symptoms. It provides quick and structured health insights by mapping symptoms to diseases using a database-driven backend.

This project demonstrates a complete system including frontend, backend, database integration, and deployment.

---

## Features

* Symptom-based disease prediction with dynamic search
* Fast autocomplete suggestions
* Match confidence percentages displayed for each result
* Disease library with detailed information
* RESTful API backend
* Modular and scalable project structure
* Production-ready deployment configuration

---

## Tech Stack

### Frontend

* HTML5
* CSS3
* Vanilla JavaScript

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL (Neon)

### Deployment

* Render
* GitHub

---

## Project Structure

```
MediMind/
├── public/
│   ├── assets/
│   │   └── logo.png
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── library.js
│   │   └── diseases-data.js
│   └── pages/
│       ├── search.html
│       ├── result.html
│       ├── library.html
│       ├── about.html
│       └── workInfo.html
├── src/
│   ├── app.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── diseaseController.js
│   ├── models/
│   │   └── schema.sql
│   ├── routes/
│   │   └── diseaseRoutes.js
│   └── services/
├── index.html
├── server.js
├── package.json
├── .env
└── README.md
```

---

## Installation and Setup

### Prerequisites

* Node.js (v18+)
* PostgreSQL or Neon database account
* Git

### 1. Clone the repository

```bash
git clone https://github.com/Nandanhs006/MediMind--------Symptom-based-disease-matching-webapp.git
cd MediMind--------Symptom-based-disease-matching-webapp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=your_neon_postgresql_connection_string
NODE_ENV=development
```

### 4. Initialize the database

```bash
psql -U your_user -d your_database -f src/models/schema.sql
```

### 5. Run the application

```bash
npm start
```

The server will run on:

```
http://localhost:5000
```

---

## Database Schema

### Core Tables

* diseases - Main disease information
* disease_symptoms - Junction table for disease-symptom relationships

### Key Features

* Many-to-many relationship between diseases and symptoms
* Each disease contains multiple symptoms, treatments, and descriptions
* Efficient symptom matching for predictions

---

## API Endpoints

### Predict Disease

```
POST /api/predict
```

#### Request Body

```json
{
  "symptoms": ["fever", "cough", "headache"]
}
```

#### Response

```json
[
  {
    "name": "Flu",
    "match": 87
  },
  {
    "name": "Common Cold",
    "match": 72
  }
]
```

### Get Symptoms (Search)

```
GET /api/symptoms?q=fever
```

#### Response

```json
["fever", "high fever", "sudden fever"]
```

---

## Pages

* Home - Introduction and quick access
* Search - Main symptom selection and disease prediction
* Results - Disease matches with confidence percentages
* Library - Browse all diseases with details
* How It Works - Information about the application
* About - Project information

---

## Deployment to Render

### Steps

1. Push the project to GitHub
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. Connect the repository to Render
   * Go to https://dashboard.render.com
   * Create a new Web Service
   * Connect your GitHub repository
   * Select the branch to deploy

3. Add environment variables in Render dashboard
   ```
   DATABASE_URL=your_neon_postgresql_url
   NODE_ENV=production
   ```

4. Deploy
   * Render will automatically build and deploy on every push to main branch

---

## Important Notes

* Always use environment variables for sensitive data
* SSL is required for production database connections
* Avoid hardcoding localhost URLs
* Use relative API paths (e.g., `/api/predict`)
* Never commit the `.env` file to git

---

## Development

### Available Scripts

```bash
npm start      # Start the server
npm test       # Run tests (if configured)
```

---

## Future Enhancements

* Machine learning-based prediction improvements
* User authentication and accounts
* Search history tracking
* Advanced analytics and statistics
* Mobile app version
* Multi-language support
* Admin dashboard for disease management

---

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Make your changes and commit
4. Push to your fork
5. Submit a pull request

---

## License

This project is licensed under the MIT License.

---

## Author

Nandan H S

GitHub: https://github.com/Nandanhs006

---

## Live Demo

https://medimind-symptom-disease.onrender.com

2. **Set up PostgreSQL on Neon**
   - Create account at https://neon.tech
   - Create a new project (free tier available)
   - Get connection string details

3. **Deploy to Render**
   - Go to https://render.com
   - Click "New Web Service"
   - Connect GitHub repository
   - Set environment variables from Neon database
   - Deploy!

For detailed deployment instructions, see [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)

### Required Environment Variables for Render
```
DB_USER          # PostgreSQL username
DB_HOST          # Database host (e.g., neon.tech)
DB_NAME          # Database name
DB_PASSWORD      # Database password
DB_PORT          # Database port (usually 5432)
NODE_ENV         # production
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
