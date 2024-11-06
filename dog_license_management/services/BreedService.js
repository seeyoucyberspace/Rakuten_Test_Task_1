import BreedRepository from '../repositories/BreedRepository.js';
import LicenseDTO from '../data_trade_objects/LicenseDTO.js';
import _ from 'lodash';
import logger from '../../shared/utils/logger.js';
import cache from '../../shared/utils/cache.js';
import fs from 'fs';
import path from 'path';
import moment from 'moment';

class BreedService {
    constructor({ breedRepository = new BreedRepository(), licenseDTO = LicenseDTO } = {}) {
        // Initialize the BreedService with dependencies and internal data
        this.breedRepository = breedRepository;
        this.licenseDTO = licenseDTO;
        this.data = {
            breeds: [],
            dogNames: [],
            licenses: []
        };
        this.dataLoaded = false;
    }

    // Load CSV data into the service if not already loaded
    async loadCsv(filePath) {
        try {
            if (this.dataLoaded) return;

            const data = await this.breedRepository.loadCsv(filePath);
            this.processCsvData(data);
            this.dataLoaded = true;

            logger.info('CSV data loaded and processed successfully.');
        } catch (error) {
            logger.error('Error loading CSV data:', error);
            throw error;
        }
    }

    // Process CSV data and add it to internal data structures
    processCsvData(data) {
        data.forEach((row) => this.addRowData(row));
        logger.info('CSV data processed and rows added to internal data structure.');
    }

    // Add a single row of data to the internal data structures
    addRowData(row) {
        if (!row.ValidDate) {
            return;
        }

        const license = new this.licenseDTO(row);
        if (license.breed) this.data.breeds.push(license.breed);
        if (license.dogName) this.data.dogNames.push(license.dogName);
        this.data.licenses.push(license);
    }

    // Normalize breed names by trimming whitespace and converting to lowercase, then save the unique list
    async normalizeBreeds() {
        try {
            const normalizedBreeds = this.data.breeds.map(breed => breed.trim().toLowerCase());
            const uniqueBreeds = [...new Set(normalizedBreeds)];
            const savePath = path.join('data', 'normalized_breeds', 'normalizedBreeds.json');

            // Create directory if it doesn't exist
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, JSON.stringify(uniqueBreeds, null, 2));
            logger.info('Normalized breeds have been saved to:', savePath);
        } catch (error) {
            logger.error('Error normalizing breeds:', error);
            throw error;
        }
    }

    // Retrieve a list of unique breeds, using cache if available
    async getUniqueBreeds() {
        return this.getOrSetCache('uniqueBreeds', () => [...new Set(this.data.breeds)]);
    }

    // Get the count of licenses by breed and license type, and save the results to a file
    async getLicensesByBreedAndType() {
        try {
            const breedLicenseCounts = {};
            this.data.licenses.forEach((license) => {
                if (!breedLicenseCounts[license.breed]) {
                    breedLicenseCounts[license.breed] = {};
                }
                const licenseType = license.licenseType;
                breedLicenseCounts[license.breed][licenseType] = (breedLicenseCounts[license.breed][licenseType] || 0) + 1;
            });

            const savePath = path.join('data', 'normalized_breeds', 'licensesByBreedAndType.json');
            fs.writeFileSync(savePath, JSON.stringify(breedLicenseCounts, null, 2));
            logger.info('Licenses by breed and type have been saved to:', savePath);

            return breedLicenseCounts;
        } catch (error) {
            logger.error('Error calculating licenses by breed and type:', error);
            throw error;
        }
    }

    // Get the top N most popular dog names based on the loaded data
    async getTopDogNames(count) {
        try {
            const topDogNames = Object.entries(_.countBy(this.data.dogNames))
                .sort((a, b) => b[1] - a[1])
                .slice(0, count)
                .map(([name, count]) => ({ name, count }));

            const savePath = path.join('data', 'normalized_breeds', 'topDogNames.json');
            fs.writeFileSync(savePath, JSON.stringify(topDogNames, null, 2));
            logger.info('Top dog names have been saved to:', savePath);

            return topDogNames;
        } catch (error) {
            logger.error('Error retrieving top dog names:', error);
            throw error;
        }
    }

    // Get the licenses issued within a specific date range
    async getLicensesByDateRange(startDate, endDate) {
        try {
            const start = moment(startDate, 'MM/DD/YYYY').toDate();
            const end = moment(endDate, 'MM/DD/YYYY').toDate();

            if (isNaN(start) || isNaN(end)) {
                throw new Error('Invalid date format');
            }

            const licensesInRange = this.data.licenses.filter(({ validDate }) => {
                const date = new Date(validDate);
                return date >= start && date <= end;
            });

            // Convert validDate to ISO string before saving
            const licensesWithFormattedDate = licensesInRange.map(license => ({
                ...license,
                validDate: new Date(license.validDate).toISOString()
            }));

            const savePath = path.join('data', 'normalized_breeds', 'licensesByDateRange.json');
            await fs.promises.writeFile(savePath, JSON.stringify(licensesWithFormattedDate, null, 2));
            logger.info('Licenses issued in the given date range have been saved to:', savePath);

            return licensesWithFormattedDate;
        } catch (error) {
            logger.error('Error getting licenses by date range:', error);
            throw error;
        }
    }

    // Get data from cache if available, otherwise compute and cache it
    async getOrSetCache(key, computeFunc) {
        const cachedData = cache.get(key);
        if (cachedData) {
            return cachedData;
        }
        const data = await computeFunc();
        cache.set(key, data);
        return data;
    }

    // Utility function to read JSON from a file
    async readJsonFile(filePath) {
        const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        return JSON.parse(fileContent);
    }

    // Utility function to delete all JSON files in a directory
    async deleteJsonFiles(directory) {
        const files = await fs.promises.readdir(directory);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        await Promise.all(jsonFiles.map(file => fs.promises.unlink(path.join(directory, file)).catch(() => {})));
    }
}

export default BreedService;
