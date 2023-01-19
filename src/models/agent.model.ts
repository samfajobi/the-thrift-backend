import mongoose, { model } from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import Artisan from './artisan.model'
import Collection from './collection.model'
import Admin from './admin.model'
import Payment from './payment.model'

const Schema = mongoose.Schema;

const agentSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    mobile: { type: String },
    gender: { type: String },
    nin: { type: String },
    state: { type: String },
    localgovt: { type: String },
    address: { type: String, },
    designated_govt: { type: String},
    location: { type: Array },
    user_type: { type: String, default: "agent" },
    review_date: { type: Date },
    amount: { type: Number, default: 0 },
    image: { type: String },
    email: { type: String },
    assigned_id: { type: String },
    password: { type: String, default: 'Agent@trovest123' },
    // date_of_birth: { type: Date },
    // username: { type: String },
    admin_id: { type: mongoose.Schema.Types.ObjectId, ref: Admin },
    artisans: [{ type: mongoose.Schema.Types.ObjectId, ref: Artisan }],
    payment: [{ type: mongoose.Schema.Types.ObjectId, ref: Payment }],
    collections: [{ type: mongoose.Schema.Types.ObjectId, ref: Collection }],
    approved: { type: Boolean, default: true },

}, {
    versionKey: false,
    timestamps: true
});


const AgentModel = model('Agents', agentSchema);
export = AgentModel