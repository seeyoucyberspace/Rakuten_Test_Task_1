import Joi from 'joi';
import moment from 'moment';

export default class LicenseDTO {
    constructor(data) {
        const value = LicenseDTO.validate(data);
        this.licenseType = value.LicenseType ? value.LicenseType.trim().toLowerCase() : null;
        this.breed = value.Breed.trim().toLowerCase().replace(/\s+/g, '');
        this.color = value.Color ? value.Color.trim().toLowerCase() : null;
        this.dogName = value.DogName.trim().toLowerCase();
        this.ownerZip = value.OwnerZip ? String(value.OwnerZip) : null; // Преобразование в строку
        this.expYear = value.ExpYear ? value.ExpYear : null;

        // Parsing ValidDate only if it exists
        if (value.ValidDate) {
            // Добавление поддержки нужного формата даты
            const parsedDate = moment(value.ValidDate, ['MM/DD/YYYY H:mm', 'M/D/YYYY H:mm'], true);
            if (!parsedDate.isValid()) {
                throw new Error('Invalid License Data: ValidDate must be a valid date');
            }
            this.validDate = parsedDate.toDate();
        } else {
            this.validDate = null;
        }
    }

    // Method to validate license data using Joi
    static validate(data) {
        const schema = Joi.object({
            LicenseType: Joi.string().optional(),
            Breed: Joi.string().required(),
            Color: Joi.string().optional(),
            DogName: Joi.string().required(),
            OwnerZip: Joi.alternatives().try(Joi.string(), Joi.number()).optional(), // Разрешаем строку или число
            ExpYear: Joi.number().optional(),
            ValidDate: Joi.alternatives().try(Joi.string(), Joi.date()).allow('').optional() // Разрешаем строку или дату, в том числе пустую
        });

        const { error, value } = schema.validate(data);
        if (error) {
            throw new Error(`Invalid License Data: ${error.message}`);
        }
        return value;
    }
}
