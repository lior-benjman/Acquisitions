# Gemini Customization for `src`

This file provides context specifically for the `src` directory.

## Directory Structure

*   **`config/`**: Contains configuration files for different parts of the application (e.g., database, logging).
*   **`controllers/`**: Handles the incoming requests, validates the data and calls the appropriate services.
*   **`middleware/`**: Express middleware for tasks like authentication and security.
*   **`models/`**: Defines the data models and schemas (e.g., for users, products).
*   **`public/`**: Static assets that are served directly to the client (HTML, CSS, JS, images).
*   **`routes/`**: Defines the API endpoints and connects them to the controllers.
*   **`services/`**: Contains the business logic of the application.
*   **`utils/`**: Utility functions that can be reused across the application.
*   **`validations/`**: Validation schemas for the request data.

## Key Files

*   **`app.js`**: Main application file where all the pieces are wired together.
*   **`server.js`**: The script that starts the server.
*   **`index.js`**: Entry point of the application.
