const Cinemas = require('../model/cinemaModel');

const getCinemaList = async () => {
    try {
        const cinemas = await Cinemas.find({isDeleted: false});
        const mapCinema = cinemas.map(cinema => {
            return {
                id: cinema._id,
                name: cinema.name,
                address: cinema.address + ', ' + cinema.ward.label + ', ' + cinema.district.label + ', ' + cinema.province.label,
                phone: cinema.phone,
            };
        })
        return mapCinema;
    } catch (error) {
        return { error: 'Chat AI đang lỗi vui lòng thử lại sau' };
    }
}

module.exports = {
    getCinemaList
}