var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require("fs")

//const bluebird = require("bluebird");



app.set('views', __dirname +'/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));
// create application/json parser
var jsonParser = bodyParser.json({ type: 'application/json'});
// create application/x-www-form-urlencoded parser
//extended: false means you are parsing strings only (not parsing images/videos..etc)
var urlencodedParser = bodyParser.urlencoded({ extended: false })
// parse application/json
app.use(jsonParser);
// parse application/x-www-form-urlencoded
app.use(urlencodedParser)


app.use(session({
 secret: 'MYSECRET',
 resave: false,
 saveUninitialized: true,
 //cookie: { maxAge: 600000 }  // 10분
}));

//agruments process
console.log(process.argv);
var port_param = process.argv[2];
var client_token_param = process.argv[3];
var address_param = process.argv[4];

//var web
console.log('port_param: ' + port_param);
console.log('client_token_param: ' + client_token_param);
console.log('address_param: ' + address_param);

var router = require('./router/main')(app, fs, jsonParser, urlencodedParser,client_token_param,address_param);
// or router(app, fs, jsonParser, urlencodedParser);

port_param = 80;   // 클라우드용

var server = app.listen(port_param, function(){
    console.log("Server has started on port ", port_param);
});




/////////////   ARTIK CLOUD   ///////////////////
// import the ARTIKCloud library
var ArtikCloud = require('artikcloud-js');

// configuration file to simplify retrieving the device ID and device token
//var Config = require('./config.json');

// configure client by setting credentials.
// here we set the `accessToken` to value of `device_token`.
var artickClient = ArtikCloud.ApiClient.instance;
var artikcloud_oauth = artickClient.authentications['artikcloud_oauth'];
artikcloud_oauth.accessToken = "d6f9e529a5f642af9b484a38f0fe96bc";   // device token


// get a reference to the Messages API
var api = new ArtikCloud.MessagesApi();

// `message` will set the request body when making an api call
var message = new ArtikCloud.Message();



/**
* Callback function after making API call
*
* @param error - error object
* @param data - response data from server
* @param response - header response data
*
* Example Response:
*
* { "data": { "mid": "a9b4982c708540cd9742adddef902c15"  }}
*
*/

var callback = function(error, data, response) {

  if (error) {
    console.error(error);
  } else {
    console.log('< API Response:');
    console.log(JSON.stringify(data, null, 2));
  }
}


//////   for ARTIK Cloud  value  ///////////////
var mqttmsgTemp = "no_value";
var getMQTTmsg = function () {
	return mqttmsgTemp;
}
////////////////   the end of ARTIK cloud value  //////

// set the field:value to send to the device
var sensor = {
	"text": getMQTTmsg()
};


// message['data'] = sensor;
// message['sdid'] = "56dd06ed63984a2eb3e7905cdf4c8cf7";    // device id
//
// console.log("> Making API call with data: " + JSON.stringify(message));
// //make api call
// api.sendMessage(message, callback);
//

///////////////   mqtt connection with broker /////////////
var mqtt = require('mqtt')
var clientmqtt  = mqtt.connect('mqtt://220.230.115.127')
//var clientmqtt  = mqtt.connect('mqtt://192.168.20.94')
var CUBRIDforDoor = require('node-cubrid');
const conCubridForDoor = CUBRIDforDoor.createCUBRIDConnection('1.255.54.209', 33000, 'dba', '', 'demodb');

clientmqtt.on('connect', function () {
  clientmqtt.subscribe('dooropen')
  clientmqtt.publish('dooropen', 'Hello mqtt from Blockchain Server')
})

clientmqtt.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString())
  if(message.toString() == '1') {
//    client.publish('dooropen', '2')
    checkDoorReservation();

    //
    // //  client.end()
    //   mqttmsgTemp  = message.toString();     ///////   for ARTIK Cloud  value  ///////////////
    // //  getMQTTmsg(message.toString());
    //
    //   message['data'] = sensor;
    //   message['sdid'] = "56dd06ed63984a2eb3e7905cdf4c8cf7";    // device id
    //
    //   console.log("> Making API call with data: " + JSON.stringify(message));
    //
    //
    //   //make api call
    //   api.sendMessage(message, callback);
  }
})




function checkDoorReservation(){

  const promise = conCubridForDoor.connect()
  .then(() => {
    console.log('DB connection is established');

//    var sql = 'SELECT * from device';

    var sql = 'SELECT deviceaddress as deviceAddress, useraddress AS userAddress, '
    +' CAST(bookingtime AS VARCHAR) AS bookingTime, CAST(approvaltime AS VARCHAR) AS approvalTime,'
    +' CAST(dateofenroll AS VARCHAR) AS dateOfenroll FROM userdevicerelationship WHERE bookingtime > '
    +' CAST( CONCAT(UNIX_TIMESTAMP(), '+"\'"+"000"+"\'"+' ) AS BIGINT) AND approvaltime IS NULL';



    console.log("sql ==> ", sql)
    return conCubridForDoor.queryAllAsObjects(sql);
  })
  .then(response => {
  // `result` is now an array of all row objects.
//    assert(response)
    console.log("response  ==> ", response);
    const rowsCount = response.length;

    if(rowsCount > 0){
      console.log("rowsCount() > 0  ");
      console.log("예약내역 있음");
      clientmqtt.publish('dooropen', '2')
    }else if(rowsCount == 0){
      console.log("rowsCount() == 0  ");
      console.log("no booking list");
    }
    conCubridForDoor.close();
  })
  .catch(err => {
    // Handle the error.
    console.log("err  ==> ", err);
    conCubridForDoor.close();
    throw err;
  })
}
