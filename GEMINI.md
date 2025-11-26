# Gemini Customization File

This file is used to customize the behavior of the Gemini CLI agent.

You can use it to:

*   **Define project-specific conventions:** Specify coding styles, preferred frameworks, and architectural patterns.
*   **Provide context about the codebase:** Explain the purpose of different modules, important files, or data structures.
*   **Set operational guidelines:** Define commands for building, testing, and linting the project.
*   **List important facts:** Store project-specific information that Gemini should remember.

Gemini will read this file at the beginning of each session to tailor its interactions to your project's needs.

## Example Usage

### General Instructions

*   This is a Node.js project using Express.js.
*   The primary package manager is npm.
*   Tests are written with Jest.
*   The preferred coding style is based on Prettier.

### Important Commands

*   `npm install`: Install dependencies.
*   `npm test`: Run tests.
*   `npm run lint`: Lint the code.
*   `npm run dev`: Start the development server.

### Key Files

*   `src/app.js`: The main application entry point.
*   `src/routes/`: Contains all the API routes.
*   `drizzle.config.js`: Database configuration for Drizzle ORM.
