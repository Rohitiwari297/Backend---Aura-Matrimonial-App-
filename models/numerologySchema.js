import mongoose from "mongoose";


const numerologySchema = new  mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    numeroListId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NumeroList',
        required: true
    },

    fullName: {
        type: String,
        required: true
    },

    birthPlace: {
        type: String,
        required: true
    },

    birthDate: {
        type: Date,
        required: true
    },

    birthTime: {
        type: String
    },
    paymentOf: {
        type: Number,
        required: true
    },
    paymentStatus:{
        type: Boolean,
        default: false
    },
    pdfUrl: {
        type: String,
    },


}, {timestamps: true})

//create model
const Numerology = mongoose.model('Numerology', numerologySchema);
// export model
export default Numerology;