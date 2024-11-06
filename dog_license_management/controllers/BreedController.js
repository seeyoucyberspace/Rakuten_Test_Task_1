import BreedService from '../services/BreedService.js';
import { ErrorHandler } from '../../shared/utils/errorHandler.js';

class BreedController {
    // Constructor initializing the service for working with licenses
    constructor({ breedService = new BreedService() } = {}) {
        this.breedService = breedService;
    }

    // Loads and processes data from the CSV/Excel file, returns analysis results
    async loadAndProcessCsv(req, res, next) {
        try {
            await this.breedService.loadCsv(req.params.filePath);
            const result = {
                uniqueBreeds: await this.breedService.getUniqueBreeds(),
                licensesByBreedAndType: await this.breedService.getLicensesByBreedAndType(),
                topDogNames: await this.breedService.getTopDogNames(5)
            };
            res.status(200).json(result);
        } catch (error) {
            next(new ErrorHandler(500, 'Failed to load and process CSV data'));
        }
    }

}

export default BreedController;