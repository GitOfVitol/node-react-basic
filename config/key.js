if(process.env.NODE_ENV === 'production'){ //환경변수가 local, deploy에서 각각 development, production이라고 나옴
    module.exports = require('./prod');
}else{
    module.exports = require('./dev');
}