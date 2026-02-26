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
# start the stack (build automatically if needed)
./start.sh

# stop the stack
./start.sh down
```

The application will be available at `http://localhost:5000`. Use the "Restaurant List" link at top right to manage the entries.

The database file (`lunch_roulette.db`) is stored in the project root and persists across container restarts via the volume mount.

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

- **View Random Restaurant**: On the main page choose categories (or leave none for all) and press the "Go!" button. A spinning animation will display before the final result.
- **Manage Restaurants**: Click the "Restaurant List" link in the top‑right to go to the admin page. There you can add, edit notes (including hyperlinks), and delete entries. No login is required.

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
