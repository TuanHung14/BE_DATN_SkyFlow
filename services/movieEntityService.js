const MovieEntity = require('../model/movieEntityModel'); // Đổi tên import cho rõ ràng

const createMovieEntity = async (data) => {
    const movieEntity = new MovieEntity(data);
    return await movieEntity.save();
};

const getAllMovieEntities = async () => {
    return await MovieEntity.find();
};

const getMovieEntityById = async (id) => {
    const movieEntity = await MovieEntity.findById(id);
    if (!movieEntity) {
        throw new Error('Không tìm thấy thực thể');
    }
    return movieEntity;
};

const updateMovieEntity = async (id, data) => {
    const movieEntity = await MovieEntity.findByIdAndUpdate(
        id,
        { ...data, updatedAt: Date.now() },
        { new: true, runValidators: true }
    );
    if (!movieEntity) {
        throw new Error('Không tìm thấy thực thể');
    }
    return movieEntity;
};

const deleteMovieEntity = async (id) => {
    const movieEntity = await MovieEntity.findByIdAndDelete(id);
    if (!movieEntity) {
        throw new Error('Không tìm thấy thực thể');
    }
    return movieEntity;
};

module.exports = {
    createMovieEntity,
    getAllMovieEntities,
    getMovieEntityById,
    updateMovieEntity,
    deleteMovieEntity,
}