var express = require('express');
var router = express.Router();
var User = require("../models/user");

//登录
router.post('/login', function(req, res, next) {
    var userName = req.body.userName,userPwd = req.body.userPwd;
    User.findOne({"userName":userName,"userPwd":userPwd},function(err,doc){
        if(err){
            res.json({
                status:"1",
                msg:err.message,
                result:''
            })
        }else{
            if(doc){
                res.cookie("userId",doc.userId,{
                    path:'/',
                    maxAge:1000*60*60
                });
                res.cookie("userName",doc.userName,{
                    path:'/',
                    maxAge:1000*60*60
                });
                res.json({
                    status:'0',
                    msg:'',
                    result:{
                        userName:doc.userName
                    }
                });
            }else{
                res.json({
                    status:"1001",
                    msg:'账号密码错误',
                    result:''
                })
            }

        }
    })
});

//登出
router.get("/logout",function(req,res,next){
    res.cookie("userId","",{
        path:"/",
        maxAge:-1
    });
    res.cookie("userName","",{
        path:'/',
        maxAge:-1
    });
    res.json({
        status:"0",
        msg:'',
        result:''
    })
});
//检查是否登录
router.get("/checkLogin", function (req,res,next) {
    if(req.cookies.userId){
        res.json({
            status:'0',
            msg:'',
            result:req.cookies.userName || ''
        });
    }else{
        res.json({
            status:'1',
            msg:'未登录',
            result:''
        });
    }
});

//查询当前用户的购物车数据
router.get("/cartList", function (req,res,next) {
    var userId = req.cookies.userId;
    User.findOne({userId:userId}, function (err,doc) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            if(doc){
                res.json({
                    status:'0',
                    msg:'',
                    result:doc.cartList
                });
            }
        }
    });
});

//修改商品数量
router.post("/editCart", function (req,res,next) {
    var userId = req.cookies.userId,
        productId = req.body.productId,
        productNum = req.body.productNum,
        checked = req.body.checked;
    User.update({"userId":userId,"cartList.productId":productId},{
        "cartList.$.productNum":productNum,
        "cartList.$.checked":checked
    }, function (err,doc) {
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:'success'
            });
        }
    })

});

//删除购物车某条数据
router.post("/delCart",function(req,res,next){
    var userId = req.cookies.userId,
        productId = req.body.productId;
    User.update({"userId":userId},{
        $pull:{
            "cartList":{
                "productId":productId
            }
        }
    },function(err,doc){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            res.json({
                status:'0',
                msg:'',
                result:'success'
            });
        }
    })

});

//全选功能
router.post("/checkAll",function(req,res,next){
    var userId = req.cookies.userId,
        checkAll = req.body.checkAll;
    User.findOne({"userId":userId},function(err,user){
        if(err){
            res.json({
                status:'1',
                msg:err.message,
                result:''
            });
        }else{
            if(user){
                user.cartList.forEach((item)=>{
                    item.checked = checkAll;
                });
                user.save(function(err1,doc){
                    if(err1){
                        res.json({
                            status:'1',
                            msg:err1.message,
                            result:''
                        });
                    }else{
                        res.json({
                            status:'0',
                            msg:'',
                            result:'success'
                        });
                    }
                })
            }else{
                console.log("错误")
            }
        }
    })
})


module.exports = router;
