import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import SuperAdmin from './superadmin.model'

const Schema = mongoose.Schema;
const adminSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    user_type: { type: String, default: "admin" },
    image: { type: String },
    email: { type: String },
    password: { type: String },
    mobile: { type: String, },
    address: { type: String, },
    location: { type: Array },
    superAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
    agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agents' }],

}, {
    versionKey: false,
    timestamps: true
});

adminSchema.plugin(mongoosePaginate);
export = mongoose.model("admin", adminSchema);




