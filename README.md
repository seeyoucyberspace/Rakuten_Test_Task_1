
# Dog License Management

## Objective
The main objectives of this project include:

1. **Data Normalization**: Extract and normalize the dog breeds from the provided CSV file (2017.csv).
2. **License Analysis**: Calculate the number of licenses per breed by `LicenseType`.
3. **Top Dog Names**: Identify the top 5 most popular dog names from the dataset.
4. **Date Range License Search (Bonus)**: Provide a method to retrieve licenses issued within a specific date range.

This project also features Mocha/Chai test automation for validating the data extraction and analysis logic.

## Project Structure
The project structure is designed to separate responsibilities and ensure maintainable and scalable code.

```
Rakuten_Test_Task_1
├── data
│   └── normalized_breeds
│       └── 2017.xlsx             # Input dataset for dog licenses.
├── dog_license_management
│   ├── controllers
│   │   └── BreedController.js    # Handles requests for breed operations.
│   ├── data_trade_objects
│   │   └── LicenseDTO.js         # Data transfer objects for dog licenses.
│   ├── repositories
│   │   └── BreedRepository.js    # Manages breed data interaction.
│   ├── routes
│   │   └── routes.js             # Defines API routes.
│   ├── services
│   │   └── BreedService.js       # Core service for managing breeds and licenses.
│   └── specs
│       ├── BreedService.test.js  # Mocha/Chai tests for BreedService.
│       └── TestHelper.js         # Utility for assisting with testing.
├── shared
│   ├── config
│   │   └── appConfig.js          # Application configuration settings.
│   └── utils
│       ├── cache.js              # Caching utilities for application data.
│       ├── errorHandler.js       # Error handling utilities.
│       └── logger.js             # Logging utilities for debugging.
├── node_modules                  # Node.js dependencies.
├── app.js                        # Main entry point of the application.
├── package.json                  # Dependencies and scripts for the project.
├── package-lock.json             # Lock file for dependencies.
└── README.md                     # Project documentation (this document).
```

## Key Components

- **`data/normalized_breeds`**: Contains the input CSV dataset (2017.xlsx) used to perform data analysis and extraction.
- **`dog_license_management/controllers`**: Handles HTTP requests and sends responses using `BreedController.js`.
- **`dog_license_management/repositories`**: `BreedRepository.js` interacts with the data layer, providing functions to manage breed-related information.
- **`dog_license_management/services`**: `BreedService.js` contains the core logic to perform operations like normalizing breeds, counting licenses, and retrieving popular dog names.
- **`dog_license_management/specs`**: Includes unit and integration tests written using Mocha/Chai to validate service functionality.
- **`shared/config`**: Stores application configuration settings.
- **`shared/utils`**: Utility files for logging, error handling, and caching functionalities.

## Project Logic

### Data Normalization
The BreedService reads data from `2017.csv` and normalizes breed names by removing spaces and converting them to lowercase. A list of unique breeds is created and saved in a JSON file.

### License Analysis
The service calculates the number of licenses by `LicenseType` for each unique breed and saves this data in a JSON file for further analysis.

### Top Dog Names
The service identifies the top 5 most popular dog names and saves the results in a JSON file, making it easy to access and analyze.

### Date Range License Search
A method is provided to retrieve licenses that were issued during a specific date range. This functionality helps to track licenses and their trends over time.

## Testing
The project includes tests written using Mocha and Chai to ensure code quality and correctness.

### Running Tests
To run the tests, use the following command:

```sh
npm run test
```
This will execute all the test files in the `dog_license_management/specs/` folder and output the results.

## Installation

1. Clone the repository:

2. Install the required dependencies:
   ```sh
   npm install
   ```
