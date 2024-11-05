import express from 'express';
import { handleError } from './shared/utils/errorHandler.js';
import validateRequest from './shared/middlewares/validateRequest.js';
import authenticateToken from './shared/middlewares/authenticateToken.js';
import dogLicenseRoutes from './dog_license_management/routes/routes.js';
import { port } from './shared/config/appConfig.js';

const app = express();

// Connecting routes for dog license management
app.use('/dog-license', dogLicenseRoutes);

// Middleware for error handling
app.use((err, req, res, next) => {
    handleError(err, res);
});

// Starting the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});