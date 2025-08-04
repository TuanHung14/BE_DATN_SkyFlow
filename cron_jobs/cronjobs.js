const cron = require("node-cron");
const { updateMovieStatusLogic } = require("../services/movieService");
const Showtime = require("../model/showtimeModel");
const Ticket = require("../model/ticketModel");
const User = require("../model/userModel");
const Level = require("../model/levelModel");
const { queryMomoPayment, queryZaloPayPayment, queryVnPayPayment } = require("../controller/paymentController");
const VoucherUse = require("../model/voucherUseModel");
const Voucher = require("../model/voucherModel");
const Email = require("../utils/email");

module.exports = () => {
    // Cron job chạy hàng ngày lúc 00:00
    cron.schedule("0 0 * * *", async () => {
        try {
            const count = await updateMovieStatusLogic();

            // Xóa các showtime có showDate trước 2 ngày
            const daysToKeep = 2;
            const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

            await Showtime.updateMany(
                {
                    showDate: {$lt: cutoffDate},
                    isDeleted: { $ne: true }
                },
                {
                    $set: {
                        isDeleted: true
                    }
                }
            );

            // Check sinh nhật cua người dùng
            const today = new Date();

            const usersWithBirthday = await User.find({
                $expr: {
                    $and: [
                        { $eq: [{ $dayOfMonth: '$dateOfBirth' }, today.getDate()] },
                        { $eq: [{ $month: '$dateOfBirth' }, today.getMonth() + 1] }
                    ]
                }
            }).populate("level");

            if (usersWithBirthday.length > 0) {
                for (const user of usersWithBirthday) {
                    // Kiểm tra xem người dùng đã nhận quà sinh nhật trong năm nay chưa
                    const alreadyReceived = user?.lastBirthdayReward
                        ? new Date(user.lastBirthdayReward).getFullYear() === today.getFullYear()
                        : false;

                    // Nếu chưa nhận quà sinh nhật trong năm nay, thì gửi voucher
                    if (user?.level?.voucherId && !alreadyReceived) {
                        await VoucherUse.findOneAndUpdate(
                            { userId: user._id, voucherId: user.level.voucherId },
                            { $inc: { usageLimit: 1 } },
                            { new: true, upsert: true }
                        );
                        // Cập nhật ngày nhận quà sinh nhật
                        await User.updateOne(
                            { _id: user._id },
                            { $set: { lastBirthdayReward: today } }
                        );
                        // Gửi email thông báo
                        const voucher = user.level.voucherId ? await Voucher.findById(user.level.voucherId) : null;

                        const emailContent = {
                            userName: user.name,
                            voucherCode: voucher ? voucher.voucherCode : 'Không có voucher',
                            voucherName: voucher ? voucher.voucherName : 'Không có voucher',
                            discountValue: voucher ? voucher.discountValue : 'Không có voucher',
                            imageUrl: voucher ? voucher.imageUrl : '',
                        };

                        // Gửi email thông báo nâng cấp cấp độ
                        await new Email(user, emailContent).sendBirthdayVoucher()
                    }
                }
            }

        } catch (error) {
            console.error("Cronjob error:", error);
        }
    });

    // Cron job kiểm tra payment status mỗi 5 phút
    cron.schedule("*/5 * * * *", async () => {
       try{
           const now = Date.now();
           const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
           const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000);
           const pendingTickets = await Ticket.find({
               paymentStatus: "Pending",
               createdAt: {
                   $gte: oneDayAgo,
                   $lte: fifteenMinutesAgo
               },
           }).populate("paymentMethodId");


           if (pendingTickets.length > 0) {
               for (const ticket of pendingTickets) {
                   if(ticket.paymentMethodId.type === "Momo" && ticket._id) {
                       await queryMomoPayment(ticket._id);
                   }else if(ticket.paymentMethodId.type === "Zalopay" && ticket.appTransId) {
                       await queryZaloPayPayment(ticket.appTransId, ticket._id);
                   }else if(ticket.paymentMethodId.type === "VnPay" && ticket.transDate) {
                       const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                       await queryVnPayPayment(ticket._id, ticket.transDate)
                       await delay(1500);
                   }
               }
           }
           console.log("Update status payment success");
       }catch (error) {
           console.error("Update status error", error);
       }
    });

    // Cron job: Cập nhật trạng thái showtime khi sắp đến giờ chiếu (5 phút trước)
    cron.schedule("* * * * *", async () => {
        try{
            const now = new Date();
            const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

            const upcomingShowtimes = await Showtime.find({
                startTime: { $gte: now, $lte: fiveMinutesFromNow },
                isDeleted: { $ne: true },
                status: "scheduled"
            });

            if (upcomingShowtimes.length > 0) {
                await Showtime.updateMany(
                    {
                        _id: { $in: upcomingShowtimes.map(show => show._id) }
                    },
                    {
                        $set: { status: "ongoing" }
                    }
                );

                console.log(`✅ Updated ${upcomingShowtimes.length} showtimes to 'ongoing' status`);
            }
        }catch (error) {
            console.error("Showtime status update cronjob ongoing error: ", error);
        }
    })

    // Cron job để đánh dấu showtime đã kết thúc sau 10p
    cron.schedule("*/10 * * * *", async () => {
        try{
            const now = new Date();

            await Showtime.updateMany(
                {
                    endTime: { $lt: now },
                    isDeleted: false,
                    status: { $ne: "finished" }
                },
                {
                    $set: { status: "finished" }
                }
            );
            console.log(`Updated ${now} showtimes to 'ongoing' status`);
        }catch (error) {
            console.error("❌ Showtime status update cronjob finished error:", error);
        }
    });

    // Cron job chạy 1 năm 1 lần
    cron.schedule("0 0 1 1 *", async () => {
        try {
            const defaultLevel = await Level.findOne({ isDefault: true, active: true });

            await User.updateMany(
                { points: { $gt: 0 } },
                { $set: { memberShipPoints: 0, totalEarnedPoints: 0, spinCount: 0, level: defaultLevel._id } }
            );

            console.log(`✅ Reset points for users`);
        } catch (error) {
            console.error("❌ Error resetting points:", error);
        }
    });
};
