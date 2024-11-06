import fs from 'fs';
import csv from 'csv-parser';
import xlsx from 'xlsx';
import { pipeline } from 'stream';
import { promisify } from 'util';
import path from 'path';

const pipelineAsync = promisify(pipeline);

class BreedRepository {
    // Loads CSV or Excel file and returns data as an array
    async loadCsv(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }

        if (filePath.endsWith('.csv')) {
            const data = [];
            await pipelineAsync(
                fs.createReadStream(filePath),
                csv(),
                async function* (source) {
                    for await (const row of source) {
                        data.push(row);
                    }
                }
            );
            return data;
        } else if (filePath.endsWith('.xlsx')) {
            const workbook = xlsx.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            return xlsx.utils.sheet_to_json(worksheet);
        } else {
            throw new Error('Unsupported file format');
        }
    }
}

export default BreedRepository;