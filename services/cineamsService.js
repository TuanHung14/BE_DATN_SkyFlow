const Cinema = require("../model/cinemaModel");
const User = require("../model/userModel");

const getCinemaList = async (userId) => {
    try {
        const user = userId ? await User.findById(userId, 'location') : null;
        const multiplier = 0.001;
        let cinemas;
        if (!user || user.location.coordinates[0] === 0 || user.location.coordinates[1] === 0) {
            cinemas = await Cinema.find(
                {
                    isDeleted: false
                },
                {
                    name: 1,
                    province: 1,
                    district: 1,
                    ward: 1,
                    address: 1,
                    phone: 1
                })
                .sort({ createdAt: -1 })
                .limit(4);
        } else {
            const [latitude, longitude] = user.location.coordinates;
            cinemas = await Cinema.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: 'Point',
                            coordinates: [latitude * 1, longitude * 1],
                        },
                        distanceField: 'distance',
                        distanceMultiplier: multiplier,
                        query: { isDeleted: false }
                    }
                },
                {
                    $limit: 4
                },
                {
                    $project: {
                        name: 1,
                        province: 1,
                        district: 1,
                        ward: 1,
                        address: 1,
                        phone: 1,
                        distance: 1
                    }
                }
            ]);
        }

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