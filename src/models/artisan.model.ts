import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import Payment from './payment.model'
import Thrifts from './thrifts.model'


const Schema = mongoose.Schema;
const artisanSchema = new Schema({
    full_name: { type: String },
    gender: { type: String },
    artisan_id: { type: String },
    user_type: { type: String, default: "artisan" },
    image: { type: String, default: '' },
    identification: {
        type: Object,
        default: {
            type: '',
            identifications: []
        }
    },
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    mobile: { type: String, },
    date_of_birth: { type: Date },
    address: { type: String, },
    city: { type: String },
    state: { type: String },
    // agent_id: { type: mongoose.Schema.Types.ObjectId, ref: Payment },
    agent_id: { type: String },
    payment: [{ type: mongoose.Schema.Types.ObjectId, ref: Payment }],
    thrifts: [{ type: mongoose.Schema.Types.ObjectId, ref: Thrifts }],
    approved: { type: Boolean, default: true },
}, {
    versionKey: false,
    timestamps: true
});

artisanSchema.plugin(mongoosePaginate);
export = mongoose.model("artisans", artisanSchema);

