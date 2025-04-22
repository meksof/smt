function parseDate(dateString, endOfDay = false) {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date format: ${dateString}`);
    }

    if (endOfDay) {
        date.setHours(23, 59, 59, 999);
    } else {
        date.setHours(0, 0, 0, 0);
    }

    return date;
}

module.exports = { parseDate };