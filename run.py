import os
from app import create_app

# Ensure instance directory exists
os.makedirs('instance', exist_ok=True)

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
