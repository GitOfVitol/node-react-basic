const express = require('express') //다운받은 express 모듈 가져옴
const app = express() //새로운 express app을 만듦 
const port = 5000 //아무값이나 가능 
const bodyParser = require('body-parser'); //설치한 body-parser가져오기
const cookieParser = require('cookie-parser');

const config = require('./config/key');

const { User } = require("./models/User"); //생성한 user db가져오기

app.use(bodyParser.urlencoded({extended: true})); //application/x-www-form-urlencoded
app.use(bodyParser.json()); //application/json
// 각각의 형태에 해당하는 정보(data)를 분석해서 가져올 수 있게 해주기 위해

app.use(cookieParser());

const mongoose = require('mongoose') //mongoDB 쉽게 사용가능한 Object modeling tool
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected!'))
.catch(err => console.log(err)) //mongoDB연결, {}는 에러방지용 코드

app.get('/', (req, res) => {
  res.send('Hello World! Nice to meet you!')
}) //root directory에 오면 hello world 출력

app.post('/register', (req, res)=>{
  const user = new User(req.body) //req.body에는 body-parser 덕분에 db정보가 들어있음
  
  user.save((err, userInfo) => {//mongoDB method
    if(err) return res.json({success: false, err})//error처리
    return res.status(200).json({
      success: true
    })//성공했을 때
  })
}) //회원 가입 시 필요한 정보들을 client에서 가져와 DB에 넣어줌.

app.post('/login', (req, res) => {
  //요청된 이메일을 db에서 찾음, mongoDB method
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

  //요청한 이메일이 db에 있다면 비밀번호가 같은지 확인
  user.comparePassword(req.body.password, (err, isMatch) => {
    if(!isMatch){
      return res.json({loginSuccess: false, message: "비밀번호가 틀렸습니다."})
    }

    //user를 위한 token 생성 
    user.generateToken((err, user) => {
      if(err) return res.status(400).send(err);

      //token을 저장함, cookie, local등 다 가능함. 여기서는 cookie에 저장
      res.cookie("x_auth", user.token) 
        .status(200)
        .json({loginSuccess: true, userId: user._id})
    })
  })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
}) //해당 port에서 app 실행 