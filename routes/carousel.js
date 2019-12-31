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


/*************************************** */

// 增加轮播图ok
router.get('/carousel/add', function (req, res) {
    res.render('carousel/add')
})
router.post('/carousel/add', function (req, res) {
    var form = new multiparty.Form({
        uploadDir: 'upload'
    });

    form.parse(req, function (err, fields, files) {
        // console.log(fields, files)
        let typename = fields.typename;
        let picname = files.picname[0].path.split('\\')[1]
        // console.log(typename, picname) //[ '小米' ] upload\DkVV5VLj396-8gmmfgqvxCYW.png 
        let result = {
            typename,
            picname
        } //将result放入数据库 -- 声明数据库地址
        MongoClient.connect(DBURL, function (err, db) {
            db.collection('carouselitem').insertOne(result, function (err, result) {
                console.log(res)
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
//渲染轮播图
router.get('/carousel/index', function (req, res) {
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('carouselitem').find().toArray(function (err, carouselResult) {
            // console.log(carouselResult)
            res.render('carousel/index', {
                carouselResult
            })
        })
    })
})
// 编辑轮播图
router.get('/carousel/edit', function (req, res) {
    let _id = ObjectId(req.query._id)
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('carouselitem').findOne({
            _id
        }, function (err, result) {
            // console.log(result,111222)
            res.render('carousel/edit', result)
        })
    })
})
router.post('/carousel/edit', function (req, res) {
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

        let typename = fields.typename[0] //获取的是类别名
        let _id = ObjectId(fields._id[0])

        // console.log( fields,1122 )
        // console.log(files,'222222')
        // res.send('ok')
        // return;

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
            typename,
            picname
        }

        MongoClient.connect(DBURL, function (err, db) {
            db.collection('carouselitem').update({
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
//删除轮播图
router.get('/carousel/delete', function (req, res) {
    let {
        _id,
        picname
    } = req.query
    _id = ObjectId(_id)
    let filename = path.resolve('upload', picname) //要删除的文件
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('carouselitem').deleteOne({
            _id
        }, function (err, result) {
            if (err) {
                // 无论成功失败都要返回页面
                res.send('<script type=\"text/javascript\">alert(\'删除轮播图失败\');history.back()</script>')
            } else {
                res.send('<script type=\"text/javascript\">alert(\'删除轮播图成功\');history.back()</script>')
                fs.unlinkSync(filename)
            }
        })
    })
    // res.send(req.query)
})

/*************************************** */



module.exports = router