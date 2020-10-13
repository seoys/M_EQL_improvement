const express = require('express')
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const logger = require('morgan');
const router = express.Router();
// router 설정
const indexRouter = require('./router/index');


const app = express()
const port = 7002

// 화면 engine을 ejs로 설정
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.urlencoded({ extended: false }));
// 기본 path를 /resources으로 설정(css, javascript 등의 파일 사용을 위해)
// app.use(express.static(__dirname + '/resources'));
// app.use(express.static('resources'));
app.use('/resources', express.static('resources'));

// view 경로 설정
app.set('views', __dirname + '/html');

 
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use('/', indexRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))