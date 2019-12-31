let express = require('express');
let app = new express();
let bodyParser = require('body-parser'); //https://www.npmjs.com/package/body-parser
let md5 = require('md5-node'); //https://www.npmjs.com/package/md5-node 密码加密处理


/*******安装mongodb */
let mongodb = require('mongodb')
let MongoClient = mongodb.MongoClient; //http://mongodb.github.io/node-mongodb-native/2.2/quick-start/quick-start/
const DBURL = 'mongodb://127.0.0.1:27017/codekrist'; //数据库连接地址
let ObjectId = mongodb.ObjectID
/******************** */




/**************************************************************************************************************************** */
//  获取商品类别数据
app.get('/routes/type', (req, res) => {
    var result = {}
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('typeitem').find().toArray(function (err, typeResult) {

            result.status = 200,
                result.authors = 'codekrist',
                result.statusText = 'ok'
            result.data = typeResult
            res.send(result)
        })
    })
})
// 获取商品列表
app.get('/routes/product', function (req, res) {
    var result = {}

    let typeid = ''
    let query = {}

    if (req.query.typeid) {
        typeid = req.query.typeid
        query = {
            typeid: ObjectId(typeid)
        }
    }

    //let query = { typeid:ObjectId(typeid) }

    MongoClient.connect(DBURL, function (err, db) {

        //根据typeid
        db.collection('productitem').find(query).toArray(function (err, productResult) {
            //console.log(productRest)
            result.status = 200,
                result.authors = 'codekrist',
                result.statusText = 'ok'
            result.data = productResult
            res.send(result)
        })
    })
    //res.send('获取商品')
})
//获取轮播图数据
app.get('/routes/carousel', (req, res) => {
    var result = {}
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('carouselitem').find().toArray(function (err, carouselResult) {

            result.status = 200,
                result.authors = 'codekrist',
                result.statusText = 'ok'
            result.data = carouselResult
            res.send(result)
        })
    })
})
//获取商品推荐数据
app.get('/routes/recommend', (req, res) => {
    var result = {}
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('recommenditem').find().toArray(function (err, recommendResult) {

            result.status = 200,
                result.authors = 'codekrist',
                result.statusText = 'ok'
            result.data = recommendResult
            res.send(result)
        })
    })
})
//获取猜你喜欢商品数据
app.get('/routes/guess', (req, res) => {
    var result = {}
    MongoClient.connect(DBURL, function (err, db) {
        db.collection('guessitem').find().toArray(function (err, guessResult) {

            result.status = 200,
                result.authors = 'codekrist',
                result.statusText = 'ok'
            result.data = guessResult
            res.send(result)
        })
    })
})
/**************************************************************************************************************** */



/******保存用户信息*********** */
let session = require('express-session') //https://www.npmjs.com/package/express-session
/**ejs模板 */
app.set('view engine', 'ejs');
/**配置静态 */
app.use(express.static('./public'));
/**开发图片静态服务 */
app.use('/upload', express.static('./upload'))

/***获取post提交数据 / 设置body-parser中间件 */
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());
/***配置session中间件  */
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // 过期事件 30分钟
        maxAge: 1000 * 60 * 30
    },
    rolling: true
}));
//定义中间件判断登录状态
app.use(function (req, res, next) {
    // console.log(req.url)
    if (req.url == '/login' || req.url == '/doLogin') {
        next()
    } else {
        if (session.userinfo && session.userinfo.username != '') {
            app.locals['userinfo'] = session.userinfo //配置全局变量
            next()
        } else {
            res.redirect('/login')
        }
    }

})
/**************************** */



/***登录start**************** */
app.get('/login', function (req, res) {
    // res.send('登录')
    res.render('login')
})
/**获取提交的数据 */
app.post('/doLogin', function (req, res) {
    // console.log(req.body) // 控制台接收数据[Object: null prototype] { username: 'admin', password: '123' }
    var username = req.body.username;
    var password = md5(req.body.password)
    /**
     * 1-获取数据
     * 2- 连接数据库 查询数据
     * 2- 安装mongodb
     */
    MongoClient.connect(DBURL, function (err, db) {
        if (err) {
            console.log(err)
            return
        } else {
            // 查询数据
            db.collection('code').find({
                username: username,
                password: password
            }).toArray(function (err, data) {

                // console.log(data) //  获取到数据 _id: 5de9f75ad99713ddace17738,username: 'admin',  password: '123',   status: '200'
                //判断登录用户名密码和账号是否一致
                if (data.length > 0) {
                    // console.log('登录成功')

                    //保存用户信息
                    session.userinfo = data[0]
                    //跳转到首页
                    res.redirect('/type/home')
                } else {
                    // console.log('登录失败')
                    res.send("<script>alert('登录失败');location.href='/login'</script>")
                }

                db.close();
            })
        }
    })
    // 遍历方法
    // MongoClient.connect(DBURL, function (err, db) {
    //     if (err) {
    //         //如果失败  数据库连接失败
    //         console.log(err)
    //         return
    //     }
    //     // 数据库查询成功 
    //     var result = db.collection('code').find();
    //     var list = [];
    //     result.each(function (error, doc) {
    //         if (error) {
    //             console.log(error)
    //         } else {
    //             if (doc != null) {
    //                 list.push(doc)
    //             } else {
    //                 console.log(list,'11111111111')
    //                 db.close()
    //             }
    //         }
    //     })
    // })

})
app.get('/loginOut', function (req, res) {
    /**
     * 1- x=销毁session
     * 
     */
    req.session.destroy(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect('/login')
        }
    })
})
/****登录end******************* */
app.get('/', function (req, res) {
    res.render('login')
})
/***登陆后跳转到home页  */
app.get('/type/home', function (req, res) {
    res.render('type/home')
})
/******************************* */








/********************************************************* */
let typeRouter = require('./routes/type.js')
let productRouter = require('./routes/product.js')
let carouselRouter = require('./routes/carousel.js')
let recommendRouter = require('./routes/recommend.js')
let guessRouter = require('./routes/guess.js')
/*********************************************************** */
app.use(typeRouter) //分类
app.use(productRouter) //商品
app.use(carouselRouter) //轮播图
app.use(recommendRouter) //商品推荐
app.use(guessRouter) //猜你喜欢

/*********************************************************** */




app.listen(3000, function (req, res) {
    console.log('http://localhost:3000/')
})