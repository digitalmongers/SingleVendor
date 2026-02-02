/**
 * jsonToCsv Utility
 * Converts an array of objects to a CSV string.
 * @param {Array} data - The array of objects to convert.
 * @param {Array} headers - The headers for the CSV file.
 * @param {Array} fields - The object keys corresponding to the headers (supports dot notation).
 * @returns {string} - The generated CSV string.
 */
export const jsonToCsv = (data, headers, fields) => {
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
        const values = fields.map(field => {
            let val = getNestedValue(row, field);
            if (val === null || val === undefined) val = '';
            // Escape commas and wrap in quotes
            val = `"${val.toString().replace(/"/g, '""')}"`;
            return val;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

export default {
    jsonToCsv,
};
