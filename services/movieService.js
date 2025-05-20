const Movie = require("../model/movieModel");
const AppError = require("../utils/appError");
const slugify = require("slugify");
exports.createMovie = async (data) => {
  // Check trùng tên phim
  const existingMovie = await Movie.findOne({ name: data.name });
  if (existingMovie) {
    throw new AppError("Tên phim đã tồn tại. Vui lòng chọn tên khác", 400);
  }

  // Tạo phim (slug sẽ được middleware tạo từ name)
  const newMovie = await Movie.create(data);
  return newMovie;
};
exports.updateMovie = async (id, data) => {
  const movie = await Movie.findById(id);
  if (!movie) throw new AppError("Không tìm thấy phim", 404);

  // Check trùng tên nếu có name mới
  if (data.name && data.name !== movie.name) {
    const duplicate = await Movie.findOne({
      name: data.name,
      _id: { $ne: id },
    });
    if (duplicate) {
      throw new AppError("Tên phim đã tồn tại. Vui lòng chọn tên khác", 400);
    }

    // Cập nhật slug khi tên thay đổi
    data.slug = slugify(data.name, { lower: true });
  }

  Object.assign(movie, data);
  await movie.save();
  return movie;
};
