// Thư Viện
const express = require("express");
const path = require("path");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

//Tự mình xuất ra
const initCronJobs = require("./cron_jobs/cronjobs");
const initializeSocket = require("./config/socket");
const swaggerSetup = require("./swagger");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");
const userRouter = require("./routes/userRouter");
const fileRouter = require("./routes/fileRouter");
const emailRouter = require("./routes/emailRouter");
const authRouter = require("./routes/authRouter");
const settingRouter = require("./routes/settingRouter");
const bannerRouter = require("./routes/bannerRouter");
const movieEntityRouter = require("./routes/movieEntityRouter");
const cinemaRouter = require("./routes/cinemaRouter");
const formatRouter = require("./routes/formatRouter");
const roomRouter = require("./routes/roomRouter");
const movieRouter = require("./routes/movieRouter");
const postRouter = require("./routes/postRouter");
const paymentRouter = require("./routes/paymentRouter");

//Sử dụng engine Pug
app.set("view engine", "pug");

//Implement cors
app.use(cors());
app.options("*", cors());

// app.use(cors({
//     origin: 'https://example.com'
// }));

app.use(express.static(path.join(__dirname, "public")));

//Hiện endpoint trong terminal
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cho phép lấy cookie
app.use(cookieParser());

//Set security HTTP headers
app.use(helmet());

//Được phép gửi 100 cái requests trong 15p
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again in 15 minutes.",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

//Làm sạch dữ liệu chống lại việc tiêm truy vấn NO SQL
app.use(mongoSanitize());

//Làm sạch dữ liệu chống lại XSS
app.use(xss());

// Tránh sự trùng lặp khi truy vấn filter có thể ngoại trừ trong whitelist
app.use(
  hpp({
    whitelist: [],
  })
);

//Chạy cron cron_jobs
initCronJobs();

//Kết nối socket
initializeSocket();

//Swagger
swaggerSetup(app);

// Use Route by middleware
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/file", fileRouter);
app.use("/api/v1/email", emailRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/settings", settingRouter);
app.use("/api/v1/banners", bannerRouter);
app.use("/api/v1/movie-entities", movieEntityRouter);
app.use("/api/v1/cinemas", cinemaRouter);
app.use("/api/v1/formats", formatRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/payments", paymentRouter);

// Error handling middleware nếu kh có api n
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
