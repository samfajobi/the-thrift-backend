
import mongoose from "mongoose"
const PaymentSchema = new mongoose.Schema(
    {
        reference: {
            type: String,
            required: true,
        },
        artisan: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Artisan"
        },
        cycle: {
            type: Number,
            default: 6,
        },
        amount: {
            type: Number,
            default: 0,
        },
        datePaid: {
            type: Number,
            default: 0
        },
        endDate: {
            type: Number,
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

export = mongoose.model("payment", PaymentSchema);
