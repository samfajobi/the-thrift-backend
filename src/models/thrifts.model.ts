import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';


const Schema = mongoose.Schema;
const thriftSchema = new Schema({
    date_paid: { type: Date },
    amount: { type: Number, default: 0 },
    status: { type: String, default: "paid" },
    artisan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Artisan' },
}, {
    versionKey: false,
    timestamps: true
});


thriftSchema.plugin(mongoosePaginate);
export = mongoose.model("thrift", thriftSchema);

