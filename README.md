# Linkopus RabitMQClient

Welcome to the RabitMQClient repository. This project serves as a foundational template for creating microservices using Node.js and TypeScript. It is designed to provide a standardized structure and starting point for developing scalable and maintainable microservices within the Linkopus ecosystem.

## Getting Started

These instructions will help you set up a copy of this template for development and experimentation.

### Prerequisites

- Node.js (version 14 or later recommended)
- npm (version 6 or later)

### Installation

1. **Clone the Repository**

   Clone this repository to your local machine to begin working on your microservice:

    `git clone https://github.com/Linkopus/RabitMQClient.git`
   
   Navigate to the repository:
   
    `cd AiService`

3. **Install Dependencies**

Install the necessary npm packages defined in `package.json`:

    npm install
  

### Project Structure

Here's an overview of the project's directory structure:

- `src/`: Contains the source code for the microservice, including TypeScript files.
- `routes/`: Defines Express routes for your microservice's API endpoints.
- `index.ts`: The entry point for the microservice application.
- `__tests__/`: Contains test files for the microservice.
- `tsconfig.json`: Configuration file for TypeScript.
- `jest.config.ts`: Configuration file for Jest, used for running tests.
- `Dockerfile`: Docker configuration for building a containerized version of the microservice.
- `.eslintrc.json`: ESLint configuration for linting TypeScript files.

### Running the Service

To start the microservice locally, run:

    npm run dev


This command will start the application in development mode with hot reloading enabled.

### Running Tests

Execute the following command to run the test suite:

    npm test


This will run all tests defined in the `__tests__/` directory using Jest.

### Linting

To check for linting errors in the TypeScript files, run:

    npm run lint


To automatically fix linting errors, run:

    npm run lint:fix



### Dockerization

To build a Docker container for the microservice, execute:

    docker build -t linkopus-RabitMQClient .


And to run the container:

    docker run -p 3000:3000 linkopus-RabitMQClient


## Contributing

We welcome contributions from Linkopus team members. Please feel free to create a new branch, make your changes, and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file in the repository for full details.

