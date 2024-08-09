const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    id: { type: String, required: true },
    gender: { type: String, required: true },
    shiftStatus: { type: String, required: true }
});

module.exports = mongoose.model('Employee', employeeSchema);
