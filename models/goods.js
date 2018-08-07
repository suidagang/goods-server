/**
 * Created by 眭剛 on 2018/8/7.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var productSchema = new Schema({
    "productId":String,
    "productName":String,
    "salePrice":Number,
    "productImage":String,
});

module.exports = mongoose.model("Good",productSchema);