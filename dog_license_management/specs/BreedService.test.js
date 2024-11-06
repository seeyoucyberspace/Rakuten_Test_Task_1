import { expect } from 'chai';
import BreedService from '../services/BreedService.js';
import path from 'path';
import logger from '../../shared/utils/logger.js';

let breedService;

// Tests for verifying BreedService functionality
describe('BreedService', function breedServiceTests() {
    this.timeout(20000);

    const dataDirectory = path.join('data', 'normalized_breeds');

    beforeEach(async () => {
        breedService = new BreedService();
        await breedService.loadCsv('./data/2017.xlsx');
    });

    afterEach(async () => {
        // Delete all JSON files after each test to ensure they are not persisted between tests
        await breedService.deleteJsonFiles(dataDirectory);
    });

    it('should normalize breeds and create a unique list of breeds without duplicates', async function () {
        logger.info('Starting test: should normalize breeds and create a unique list of breeds without duplicates');
        await breedService.normalizeBreeds();

        // Check that the file is created
        const fileExists = await breedService.checkFileExists(path.join(dataDirectory, 'normalizedBreeds.json'));
        expect(fileExists).to.be.true;

        // Read the file with normalized breeds
        const normalizedBreeds = await breedService.readJsonFile(path.join(dataDirectory, 'normalizedBreeds.json'));

        // Check that the breeds are normalized
        normalizedBreeds.forEach((breed) => {
            // Verify that all breeds are in lowercase
            expect(breed).to.equal(breed.toLowerCase());
            // Verify that there are no spaces in the breed
            expect(breed).to.not.match(/\s/);
        });

        // Check for breed uniqueness
        const uniqueBreedsSet = new Set(normalizedBreeds);
        expect(normalizedBreeds.length).to.equal(uniqueBreedsSet.size);
        logger.info('Finished test: should normalize breeds and create a unique list of breeds without duplicates');
    });

    it('should create a list of the number of licenses by LicenseType of each unique breed and save to JSON', async function () {
        logger.info('Starting test: should create a list of the number of licenses by LicenseType of each unique breed and save to JSON');
        const licensesByBreedAndType = await breedService.getLicensesByBreedAndType();

        // Check that the file is created
        const fileExists = await breedService.checkFileExists(path.join(dataDirectory, 'licensesByBreedAndType.json'));
        expect(fileExists).to.be.true;

        // Read the file with the number of licenses by breed
        const savedLicensesByBreedAndType = await breedService.readJsonFile(path.join(dataDirectory, 'licensesByBreedAndType.json'));

        // Check that the data contains information for each breed
        expect(Object.keys(savedLicensesByBreedAndType)).to.not.be.empty;

        // Verify that each breed has information about license types
        Object.values(savedLicensesByBreedAndType).forEach((licenseTypes) => {
            expect(licenseTypes).to.be.an('object');
            expect(Object.keys(licenseTypes)).to.not.be.empty;
        });

        // Verify that the data matches the function results
        expect(savedLicensesByBreedAndType).to.deep.equal(licensesByBreedAndType);
        logger.info('Finished test: should create a list of the number of licenses by LicenseType of each unique breed and save to JSON');
    });

    it('should retrieve the top 5 popular dog names with their counts and save to JSON', async function () {
        logger.info('Starting test: should retrieve the top 5 popular dog names with their counts and save to JSON');
        const topDogNames = await breedService.getTopDogNames(5);

        // Check that the file is created
        const fileExists = await breedService.checkFileExists(path.join(dataDirectory, 'topDogNames.json'));
        expect(fileExists).to.be.true;

        // Read the file with the top 5 dog names
        const savedTopDogNames = await breedService.readJsonFile(path.join(dataDirectory, 'topDogNames.json'));

        // Check that the data contains 5 records
        expect(savedTopDogNames).to.be.an('array').that.has.lengthOf(5);

        // Verify that each record contains a dog name and count
        savedTopDogNames.forEach(({ name, count }) => {
            expect(name).to.be.a('string');
            expect(count).to.be.a('number');
        });

        // Verify that the data matches the function results
        expect(savedTopDogNames).to.deep.equal(topDogNames);
        logger.info('Finished test: should retrieve the top 5 popular dog names with their counts and save to JSON');
    });
});
