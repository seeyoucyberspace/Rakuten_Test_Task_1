import BreedRepository from '../repositories/BreedRepository.js';
import LicenseDTO from '../data_trade_objects/LicenseDTO.js';
import _ from 'lodash';
import logger from '../../shared/utils/logger.js';
import cache from '../../shared/utils/cache.js';
import fs from 'fs';
import path from 'path';

class BreedService {
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

    processCsvData(data) {
        data.forEach((row) => this.addRowData(row));
        logger.info('CSV data processed and rows added to internal data structure.');
    }

    addRowData(row) {
        if (!row.ValidDate) {
            return;
        }

        const license = new this.licenseDTO(row);
        if (license.breed) this.data.breeds.push(license.breed);
        if (license.dogName) this.data.dogNames.push(license.dogName);
        this.data.licenses.push(license);
    }

    async normalizeBreeds() {
        try {
            const normalizedBreeds = this.data.breeds.map(breed => breed.trim().toLowerCase());
            const uniqueBreeds = [...new Set(normalizedBreeds)];
            const savePath = path.join('data', 'normalized_breeds', 'normalizedBreeds.json');

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

    async getUniqueBreeds() {
        return this.getOrSetCache('uniqueBreeds', () => [...new Set(this.data.breeds)]);
    }

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

    getLicensesByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start) || isNaN(end)) {
            throw new Error('Invalid date format');
        }

        return this.data.licenses.filter(({ validDate }) => validDate >= start && validDate <= end);
    }

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
        return fs.promises.access(filePath).then(() => true).catch(() => false);
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