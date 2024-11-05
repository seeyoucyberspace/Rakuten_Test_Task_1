import { expect } from 'chai';
import BreedService from '../services/BreedService.js';
import path from 'path';

describe('BreedService', () => {
    it('should load and process CSV data', async () => {
        const breedService = new BreedService();
        const csvPath = path.resolve('data/2017.xlsx');

        await breedService.loadCsv(csvPath);
        const breeds = await breedService.getUniqueBreeds();

        expect(breeds).to.be.an('array');
        expect(breeds.length).to.be.greaterThan(0);
    });

    it('should retrieve top dog names', async () => {
        const breedService = new BreedService();
        const csvPath = path.resolve('data/2017.xlsx');

        await breedService.loadCsv(csvPath);
        const topDogNames = await breedService.getTopDogNames(3);

        expect(topDogNames).to.be.an('array');
        expect(topDogNames.length).to.equal(3);
    });
});
