import BreedRepository from '../repositories/BreedRepository.js';
import LicenseDTO from '../data_trade_objects/LicenseDTO.js';
import _ from 'lodash';
import logger from '../../shared/utils/logger.js';
import cache from '../../shared/utils/cache.js';
import fs from 'fs/promises';
import path from 'path';

class BreedService {
    // Constructor initializing dependencies and internal data
    constructor({ breedRepository = new BreedRepository(), licenseDTO = LicenseDTO } = {}) {
        this.breedRepository = breedRepository;
        this.licenseDTO = licenseDTO;
        this.data = {
            breeds: [],
            dogNames: [],
            licenses: []
        };
        this.dataLoaded = false;
    }

    // Loads data from CSV or Excel if it has not already been loaded
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

    // Processes CSV/Excel data and adds it to internal data structures
    processCsvData(data) {
        data.forEach((row) => this.addRowData(row));
        logger.info('CSV data processed and rows added to internal data structure.');
    }

    // Adds a row of data to local arrays for further analysis
    addRowData(row) {
        // Skip rows where ValidDate is empty
        if (!row.ValidDate) {
            return;
        }

        const license = new this.licenseDTO(row);
        if (license.breed) this.data.breeds.push(license.breed);
        if (license.dogName) this.data.dogNames.push(license.dogName);
        this.data.licenses.push(license);
    }

    // Normalizes breeds by removing whitespace and converting to lowercase, then saves the result
    async normalizeBreeds() {
        try {
            const normalizedBreeds = this.data.breeds.map(breed => breed.trim().toLowerCase());
            const uniqueBreeds = [...new Set(normalizedBreeds)];
            const savePath = path.join('data', 'normalized_breeds', 'normalizedBreeds.json');

            await this.ensureDirectoryExists(path.dirname(savePath));
            await fs.writeFile(savePath, JSON.stringify(uniqueBreeds, null, 2));
            logger.info('Normalized breeds have been saved to:', savePath);
        } catch (error) {
            logger.error('Error normalizing breeds:', error);
            throw error;
        }
    }

    // Retrieves unique breeds from the loaded data
    async getUniqueBreeds() {
        return this.getOrSetCache('uniqueBreeds', () => [...new Set(this.data.breeds)]);
    }

    // Retrieves the count of licenses by breed and LicenseType
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
            await this.ensureDirectoryExists(path.dirname(savePath));
            await fs.writeFile(savePath, JSON.stringify(breedLicenseCounts, null, 2));
            logger.info('Licenses by breed and type have been saved to:', savePath);

            return breedLicenseCounts;
        } catch (error) {
            logger.error('Error calculating licenses by breed and type:', error);
            throw error;
        }
    }

    // Retrieves the top N most popular dog names
    async getTopDogNames(count) {
        try {
            const topDogNames = Object.entries(_.countBy(this.data.dogNames))
                .sort((a, b) => b[1] - a[1])
                .slice(0, count)
                .map(([name, count]) => ({ name, count }));

            const savePath = path.join('data', 'normalized_breeds', 'topDogNames.json');
            await this.ensureDirectoryExists(path.dirname(savePath));
            await fs.writeFile(savePath, JSON.stringify(topDogNames, null, 2));
            logger.info('Top dog names have been saved to:', savePath);

            return topDogNames;
        } catch (error) {
            logger.error('Error retrieving top dog names:', error);
            throw error;
        }
    }

    // Retrieves licenses valid within the specified date range
    getLicensesByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            throw new Error('Invalid date format');
        }

        return this.data.licenses.filter(({ validDate }) => validDate >= start && validDate <= end);
    }

    // Retrieves data from cache if available, otherwise computes and caches it
    async getOrSetCache(key, computeFunc) {
        const cachedData = cache.get(key);
        if (cachedData) {
            return cachedData;
        }
        const data = await computeFunc();
        cache.set(key, data);
        return data;
    }

    // Utility function to check if a file exists
    async checkFileExists(filePath) {
        return fs.access(filePath).then(() => true).catch(() => false);
    }

    // Utility function to read JSON from a file
    async readJsonFile(filePath) {
        const fileContent = await fs.readFile(filePath, { encoding: 'utf-8' });
        return JSON.parse(fileContent);
    }

    // Utility function to delete all JSON files in a directory
    async deleteJsonFiles(directory) {
        const files = await fs.readdir(directory);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        await Promise.all(jsonFiles.map(file => fs.unlink(path.join(directory, file)).catch(() => {})));
    }

    // Utility function to ensure a directory exists
    async ensureDirectoryExists(directory) {
        if (!await this.checkFileExists(directory)) {
            await fs.mkdir(directory, { recursive: true });
        }
    }
}

export default BreedService;
