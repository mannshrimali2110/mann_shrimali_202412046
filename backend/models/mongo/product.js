const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        sku: {
            type: String,
            required: [true, 'SKU is required'],
            unique: true,
            index: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            index: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);


module.exports = mongoose.model('Product', productSchema);
