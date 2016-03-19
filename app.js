
/**
 * Module dependencies.
 */
'use strict';

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , test = require('./routes/test')
  , http = require('http')
  , path = require('path')
  , parseString = require('xml2js').parseString
  , httpReq = require('./promise-http').request
  , optionData = require('./config');

var ultrasonic = require("jsupm_groveultrasonic");
var sensor = new ultrasonic.GroveUltraSonic(2);
var LCD = require('jsupm_i2clcd');
var myLcd = new LCD.Jhd1313m1(0,0x3E, 0x62);
var sensorModule = require('jsupm_ttp223');
var distance = 0;
var touch = new sensorModule.TTP223(3);
myLcd.setColor(238,135,160);

var app = express();

var myInterval = setInterval(function(){
  var travelTime = sensor.getDistance();
  if (travelTime > 0) {
    myLcd.clear();
    distance = (travelTime / 29 / 2).toFixed(3);
    console.log("distance: " + distance + " [cm]");
    myLcd.setCursor(1,2);
    if( distance > 12 ){
      myLcd.setColor( 213, 0, 0 );
      myLcd.setCursor(0,0);
      myLcd.write("Soonsu")
      myLcd.setCursor(1,9);
      myLcd.write("Recharge");
    } else if ( distance < 8 ) {
      myLcd.setColor( 67, 160, 71 );
      myLcd.setCursor(0,0);
      myLcd.write("Soonsu");
      myLcd.setCursor(1,9);
      myLcd.write("Enough");
    } else {
      myLcd.setColor( 251, 140, 0 );
      myLcd.setCursor(0,0);
      myLcd.write("Soonsu");
      myLcd.setCursor(1,9);
      myLcd.write("Fine");
    }
  }
}, 1000);

// When exiting: clear interval and print message
process.on('SIGINT', function()
{
  clearInterval(myInterval);
  console.log("Exiting...");
  process.exit(0);
});

function readSensorValue(){
  if( touch.isPressed() ) {
    console.log(touch.name() + " is pressed");
  }
  else {
    console.log(touch.name() + " is not pressed");
  }
}
setInterval(readSensorValue,1000);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

function randomInt (low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
}

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { title: distance });
});

app.get('/users', user.list);
app.get('/test', function(req, res) {
  res.send('hello world');
});
//app.get('/test2', test.list);

app.get('/test2', function (req, res) {
	console.log('/');
	httpReq({
	  options: {
	    host : 'sandbox.sktiot.com',
	    port: '9000',
	    path : '/ThingPlug/remoteCSE-'+ optionData.node_ID+ '/container-'+optionData.container_name+'/latest',
	    method: 'GET',
	    headers : {
	      Accept: 'application/xml',
	      locale: 'ko',
	      uKey : optionData.uKey,
	      'X-M2M-RI': randomInt(100000, 999999),
	      'X-M2M-Origin': optionData.app_ID
	    }
	  }
	}).then(function(result){
	  console.log(colors.green('1. latest contentInstance 조회'));
	  if(result.data){
		  console.log('test2 Page3');
	    parseString(result.data,function(err, xmlObj){
				res.send("TEST Gray")
	    });
	  }else{
			res.send('oneM2M 서버에서 contentInstance를 조회하는데 실패했습니다.');
		}
	});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
