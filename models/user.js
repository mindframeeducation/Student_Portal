var mongoose                = require("mongoose"),
    passportLocalMongoose   = require("passport-local-mongoose"),
    mongooseRole            = require("mongoose-role");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    students: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(mongooseRole, {
    roles: ['public', 'user', 'admin'],
    accessLevels: {
        'public'    : ['public', 'user', 'admin'],
        'anon'      : ['public'],
        'user'      : ['user', 'admin'],
        'admin'     : ['admin']
    }
});

module.exports = mongoose.model("User", UserSchema);