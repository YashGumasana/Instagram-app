import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25
    },
    username: {
        type: String,
        required: true,
        trim: true,
        maxlength: 25,
        unique: [true, 'This user name already exists']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: [true, 'This email already exists']
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/dkqimhvk8/image/upload/v1658938380/cld-sample-2.jpg'
    },
    role: {
        type: String,
        default: 'user'
    },
    gender: {
        type: String,
        default: 'male'
    },
    mobile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    story: {
        type: String,
        default: '',
        maxlength: 200
    },
    website:
    {
        type: String,
        default: ''
    },
    followers:
        [{
            type: mongoose.Types.ObjectId,
            ref: 'user'
        }],
    following:
        [{
            type: mongoose.Types.ObjectId,
            ref: 'user'
        }],
    saved:
        [{
            type: mongoose.Types.ObjectId,
            ref: 'user'
        }]
}, {
    timestamps: true
});

// let count = 0;

// userSchema.pre('save', async function (next) {
//     // console.log('***');
//     if (!this.isModified('password')) return;
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     // console.log(this.password);
//     count++;
//     // console.log(count);
//     next();
// });


// userSchema.methods.comparePassword = async function (candidatepassword) {
//     // console.log('+++');
//     // console.log(this.password);
//     const isMatch = await bcrypt.compare(candidatepassword, this.password);
//     // console.log(isMatch);
//     return isMatch;
// }

export default mongoose.model('user', userSchema);