const searchDB = (search) => {
    const escapeRegex = (str) =>
        str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sanitizedSearch = escapeRegex(search);
    const regex = new RegExp(sanitizedSearch);
    return { $regex: regex, $options: 'i' };
};

module.exports = searchDB;