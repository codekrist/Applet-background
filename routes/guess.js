let express = require('express')


/**创建路由对象** */
let router = express.Router()
/************************************ */
let mongodb = require('mongodb')
let MongoClient = mongodb.MongoClient; //http://mongodb.github.io/node-mongodb-native/2.2/quick-start/quick-start/
const DBURL = 'mongodb://127.0.0.1:27017/codekrist'; //数据库连接地址

/******************** */
let ObjectId = mongodb.ObjectID
let multiparty = require('multiparty');
let fs = require('fs')
let path = require('path')

/********************************************************* */
router.get('/guess/add', function (req, res) {
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('typeitem').find().toArray(function (err, guessResult) {
    
            res.render('guess/add', {
                guessResult
            })
        })
    })
})


/***post提交实现类别添加 ok*/
router.post('/guess/add', function (req, res) {

    /***
     * 1-接收用户提交过来的信息  存入数据库
     * 2- 文件 / 文字 
     * 3- 新建文件夹 放入用户提交过来的 图片 ...
     * 4- 数据库的名字我们定义为 codekrist 
     * 5- {typename:'小米',picname:'1122.jpg'}
     * 6- 使用第三方模块 multiparty
     * 7- 新的集合productitem
     */

    var form = new multiparty.Form({
        uploadDir: 'upload'
    });

    form.parse(req, function (err, fields, files) {
        // console.log(fields, files)
        let title = fields.title[0] //商品名称
        let detail = fields.detail[0] //商品详情
        let price = fields.price[0] //商品现价
        let oldprice = fields.oldprice[0] //商品原价
        let typeid = ObjectId(fields.typeid[0]) //商品类别id
        let picname = files.picname[0].path.split('\\')[1]
        // console.log(typename, picname) //[ '小米' ] upload\DkVV5VLj396-8gmmfgqvxCYW.png 
        let result = {
            title,
            detail,
            price,
            oldprice,
            picname,
            typeid
        } //将result放入数据库 -- 声明数据库地址
        MongoClient.connect(DBURL, function (err, db) {
            db.collection('guessitem').insertOne(result, function (err, result) {
                // console.log(res)
                // 对拿到的数据进行判断
                if (err) {
                    // 无论成功失败都要返回页面
                    res.send('<script type=\"text/javascript\">alert(\'添加失败\');history.back()</script>')
                } else {
                    res.send('<script type=\"text/javascript\">alert(\'添加成功\');history.back()</script>')
                }
            })
        })
    })

})
/***商品渲染****ok */
router.get('/guess/index', function (req, res) {

    MongoClient.connect(DBURL, function (err, db) {

        db.collection('guessitem').aggregate({
            $lookup: {
                from: 'typeitem',
                localField: 'typeid',
                foreignField: '_id',
                as: 'typeInfo'
            }
        }, function (err, guessResult) {
            console.log(guessResult)
            res.render('guess/index', {
                guessResult
            })
        })

    })
})
/***删除商品 ok*/
router.get('/guess/delete', function (req, res) {
    // res.send('删除')
    /**
     * 1-删除集合中的类别 (id)
     * 2-删除类别对应的图片(图片名称)
     */
    let {
        _id,
        picname
    } = req.query
    _id = ObjectId(_id)
    let filename = path.resolve('upload', picname) //要删除的文件
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('guessitem').deleteOne({
            _id
        }, function (err, result) {
            if (err) {
                // 无论成功失败都要返回页面
                res.send('<script type=\"text/javascript\">alert(\'删除失败\');history.back()</script>')
            } else {
                res.send('<script type=\"text/javascript\">alert(\'删除成功\');history.back()</script>')
                fs.unlinkSync(filename)
            }
        })
    })
    // res.send(req.query)
})
// 编辑商品ok
router.get('/guess/edit', function (req, res) {
    //res.send('编辑')

    //{ typename:'',picname:'' }
    let _id = ObjectId(req.query._id)
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('guessitem').findOne({
            _id
        }, function (err, guess) {
            //product.typeid = product.typeid.toString()
            db.collection('typeitem').find().toArray(function (err, types) {
                res.render('guess/edit', {
                    guess,
                    types
                })
            })


        })
    })

})
router.post('/guess/edit', function (req, res) {

    /*
     *
     * 参数：
     * 类别id
     * 类别名称
     * 类别图片
     *
     *
     * 无论用户修改名称和图片与否，我们都把名称和图片名称全都传给服务器
     *       {typename:'华为',picname:'xxxx.jpg'}
     * */

    var form = new multiparty.Form({
        uploadDir: './upload'
    });

    form.parse(req, function (err, fields, files) {

        let title = fields.title[0] //
        let price = fields.price[0] //
        let detail = fields.detail[0] //
        let typeid = ObjectId(fields.typeid[0]) //

        let _id = ObjectId(fields._id[0])


        let picname = '' //存储图片名称

        /**********判断用户是否上传图片开始*************/
        if (!files.picname[0].size) {
            picname = fields.oldpicname[0]
        } else {
            picname = files.picname[0].path.split('\\')[1]
        }
        /**********判断用户是否上传图片结束*************/
        //console.log( typename,picname,1111111111111111111111111 )
        let setResult = {
            title,
            price,
            detail,
            typeid,
            picname
        }

        MongoClient.connect(DBURL, function (err, db) {
            db.collection('guessitem').update({
                _id
            }, setResult, function (err, result) {
                //console.log(err)
                //需求：无论成功与否，都回退到添加页面
                if (err) {
                    res.send('<script type=\'text/javascript\'>alert(\'修改失败\');history.back()</script>')
                } else {
                    res.send('<script type=\'text/javascript\'>alert(\'修改成功\');history.back()</script>')
                }
            })
        })


    });


})
/********************************************************* */


module.exports = router