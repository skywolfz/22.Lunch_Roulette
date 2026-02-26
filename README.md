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

> **Note on persistence:**
> The database file is stored in `instance/lunch_roulette.db` inside the container. Docker Compose mounts this path to a named volume (`lunch_roulette_db`), so your data survives container rebuilds. If you previously added restaurants with an earlier version, they may have been stored in a different file (`lunch_roulette.db` at the project root) which was lost when the container was recreated. To recover them, see the section below.

## Migrating existing data

If you still have the old database (inside a container or wherever it was created) you can copy it to the new location before starting the stack:

```bash
# from the host, locate the volume data dir
# e.g. /var/snap/docker/common/var-lib-docker/volumes/lunch_roulette_db/_data
# then copy the previous database into that directory and rename it:
cp /path/to/old/lunch_roulette.db /var/snap/docker/common/var-lib-docker/volumes/lunch_roulette_db/_data/lunch_roulette.db
```

After that `./start.sh` will use the migrated data.  


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
