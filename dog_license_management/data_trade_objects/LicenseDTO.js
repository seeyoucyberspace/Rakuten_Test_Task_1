import Joi from 'joi';
import moment from 'moment';

class LicenseDTO {
    constructor(data) {
        const value = LicenseDTO.validate(data);
        this.licenseType = value.LicenseType ? value.LicenseType.trim().toLowerCase() : null;
        this.breed = value.Breed.trim().toLowerCase().replace(/\s+/g, '');
        this.color = value.Color ? value.Color.trim().toLowerCase() : null;
        this.dogName = value.DogName.trim().toLowerCase();
        this.ownerZip = value.OwnerZip ? value.OwnerZip.toString() : null;
        this.expYear = value.ExpYear ? value.ExpYear : null;

        if (value.ValidDate) {
            const parsedDate = moment(value.ValidDate, ['M/D/YYYY H:mm', 'MM/DD/YYYY HH:mm'], true);
            if (!parsedDate.isValid()) {
                throw new Error('Invalid License Data: ValidDate must be a valid date');
            }
            this.validDate = parsedDate.toDate();
        } else {
            this.validDate = null;
        }
    }

    static validate(data) {
        const schema = Joi.object({
            LicenseType: Joi.string().optional(),
            Breed: Joi.string().required(),
            Color: Joi.string().optional(),
            DogName: Joi.string().required(),
            OwnerZip: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
            ExpYear: Joi.number().optional(),
            ValidDate: Joi.alternatives().try(Joi.string(), Joi.date()).allow('').optional() // Разрешить строку или дату
        });

        const { error, value } = schema.validate(data);
        if (error) {
            throw new Error(`Invalid License Data: ${error.message}`);
        }
        return value;
    }
}

export default LicenseDTO;
