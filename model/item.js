const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const itemSchema = new Schema({
    title : String,
    empty: Number,
    madk : String,
    week : String,
    time : String,
    location : String
},{
    versionKey : false
});

const Item = mongoose.model('item',itemSchema);

module.exports = Item;