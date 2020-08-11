const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: { // token 유효기간 
        type: Number
    }
})

userSchema.pre('save', function(next){ //save하기 전에 수행할 func
    var user = this;
    
    if(user.isModified('password')){ //db의 password가 변경될 때만 암호화
        //비밀번호 암호화
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)

            // Store hash in your password DB, 첫번째 arg가 암호화 되기 전 비밀번호
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else{
        next();
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb) {
    //plainPassword 1234567, DB에 있는 암호화된 비밀번호를 비교하려면 plainPassword를 암호화
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);

        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb) {
    var user = this;
    //jsonwebtoken을 이용해서 token 생성
    //user._id + secretToken = token, secretToken -> user._id
    var token = jwt.sign(user._id.toHexString(), 'secretToken')
    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }