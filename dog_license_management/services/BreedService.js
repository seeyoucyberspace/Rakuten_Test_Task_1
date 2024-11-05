import BreedRepository from '../repositories/BreedRepository.js';
import LicenseDTO from '../data_trade_objects/LicenseDTO.js';
import _ from 'lodash';
import logger from '../../shared/utils/logger.js';
import cache from '../../shared/utils/cache.js';
import moment from 'moment';

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
        } catch (error) {
            logger.error('Error loading CSV data:', error);
            throw error;
        }
    }

    processCsvData(data) {
        data.forEach((row) => this.addRowData(row));
    }

    addRowData(row) {
        // Пропустить строки, где ValidDate пустое
        if (!row.ValidDate) {
            return;
        }

        const license = new this.licenseDTO(row);
        if (license.breed) this.data.breeds.push(license.breed);
        if (license.dogName) this.data.dogNames.push(license.dogName);
        this.data.licenses.push(license);
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

    getUniqueBreeds() {
        return this.getOrSetCache('uniqueBreeds', () => [...new Set(this.data.breeds)]);
    }

    getLicensesByBreedAndType() {
        return this.getOrSetCache('licensesByBreedAndType', () => {
            const breedLicenseCounts = {};
            this.data.licenses.forEach((license) => {
                if (!breedLicenseCounts[license.breed]) {
                    breedLicenseCounts[license.breed] = {};
                }
                const licenseType = license.licenseType;
                breedLicenseCounts[license.breed][licenseType] = (breedLicenseCounts[license.breed][licenseType] || 0) + 1;
            });
            return breedLicenseCounts;
        });
    }

    getTopDogNames(count) {
        return this.getOrSetCache('topDogNames', () =>
            Object.entries(_.countBy(this.data.dogNames))
                .sort((a, b) => b[1] - a[1])
                .slice(0, count)
        );
    }

    // Бонус: метод для получения лицензий в заданном диапазоне дат
    getLicensesByDateRange(startDate, endDate) {
        const start = moment(startDate, 'MM/DD/YYYY').toDate();
        const end = moment(endDate, 'MM/DD/YYYY').toDate();

        if (isNaN(start) || isNaN(end)) {
            throw new Error('Invalid date format');
        }

        return this.data.licenses.filter(({ validDate }) => validDate >= start && validDate <= end);
    }
}

export default BreedService;
