const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' }],
    total: { type: Number, required: true }
});

module.exports = mongoose.model('Order', orderSchema);
