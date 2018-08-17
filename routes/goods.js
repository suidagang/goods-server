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
//查询商品数据列表
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
//加入到购物车
router.post("/addCart",function(req,res,next){
    var userId = '100000077',productId = req.body.productId;
    var User = require('../models/user');

    //findOne只查找一条数据
    User.findOne({"userId":userId}, function (err,userDoc) {
        if(err){
            res.json({
                status:"1",
                msg:err.message
            })
        }else{
            //如果有数据
            if(userDoc){
                //用来判断原来购物车是否有新加的商品，如果有数量+1
                let goodsItem = "";
                userDoc.cartList.forEach(function(item){
                    if(item.productId == productId){
                        goodsItem = item;
                        console.log(item.productNum);
                        item.productNum++;
                    }
                });
                //如果有新加的商品
                if(goodsItem){
                    //直接保存数据
                    userDoc.save(function (err1,doc1) {
                        if(err1){
                            res.json({
                                status:"1",
                                msg:err1.message
                            })
                        }else{
                            res.json({
                                status:"0",
                                msg:'',
                                result:'success'
                            })
                        }
                    })
                //如果没有新加的商品
                }else{
                    Goods.findOne({"productId":productId}, function (err,doc) {
                        if(err){
                            res.json({
                                status:"1",
                                msg:err.message
                            })
                        }else{
                            //如果查到商品列表有商品,保存到user.cartList数据中
                            if(doc){
                                userDoc.cartList.push({
                                    "productId":doc.productId,
                                    "productName":doc.productName,
                                    "salePrice":doc.salePrice,
                                    "productImage":doc.productImage,
                                    "checked":'1',
                                    "productNum":'1'
                                });
                                userDoc.save(function (err1,doc1) {
                                    if(err1){
                                        res.json({
                                            status:"1",
                                            msg:err1.message
                                        })
                                    }else{
                                        res.json({
                                            status:"0",
                                            msg:'',
                                            result:'success'
                                        })
                                    }
                                })
                            }else{
                                res.json({
                                    status:"1",
                                    msg:'没有此商品',
                                    result:'error'
                                })
                            }
                        }
                    })
                }
            }else{
                res.json({
                    status:"0",
                    msg:'',
                    result:[]
                })
            }
        }
    });
})


module.exports = router;