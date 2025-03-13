const mongoose = require('mongoose');
// eslint-disable-next-line import/newline-after-import
const validator = require('validator');
// eslint-disable-next-line import/no-extraneous-dependencies
const bcrypt = require('bcryptjs');

const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A User must have a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'A User must have an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default: 'default.jpg' 
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [
            function () {
                return this.authProvider !== "google";
            }, "Mật khẩu là bắt buộc khi đăng ký bằng email"],
        minlength: 8,
        select: false
    },
    passwordConfirmation: {
        type: String,
        required: [function () {
            return this.authProvider !== "google";
          }, "Xác nhận mật khẩu là bắt buộc khi đăng ký bằng email"],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords do not match'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
    googleId: String,
    authProvider: {
        type: String,
        enum: ["local", "google"],
        required: true,
        default: "local"
      },
});

// document middleware
// save chỉ có tác dụng với .save hay .create
userSchema.pre('save', async function(next){
    //Dùng để check mật khẩu có thay đổi hay kh nếu không thay đổi thì next()
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hashSync(this.password, 12);
    
    this.passwordConfirmation = undefined;
    next();
})

userSchema.pre('save', function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function(next){
    this.find({ isActive: {$ne: false} })
    next();
});

userSchema.methods.correctPassword = async function(cadidatePassword, userPassword) {
    return await bcrypt.compare(cadidatePassword, userPassword);
}

userSchema.methods.changePasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changePasswordAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        
        return JWTTimestamp < changePasswordAtTimestamp;
    }
    return false;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;


//.save sẽ có 2 trường hợp 
// 1. Nếu user mới, thì mặc định mongoose sẽ tự động check validation tất cả 
// 2. Nếu user đã tồn tại, thì mongoose sẽ tự động update các trường đã đ��nh ngh��a trước đó

//Khi custom validator thì  dùng function với từ khóa this, nó sẽ chạy mỗi khi .save() được gọi, bất kể field nào bị modified.