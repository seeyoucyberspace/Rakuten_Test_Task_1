import { expect } from 'chai';
import BreedService from '../services/BreedService.js';
import TestHelper from '../TestHelper.js';
import path from 'path';
import logger from '../../shared/utils/logger.js';

const dataDirectory = path.join('data', 'normalized_breeds');
const FILE_NAMES = {
    NORMALIZED_BREEDS: 'normalizedBreeds.json',
    LICENSES_BY_BREED: 'licensesByBreedAndType.json',
    TOP_DOG_NAMES: 'topDogNames.json',
    LICENSES_BY_DATE: 'licensesByDateRange.json',
};

let breedService;
let testHelper;
testHelper = new TestHelper(dataDirectory);

// Tests for verifying BreedService functionality
describe('BreedService', function breedServiceTests() {
    this.timeout(20000);

    // Before all tests, initialize the BreedService and load the CSV data
    before(async () => {
        breedService = new BreedService();
        await breedService.loadCsv('./data/2017.xlsx');
    });

    // Log the start of each test
    beforeEach(function () {
        testHelper.logTestStart(this.currentTest.title);
    });

    // Log the end of each test and delete all JSON files generated during the test
    afterEach(async function () {
        testHelper.logTestEnd(this.currentTest.title);
        await testHelper.deleteJsonFiles();
    });

    it('should normalize breeds and create a unique list of breeds without duplicates', async function () {
        // Call the normalizeBreeds method to process the data
        await breedService.normalizeBreeds();

        // Assert that the normalized breeds file was created
        await testHelper.assertFileExists(FILE_NAMES.NORMALIZED_BREEDS);
        const normalizedBreeds = await testHelper.readJsonFile(FILE_NAMES.NORMALIZED_BREEDS);

        // Validate the structure of the JSON file
        testHelper.validateJsonStructure(normalizedBreeds, normalizedBreeds.length, []);

        // Ensure that all breeds are lowercase and contain no spaces
        normalizedBreeds.forEach((breed) => {
            expect(breed).to.equal(breed.toLowerCase());
            expect(breed).to.not.match(/\s/);
        });

        // Ensure that all breeds are unique
        const uniqueBreedsSet = new Set(normalizedBreeds);
        expect(normalizedBreeds.length).to.equal(uniqueBreedsSet.size);
    });

    it('should create a list of the number of licenses by LicenseType of each unique breed and save to JSON', async function () {
        // Call the getLicensesByBreedAndType method to process the data
        const licensesByBreedAndType = await breedService.getLicensesByBreedAndType();

        // Assert that the licenses by breed file was created
        await testHelper.assertFileExists(FILE_NAMES.LICENSES_BY_BREED);

        // Verify that the saved data matches the expected data
        await testHelper.verifyFileDataMatches(licensesByBreedAndType, FILE_NAMES.LICENSES_BY_BREED);
    });

    it('should retrieve the top 5 popular dog names with their counts and save to JSON', async function () {
        // Call the getTopDogNames method to get the top 5 dog names
        const topDogNames = await breedService.getTopDogNames(5);

        // Assert that the top dog names file was created
        await testHelper.assertFileExists(FILE_NAMES.TOP_DOG_NAMES);

        // Validate the structure of the JSON file to ensure it has the correct fields and types
        testHelper.validateJsonStructure(topDogNames, 5, [
            { field: 'name', type: 'string' },
            { field: 'count', type: 'number' },
        ]);

        // Verify that the saved data matches the expected data
        await testHelper.verifyFileDataMatches(topDogNames, FILE_NAMES.TOP_DOG_NAMES);
    });

    it('should return the details of licenses issued during the given date range', async function () {
        const startDate = '12/15/2016';
        const endDate = '12/31/2017';

        // Call the getLicensesByDateRange method to get licenses within the given date range
        const licensesByDateRange = await breedService.getLicensesByDateRange(startDate, endDate);

        // Convert expected dates to ISO string for comparison
        const licensesWithFormattedDate = licensesByDateRange.map(license => ({
            ...license,
            validDate: new Date(license.validDate).toISOString()
        }));

        // Assert that the licenses by date range file was created
        await testHelper.assertFileExists(FILE_NAMES.LICENSES_BY_DATE);
        const savedLicensesByDateRange = await testHelper.readJsonFile(FILE_NAMES.LICENSES_BY_DATE);

        // Verify that the saved data matches the expected data
        expect(savedLicensesByDateRange).to.deep.equal(licensesWithFormattedDate);
    });

});
