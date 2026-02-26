# Lunch Roulette

A web application that helps you randomly pick a restaurant from your saved list, with category filtering.

## Features

- Add restaurants with optional categories
- View all restaurants in a dedicated list
- Filter by category checkboxes
- "Select All" checkbox to include all categories
- Spin to get a random restaurant recommendation
- Delete restaurants from the list
- Fully containerized with Docker

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Running with Docker Compose

```bash
docker-compose up
```

The application will be available at `http://localhost:5000`

### Manual Setup (without Docker)

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
python run.py
```

Visit `http://localhost:5000` in your browser.

## Project Structure

```
.
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # Database models
│   ├── routes.py            # API endpoints
│   ├── static/
│   │   ├── style.css        # Frontend styling
│   │   └── script.js        # Frontend logic
│   └── templates/
│       └── index.html       # Main HTML template
├── config.py                # Configuration settings
├── run.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

## How to Use

1. **Add a Restaurant**: Enter the restaurant name in the input field, optionally add a category, and click "Add"
2. **Select Categories**: Check the categories you want to include in the random selection
3. **Spin**: Click the "Go!" button to get a random restaurant from the selected categories
4. **Delete**: Click "Delete" on any restaurant to remove it

## Technologies Used

- **Backend**: Flask (Python)
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript
- **Containerization**: Docker & Docker Compose

## Modifying the Application

The application structure makes it easy to customize:

- **Styling**: Edit `app/static/style.css` to change colors, fonts, or layout
- **HTML Layout**: Modify `app/templates/index.html` to rearrange elements
- **Functionality**: Update `app/static/script.js` for frontend behavior or `app/routes.py` for backend logic
- **Database**: Modify `app/models.py` to add new fields or tables

Changes are reflected automatically when the container is running (thanks to volume mounting).
