import express from 'express';
import BreedController from '../controllers/BreedController.js';

const router = express.Router();
const breedController = new BreedController();

// Route to load and process CSV/Excel file
router.get('/load-csv/:filePath', (req, res, next) => {
    breedController.loadAndProcessCsv(req, res, next);
});

export default router;