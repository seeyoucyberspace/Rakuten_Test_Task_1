import { expect } from 'chai';
import BreedService from '../services/BreedService.js';

describe('BreedService', function () {
    // Увеличьте время таймаута для всех тестов в этом блоке
    this.timeout(10000); // Устанавливаем таймаут 10 секунд

    let breedService;

    before(async () => {
        breedService = new BreedService();
        await breedService.loadCsv('./data/2017.xlsx'); // Убедитесь, что путь к файлу верный
    });

    it('should load and process CSV data', async () => {
        const uniqueBreeds = await breedService.getUniqueBreeds();
        expect(uniqueBreeds).to.be.an('array').that.is.not.empty;
    });

    it('should retrieve top dog names', async () => {
        const topDogNames = await breedService.getTopDogNames(5);
        expect(topDogNames).to.be.an('array').that.has.lengthOf(5);
    });

    it('should retrieve licenses issued within a date range', async () => {
        const startDate = '01/01/2017';
        const endDate = '12/31/2017';
        const licenses = await breedService.getLicensesByDateRange(startDate, endDate);
        expect(licenses).to.be.an('array').that.is.not.empty;
    });
});
