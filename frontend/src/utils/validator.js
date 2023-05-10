import Ajv from "ajv"

const ajv = new Ajv()

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export const validateForms = (schemas, data) => {

    for (const [dataKey, dataValue] of Object.entries(data)) {
        var rawKey = dataKey.split('_', 2)[0]
        const schema = schemas[rawKey]
        const validate = ajv.compile(schema)
        const valid = validate(dataValue)

        if (!valid) {
            return {
                "status": valid,
                "message": capitalize(validate.errors[0].message)
            }
        }
    }
    return {
        "status": true,
        "message": "Form valid"
    }

}