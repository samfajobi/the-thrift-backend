import mongoose from "mongoose"
import mongoosePaginate from 'mongoose-paginate-v2';
import Artisan from './artisan.model'
import Thrift from './thrifts.model'

const collectionSchema = new mongoose.Schema(
    {
        payment_reference: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        agent_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Agent"
        },
        artisans: [{ type: mongoose.Schema.Types.ObjectId, ref: Artisan }],
        thrifts: [{ type: mongoose.Schema.Types.ObjectId, ref: Thrift }],
        total: {
            type: Number,
            default: 0,
        },
        datePaid: {
            type: Date,
            default: 0
        },
        status: {
            type: Number,
            default: 0,
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);


collectionSchema.plugin(mongoosePaginate);
const collectionModel = mongoose.model("collection", collectionSchema);
export = collectionModel
