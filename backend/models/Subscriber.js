const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    subscribeAt: {
        type: Date,
        deffault: Date.now,
    },
});

module.exports = mongoose.model("Subscriber", subscriberSchema);