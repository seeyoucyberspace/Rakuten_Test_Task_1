import fs from 'fs';
import path from 'path';
import logger from '../shared/utils/logger.js';
import { expect } from 'chai';

class TestHelper {
    constructor(dataDirectory) {
        this.dataDirectory = dataDirectory;
    }

    // Logs the start of a test
    logTestStart(testName) {
        logger.info(`Starting test: ${testName}`);
    }

    // Logs the end of a test
    logTestEnd(testName) {
        logger.info(`Finished test: ${testName}`);
    }

    // Deletes all JSON files in the data directory to ensure a clean state between tests
    async deleteJsonFiles() {
        const files = await fs.promises.readdir(this.dataDirectory);
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        await Promise.all(jsonFiles.map(file => fs.promises.unlink(path.join(this.dataDirectory, file)).catch(() => {})));
    }

    // Asserts that a specific file exists in the data directory
    async assertFileExists(fileName) {
        const filePath = path.join(this.dataDirectory, fileName);
        const fileExists = await fs.promises.access(filePath).then(() => true).catch(() => false);
        expect(fileExists).to.be.true;
    }

    // Reads and parses a JSON file from the data directory
    async readJsonFile(fileName) {
        const filePath = path.join(this.dataDirectory, fileName);
        const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        return JSON.parse(fileContent);
    }

    // Verifies that the data in a file matches the expected data
    async verifyFileDataMatches(expectedData, fileName) {
        const actualData = await this.readJsonFile(fileName);
        expect(actualData).to.deep.equal(expectedData);
    }

    // Validates the structure of a JSON file to ensure it matches expected requirements
    validateJsonStructure(jsonData, expectedLength, expectedFields) {
        expect(jsonData).to.be.an('array').that.has.lengthOf(expectedLength);
        jsonData.forEach(item => {
            expectedFields.forEach(({ field, type }) => {
                expect(item).to.have.property(field);
                expect(item[field]).to.be.a(type);
            });
        });
    }
}

export default TestHelper;
