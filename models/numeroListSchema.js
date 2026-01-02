import mongoose from "mongoose";

const numeroListSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        url: String,
        public_id: String
    },

    price: {
        type: Number,
        required: true
    }
},{timestamps: true})

const NumeroList = mongoose.model('NumeroList', numeroListSchema)
export default NumeroList;

