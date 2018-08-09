/**
 * Created by 眭剛 on 2018/8/7.
 */
var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var Goods = require("../models/goods");

//连接mongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/goodsList', { useNewUrlParser: true });

mongoose.connection.on('connected',function(){
    console.log("MongoDB connected success.")
});

mongoose.connection.on('error',function(){
    console.log("MongoDB connected fail.")
});

mongoose.connection.on('disconnected',function(){
    console.log("MongoDB connected disconnected.")
});

router.get("/",function(req,res,next){
    let page = parseInt(req.query.page);
    let pageSize = parseInt(req.query.pageSize);
    let sorts = parseInt(req.query.sort);
    let priceStart = req.query.priceStart;
    let priceEnd = req.query.priceEnd;
    let params = {};
    if(priceStart != '' && priceStart != null){
        params = {
            salePrice:{
                $gt:parseInt(priceStart),
                $lte:parseInt(priceEnd)
            }
        }
    };
    //分页
    let skip = (page-1)*pageSize;

    let goodsModel =  Goods.find(params).skip(skip).limit(pageSize);
    //sort排序
    goodsModel.sort({"salePrice":sorts});

    goodsModel.exec(function(err,doc){
        if(err){
            res.json({
                status:"1",
                msg:err.message
            })
        }else{
            res.json({
                status:'0',
                msg:'',
                result:{
                    count:doc.length,
                    list:doc
                }
            })
        }
    })
});


module.exports = router;