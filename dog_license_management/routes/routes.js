import express from 'express';
import BreedController from '../controllers/BreedController.js';

const router = express.Router();
const breedController = new BreedController();

// Route to load and process CSV/Excel file
router.get('/load-csv/:filePath', (req, res, next) => {
    breedController.loadAndProcessCsv(req, res, next);
});

// Route to retrieve licenses by date range
router.get('/licenses-by-date-range', (req, res, next) => {
    breedController.getLicensesByDateRange(req, res, next);
});

export default router;