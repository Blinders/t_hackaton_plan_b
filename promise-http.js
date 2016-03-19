var http = require('http');

/** http request를 promise로 사용하기 위한 함수 */
exports.request = function(args){
  console.log("IN_01");
  args = args || {};
  return new Promise(function(resolve, reject){
	  console.log("IN_02");
    var req = http.request(args.options,function(res){
    	console.log("IN_03");
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        resolve({
          statusCode : res.statusCode,
          headers : res.headers,
          data: chunk,
          requestArgs : args
        });
      });
      console.log("04 : " + res.statusCode);
      console.log("05 : " + res.headers);
      if(res.statusCode!==200 && res.statusCode!==201 && res.statusCode!==409){
        reject({ 
          statusCode : res.statusCode,
          error: 'statusCode is '+res.statusCode,
          options: args.options,
          responseHeader : res.headers
        });
      }
      console.log("IN_05");
    });
    console.log("IN_06");
    req.on('error',function(e){
      reject({
        error: e, 
        options: args.options
      });
    });
    console.log("IN_07");
    if(args.body){
    	 console.log("IN_08" + typeof args.body);
      if(typeof args.body == 'string'){
        req.write(args.body);
      }else{
        req.write(JSON.stringify(args.body));
      }
    }
    console.log("IN_08");
    req.end();
  });
}
