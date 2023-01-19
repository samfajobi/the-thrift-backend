import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import Admin from './admin.model'

const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
    user_type: { type: String, default: "super_admin" },
    image: { type: String },
    email: { type: String },
    password: { type: String },
    mobile: { type: String, },
    address: { type: String, },
    location: { type: Array },
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: Admin }],
}, {
    versionKey: false,
    timestamps: true
});

superAdminSchema.plugin(mongoosePaginate);
export = mongoose.model("superadmin", superAdminSchema);




