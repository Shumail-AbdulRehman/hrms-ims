import mongoose, { Schema } from "mongoose";

const CounterSchema = new Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

export const getNextSequence = async (prefix) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: prefix },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

export default Counter;
