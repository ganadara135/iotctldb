"use strict";

// Helpers: 유틸리티 함수들
// Result2Array: DB 결과 집합(result set)을 JavaScript 배열(Array)로 변환하는 함수들
// createDefaultCUBRIDDemodbConnection(): 로컬 demodb에 대한 연결 객체를 반환하는 함수
// createCUBRIDConnection(): CUBRID에 대한 연결 객체를 반환하는 함수
// 이름이 query로 시작하는 API는 데이터 레코드를 반환하고, 이름이 execute로 시작하는 API는 레코드를 반환하지 않는다.
// 따라서 SELECT 쿼리는 query() 함수를 사용하고, INSERT/UPDATE/DELETE 쿼리는 execute() 함수를 사용하면 된다.
// http://d2.naver.com/helloworld/251396  참고
var CUBRID = require('node-cubrid');
const conCubrid = CUBRID.createCUBRIDConnection('1.255.54.209', 33000, 'dba', '', 'demodb');

const connection = {
//      port: 7206,     //rpc port
      port: 7414,     //rpc port
      host: '220.230.112.30',
//      pass: "AxNpbxmkLN4Hey4AkV4VeC964ndGQMxmfizwH9Y56znT",
//      host: '127.0.0.1',
//      pass: "973MVcjrxbwyKdCWN6mMeCKUXZGRXgAFB4g4xr3PkcME"
      user: "multichainrpc",
      pass: "GTaHwrrhy7H5D8DQH2cQgSLP7icWW1vYpfZXPb6yzXgB"
}
//curl --user multichainrpc --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getinfo", "params": [] }' -H 'content-type: text/plain;' http://220.230.112.30:7206
//curl --user multichainrpc --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "liststreampublisheritems", "params": ["BookingStream", "1NWaAocGQBBRo3WwWCj5Fyps253NHqoJRWR9Ku", false, 20] }' -H 'content-type: text/plain;' http://220.230.112.30:7206
//multichain-cli MyMultichain liststreampublisheritems BookingStream 1NWaAocGQBBRo3WwWCj5Fyps253NHqoJRWR9Ku
// multichain-cli MyMultichain -rpcconnect=220.230.112.30 -rpcport=7206 -rpcuser=multichainrpc -rpcpassword=AxNpbxmkLN4Hey4AkV4VeC964ndGQMxmfizwH9Y56znT getinfo

const assert = require('assert');
const bluebird = require("bluebird");
const multichain = bluebird.promisifyAll(require("multichain-node")(connection), {suffix: "Promise"});


module.exports = function(app, fs, jsonParser, urlencodedParser, client_token_arg ,address_param )
{


app.post('/approveBooking',function(req,res){
  var sess = req.session;
  var userAddress = req.body.userAddress;
  var deviceAddress = req.body.deviceAddress;
  var userPrivkey = req.body.userPrivkey;   // 관리자 비밀키
  var bookingTime = new Number(req.body.bookingTime);
  var result = {};

  console.log("req.body  approveBooking ()   : ", req.body);

  // 1. 보내준 값 유효범위 체크
  // 2. 해당 예약내역 있는지 체크
  // 3. BookingApproval.json  및 블록체인에 기록

  // 1. 보내준 값 유효범위 체크
  if(!req.body.userAddress || !req.body.userAddress){
      result["success"] = 0;
      result["error"] = "invalid request";
      res.json(result);
      return;
  }

  // 2. 해당 예약내역 있는지 체크
  fs.readFile( __dirname + "/../data/relationship.json", 'utf8',  function(err, data){
    var relationshipOf = JSON.parse(data);
//    var y;
    var countRelationship = Object.keys(relationshipOf).length;

    if(err){
       throw err;
    }


    // y 111111111 ========>   14Ghx441QqgHrUErWicep7wLbf9NB12MRrjQgt      1Y5bxWUZzYe4dfVcaJmsN26EDy96vq6geNKiwV1504438200000
    // bookingApproval  ==>  { '14Ghx441QqgHrUErWicep7wLbf9NB12MRrjQgt     1U9q1ZggsFASYccLzPm67mJNP89E72UR3ruTqy1504438200000':
    //    { deviceAddress: '1U9q1ZggsFASYccLzPm67mJNP89E72UR3ruTqy',
    //      userAddress: '14Ghx441QqgHrUErWicep7wLbf9NB12MRrjQgt',
    //      enrolledDate: 1504431051540,
    //      bookingTime: 1504438200000,
    //      approvalTime: 1504432191565 } }
    //  y 2222222222 ========>   14Ghx441QqgHrUErWicep7wLbf9NB12MRrjQgt    1U9q1ZggsFASYccLzPm67mJNP89E72UR3ruTqy1504438200000


//    console( "relationshipOf.length   :    ",
    for(const y in relationshipOf){
//      countRelationship--;
      if(relationshipOf[y].bookingTime > Date.now() && relationshipOf[y].userAddress == userAddress
            && relationshipOf[y].deviceAddress == deviceAddress){
// console.log("deviceAddress  : ", deviceAddress);
// console.log("relationshipOf[y].deviceAddress  ==> ", relationshipOf[y].deviceAddress);
// console.log("relationshipOf[y]  ==> ", relationshipOf[y]);
// console.log(" y 111111111 ========>  ", y)
          fs.readFile( __dirname + "/../data/approveBooking.json", 'utf8',  function(err, data){
            var bookingApproval = JSON.parse(data);
            // console.log("bookingApproval  ==> ", bookingApproval);
            // console.log(" y 2222222222 ========>  ", y)
            bookingApproval[y] = {};
            // console.log(" bookingApproval[y]  1111 ========>  ", bookingApproval[y])
            bookingApproval[y] =  relationshipOf[y];
            // console.log(" bookingApproval[y]  2222 ========>  ", bookingApproval[y])
            bookingApproval[y].approvalTime = Date.now();
          // console.log("   write approveBooking.json bookingApproval[y] : ", bookingApproval[y]);
          fs.writeFile(__dirname + "/../data/approveBooking.json", JSON.stringify(bookingApproval, null, '\t'), "utf8", function(err, data){
            if(err){
                throw err;
            }
          }) // fs.writeFile approveBooking.json

          console.log("call createRawSendFrom()");
  //        return multichain.validateAddressPromise({address: this.address1})
          multichain.createRawSendFromPromise({
              from: userAddress,
              to: {},
              msg : [{"for":"BookingStream","key":"bookingTime","data":new Buffer(JSON.stringify(
                      bookingApproval)).toString("hex")}],
        //              action: "send"
          })         // signrawtransaction [paste-hex-blob] '[]' '["privkey"]'
          .then(hexstringblob => {
            // console.log("hexstringblob  : ", hexstringblob);

            assert(hexstringblob)

            return multichain.signRawTransactionPromise({
              hexstring: hexstringblob,
        //        parents: [],
              privatekeys: [userPrivkey]
          })
        })      //  sendrawtransaction [paste-bigger-hex-blob]
        .then(hexvalue => {
          // console.log("hexvalue.hex  : ", hexvalue.hex);

          assert(hexvalue)

          return multichain.sendRawTransactionPromise({
              hexstring: hexvalue.hex
          })
        })
        .then(tx_hex => {
            console.log("tx_hex  : ", tx_hex);
            assert(tx_hex)

            console.log("Finished Successfully");
            result["success"] = 1;
            result["error"] = "Approval Completed";
            res.json(result);
             return true;   // to stop send  res.json(result) again behind
        })
        .catch(err => {
            console.log(err)
            throw err;
        })

        })  // fs.readFile  approveBooking.json
      }
    }   // for

    // console.log("Object.keys(result).length : ", Object.keys(result).length)
    // if(Object.keys(result).length == 0 && countRelationship <= 0 ){
    //     result["success"] = 0;
    //     result["errror"] = "No Booking List in approveBooking()";
    // }
    // res.json(result);
  }) //fs.readFile   relationship.json
});


app.post('/getBookingListByManager',function(req,res){
  var sess = req.session;   // sess.loginUser,  sess.userAddress
  var userAddress = req.body.userAddress;
  var deviceAddress = req.body.deviceAddress;
  var result = {};
//  console.log("Object.keys(result).length : ", Object.keys(result).length)
  console.log("req.body  : ", req.body);
  // 1. 보내준 값 유효범위 체크
  // 2. 매니저 권한이 있는지 체크
  // 3. relationship.json 에서 관련 데이터 목록화하여 던저줌

  // 1. 보내준 값 유효범위 체크
  if(!req.body.userAddress || !req.body.deviceAddress){
      result["success"] = 0;
      result["error"] = "invalid request";
      res.json(result);
      return;
  }

  // 2. 매니저 권한이 있는지 체크
//  var managerAuthorityCheck = false;
  fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
      var userOf = JSON.parse(data);
//      var x;

//      for(x in userOf){
        // 하드코딩함
      console.log("userOf[admin]  : ", userOf["admin"]);
      console.log("userOf[admin2]  : ", userOf["admin2"]);

      if((userOf["admin"] != undefined && userOf["admin"].address == userAddress)
       || (userOf["admin2"] != undefined && userOf["admin2"].address == userAddress)){
          //managerAuthorityCheck = true;

          // 3. relationship.json 엔 있고 approvalBooking.json에 없는 데이터를 목록화하여 던저줌
          fs.readFile( __dirname + "/../data/relationship.json", 'utf8',  function(err, data){
            if(err){
               console.log("err    :    ", err)
               throw err;
            }
//            console.log("data  relationship.json -> ", data)
            var relationshipOf = JSON.parse(data);
//            var approvalBookingOf = {};

            fs.readFile( __dirname + "/../data/approveBooking.json", 'utf8',  function(err, data){
              var approveBookingOf;
              if(err){
                approveBookingOf = {};
                if(err["code"] != "ENOENT"){
                  throw err;
                }
              }else {
                approveBookingOf = JSON.parse(data);
              }

              //var y,z;
              for(const y in relationshipOf){
                if(relationshipOf[y].bookingTime > Date.now()){
                    var check_approval = false;
                    for(const z in approveBookingOf){
                      // console.log("relationshipOf[y].deviceAddress : ", relationshipOf[y].deviceAddress);
                      // console.log("approveBookingOf[z].deviceAddress : ", approveBookingOf[z].deviceAddress);

                      if( relationshipOf[y].deviceAddress == approveBookingOf[z].deviceAddress &&
                      relationshipOf[y].userAddress == approveBookingOf[z].userAddress){
//                    relationshipOf[y].bookingTime == approveBookingOf[z].bookingTime){
                          check_approval = true;
                      }
                    }
                    if(check_approval == false){
                      result[y] = relationshipOf[y];
                    }
                }
              }
              console.log("Object.keys(result).length : ", Object.keys(result).length)

              if(Object.keys(result).length == 0){
                result["success"] = 0;
                result["error"] = "No Booking List in getBookingListByManager()";
              }
              res.json(result);
              return true;
            });  //   fs.readFile( approvalBooking.json.
          });  //fs.readFile  relationship.json
        }else {
          result["success"] = 0;
          result["error"] = "No Manager Authority";
          res.json(result);
          return true;
        }
  })  //fs.readFile  user.json
});

  app.post('/bookingDevice',function(req,res){
    var sess = req.session;
    var userAddress = req.body.userAddress;
    var deviceAddress = req.body.deviceAddress;
    var deviceName = req.body.deviceName;
    var userPrivkey = req.body.userPrivkey;
    var bookingTime = new Number(req.body.bookingTime);
    var result = {};

    console.log("req.body  : ", req.body);

    // 1. 보내준 값 유효범위 체크
    // 2. 해당 디바이스가 있는지 체크
    // 3. 권한 요청 승인 기록 (RDB relationship,  Blockchain 각각에)
    //    3.1. 예약유효기간은 예약시각의 30분이내
    //    3.2. relationship.approvalBooking = true, false. (default=false)

    // 1. 보내준 값 유효범위 체크
    if(!req.body.deviceName || !req.body.userAddress){
        result["success"] = 0;
        result["error"] = "invalid request";
        res.json(result);
        return;
    }

    fs.readFile( __dirname + "/../data/device.json", 'utf8',  function(err, data){
        if(err){
            throw err;
        }
        var devices = JSON.parse(data);
        // 2. 해당 디바이스가 있는지 체크
        if(!devices[deviceName]){
            result["success"] = 0;
            result["error"] = "No device";
            res.json(result);
            return;
        }

        // 3. 권한 요청 승인 기록 (RDB relationship,  Blockchain 각각에)
        //    3.1. 예약유효기간은 예약시각의 30분이내
        //    3.2. relationship.approvalBooking = true, false. (default=false)
         fs.readFile( __dirname + "/../data/relationship.json", 'utf8',  function(err, data){
             if(err){
                 throw err;
             }
             var relationshipOf = JSON.parse(data);

             // relationshiop.json 은  장치관리자주소 + 장치주소 + bookingTime 로 고유번호부여
             relationshipOf[userAddress+deviceAddress+bookingTime] = {};
             relationshipOf[userAddress+deviceAddress+bookingTime].deviceAddress = deviceAddress;
             relationshipOf[userAddress+deviceAddress+bookingTime].userAddress = userAddress;
             relationshipOf[userAddress+deviceAddress+bookingTime].enrolledDate = Date.now();
//             relationshipOf[userAddress+deviceAddress+bookingTime].approvalBooking = false;
             relationshipOf[userAddress+deviceAddress+bookingTime].bookingTime = bookingTime;


          fs.writeFile(__dirname + "/../data/relationship.json", JSON.stringify(relationshipOf, null, '\t'), "utf8", function(err, data){
            if(err){
                throw err;
            }
          }) // fs.writeFile relationship.json

          console.log("call createRawSendFrom()");
  //        return multichain.validateAddressPromise({address: this.address1})
          multichain.createRawSendFromPromise({
              from: userAddress,
              to: {},
              msg : [{"for":"BookingStream","key":"bookingTime","data":new Buffer(JSON.stringify(
                      relationshipOf)).toString("hex")}],
        //              action: "send"
          })         // signrawtransaction [paste-hex-blob] '[]' '["privkey"]'
          .then(hexstringblob => {
            console.log("hexstringblob  : ", hexstringblob);

            assert(hexstringblob)
                // 이 부분만 curl 로 클라이언트에서 직접 처리 할 수 있다.
                //  curl --user myusername --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "MyMultichain signrawtransaction", "params": ["myhex"] }' -H 'content-type: text/plain;' http://127.0.0.1:7206
            return multichain.signRawTransactionPromise({
              hexstring: hexstringblob,
        //        parents: [],
              privatekeys: [userPrivkey]
          })
        })      //  sendrawtransaction [paste-bigger-hex-blob]
        .then(hexvalue => {
          console.log("hexvalue.hex  : ", hexvalue.hex);

          assert(hexvalue)

          return multichain.sendRawTransactionPromise({
              hexstring: hexvalue.hex
          })
        })
        .then(tx_hex => {
            console.log("tx_hex  : ", tx_hex);

            assert(tx_hex)

            console.log("Finished Successfully");
            result["success"] = 1;
            result["error"] = "Booking Completed";
            res.json(result);
        })
        .catch(err => {
            console.log(err)
            throw err;
        })

      }) //fs.readFile relationship.json
    })  //fs.readFile device.json
  });


  app.post('/requestAllUserList',urlencodedParser, function(req, res){
    var sess = req.session;
    var result = {};

    fs.readFile( __dirname + "/../data/user.json", 'utf8',  function(err, data){
        if(err){
            throw err;    // device가 하나도 없거나, 읽을때 에러 발생
        }
        var userOf = JSON.parse(data);
        var x;
        for(x in userOf){
          result[x] = userOf[x];
          delete  result[x].password;
        }
        res.json(result);
      })// fs.readFile  device.json
  });


app.post('/requestAllDeviceList',urlencodedParser, function(req, res){
  var sess = req.session;
  var userAddress = req.body.userAddress;
  var result = {};

  console.log("call  requestAllDeviceList() ");

  fs.readFile( __dirname + "/../data/device.json", 'utf8',  function(err, data){
    if(err){
        console.log("err[code]    :    ", err["code"])
        if(err["code"] == "ENOENT"){
          result["success"] = 0;
          result["error"] = "Server Internal Error";
          res.json(result);
          return;
        }else {
          throw err;   // relationship 이 하나도 없거나, 에러 발생시
        }
    }
      var devicesOf = JSON.parse(data);
      fs.readFile( __dirname + "/../data/relationship.json", 'utf8',  function(err, data){
        if(err){
              throw err;   // relationship 이 하나도 없거나, 에러 발생시
        }

        var relationshipOf = JSON.parse(data);
        fs.readFile( __dirname + "/../data/approveBooking.json", 'utf8',  function(err, data){
          var approveBookingOf;
          if(err){
            approveBookingOf = {};
            if(err["code"] != "ENOENT"){    // 승인리스트가 없으면 에럴 던저 버린다
              throw err;
            }
          }else {
            approveBookingOf = JSON.parse(data);
          }


              //var approveBookingOf = JSON.parse(data);
              var x,y,z;
              for(x in devicesOf){
                result[x] = devicesOf[x];
                result[x].myDevice = 0;     // 내 장치가 아님
              }
              for(y in relationshipOf){
              //  console.log(relationshipOf[y].userAddress)
                if(relationshipOf[y].userAddress == userAddress){
              //    console.log(relationshipOf[y].deviceAddress);
                  for(x in devicesOf){
                    if(devicesOf[x].address == relationshipOf[y].deviceAddress){ // && relationshipOf[y].bookingTime > Date.now()){
                      result[x].myDevice = 1;   // 승인 안된 내 장치 목록.
                      for(z in approveBookingOf){
                        if(y == z){
                            result[x].myDevice = 2;  // 승인된 사용가능 장치
                        }
                      }
                    }
                  }
                }
              }
              res.json(result);
          })   // fs.readFile  approveBooking.json
      })   // fs.readFile  relationship.json
    })// fs.readFile  device.json
});


app.post('/createDeviceAddress',function(req,res){
      var sess = req.session;
      var deviceName = req.body.deviceName;
      var devicePurpose = req.body.devicePurpose;
      var deviceInputerAddress = req.body.deviceInputerAddress;
      var teleport = req.body.teleport;
      const paramsOfsql = [];

      var result = {};

      // CHECK REQ VALIDITY
      if(!req.body.deviceName || !req.body.deviceInputerAddress){
      //     if(!req.body["password"] || !req.body["name"]){
          result["success"] = 0;
          result["error"] = "invalid request";
          res.json(result);
          return;
      }

      const promise = conCubrid.connect()
      .then(() => {
        console.log('connection is established');

        // sess.loginUser = userId;
        // sess.userAddress = row.address;

        // LOAD DATA & CHECK DUPLICATION
        // 한 사람이 같은 device 이름 입력하지 못하게 함
        var sql = 'SELECT * FROM device WHERE inputoraddress = '+"'"+sess.userAddress+"'" + ' AND devicename = '+"'"+deviceName+"'";
        console.log("sql ==> ", sql)
        return conCubrid.query(sql);
      })
      .then(response => {
        //assert(response.result.RowsCount === 0);
        if( response.result.RowsCount === 0){
          console.log("beginTransaction()  ");
          return conCubrid.beginTransaction();
        }else if(response.result.RowsCount > 0){
          // DUPLICATION FOUND
          result["success"] = 0;
          result["error"] = "duplicate";
          res.json(result);
          conCubrid.close();
          //return false;   // checked by assert(addrPubPri);
          assert(false);  // stop promise
        }
      })
      .then(() => {
  //      .then(chk_duplicated_id => {
  //        assert(chk_duplicated_id !== false)
          console.log("call createkeypairs()");
          return multichain.createKeyPairsPromise();
      })
      .then(addrPubPri => {
        assert(addrPubPri);
        console.log("addrPubPri : " , addrPubPri);

        result["address"] = addrPubPri[0]["address"];
        result["pubkey"] = addrPubPri[0]["pubkey"];
        result["privkey"] = addrPubPri[0]["privkey"];

        var sql = 'INSERT INTO device (deviceaddress, dateofenroll, teleport, devicepurpose, inputoraddress, devicename, devicepubkey) VALUES(?, ?, ?, ?, ?, ?, ?)';
        var params = [result["address"], Date.now(), teleport, devicePurpose, deviceInputerAddress, deviceName, result["pubkey"]];
        var dataTypes = ['varchar', 'bigint', 'char', 'varchar','varchar','varchar','varchar'];
        console.log("sql of device ==> ", sql)
        console.log("params ==> ", params)
        paramsOfsql[0] = params;

        return conCubrid.executeWithTypedParams(sql, params, dataTypes);
      })
      .then(() => {

        var sql = 'INSERT INTO userdevicerelationship (deviceaddress, useraddress, dateofenroll) VALUES(?, ?, ?)';
        var params = [result["address"], deviceInputerAddress, Date.now()];
        var dataTypes = ['varchar', 'varchar', 'bigint'];
        console.log("sql of relationshiop ==> ", sql)
        console.log("params ==> ", params)
        paramsOfsql[1] = params;

        return conCubrid.executeWithTypedParams(sql, params, dataTypes);
      })
      .then(() => {
        console.log("TEST: importAddressPromise")
        return multichain.importAddressPromise({
          address: result["address"],
          rescan: false
        })
      })
      .then(() => {
        console.log("TEST: GRANT")
        return multichain.grantPromise({
            addresses: result["address"],
//                    permissions: "send,receive,create"
            permissions: "connect,send,receive,issue,mine,admin,activate,create"
        })
      })
      .then(txid => {
        assert(txid)

        console.log("TEST: SUBSCRIBE STREAM")
        return multichain.subscribePromise({
            stream: "BookingStream"
        })
      })
      .then(() => {

        console.log("TEST: CREATE RAW SEND FROM");

        // var textvall = new Buffer(JSON.stringify(devices[deviceName])).toString("hex")
        // const buf222 = new Buffer(textvall, 'hex');
        // console.log("buf222.toString()   :  ", buf222.toString());

        return multichain.createRawSendFromPromise({
          from: result["address"],
          to: {},
          msg : [{"for":"BookingStream","key":"bookingTime","data":new Buffer(JSON.stringify(paramsOfsql[0])).toString("hex")},
                {"for":"BookingStream","key":"bookingTime","data":new Buffer(JSON.stringify(paramsOfsql[0]).toString() ).toString("hex")}]
        })
      })         // signrawtransaction [paste-hex-blob] '[]' '["privkey"]'
      .then(hexstringblob => {
        console.log("hexstringblob  : ", hexstringblob);
        assert(hexstringblob)

        return multichain.signRawTransactionPromise({
            hexstring: hexstringblob,
      //        parents: [],
            privatekeys: [result["privkey"]]
        })
      })      //  sendrawtransaction [paste-bigger-hex-blob]
      .then(hexvalue => {
        console.log("hexvalue.hex  : ", hexvalue.hex);

        assert(hexvalue)

        return multichain.sendRawTransactionPromise({
            hexstring: hexvalue.hex
        })
      })
      .then(tx_hex => {
        console.log("tx_hex  : ", tx_hex);
        assert(tx_hex)

        console.log("TEST:   cubrid.commit() ")
        return conCubrid.commit();
      })
      .then(() => {
        console.log("TEST:   cubrid.endTransaction() ")
        return conCubrid.endTransaction();
      })
      .then(() => {
        console.log("DB close()");
        // send the result to a browser.
        res.json(result);
        return conCubrid.close();
      })
      .catch(err => {
        // Handle the error.
        console.log("err  ==> ", err);
        conCubrid.rollback();
        throw err;
      })
  });

app.post('/createUserAddress',function(req,res){
      var sess = req.session;
      //var username = req.body.username;
      var userId = req.body.userId;

      var result = {};

      console.log("req.body  ===> ", req.body);


//      let addressMy, pubkeyMy, privkeyMy;

      // CHECK REQ VALIDITY
      if(!req.body.password || !req.body.userId){
          result["success"] = 0;
          result["error"] = "invalid request";
          res.json(result);
          return;
      }

      // LOAD DATA & CHECK DUPLICATION
  //    var code = 15214,
//      const conCubrid = CUBRID.createCUBRIDConnection('1.255.54.209', 33000, 'dba', '', 'demodb');

      const promise = conCubrid.connect()
      .then(() => {
        console.log('connection is established');

          // var sql = 'SELECT * FROM user WHERE userId = ?';
          // return conCubrid.queryWithParams(sql, [userId], [],cb);
          var sql = 'SELECT * FROM [user] WHERE userid = '+"'"+userId+"'";
          console.log("sql ==> ", sql)
          return conCubrid.query(sql);
      })
      .then(response => {
        //assert(response.result.RowsCount === 0);
        if( response.result.RowsCount === 0){
          console.log("beginTransaction()  ");
          return conCubrid.beginTransaction();
        }else if(response.result.RowsCount > 0){
          // DUPLICATION FOUND
          result["success"] = 0;
          result["error"] = "duplicate";
          res.json(result);
          conCubrid.close();
          //return false;   // checked by assert(addrPubPri);
          assert(false);  // stop promise
        }
      })
      .then(() => {
//      .then(chk_duplicated_id => {
//        assert(chk_duplicated_id !== false)
        console.log("call createkeypairs()");
        return multichain.createKeyPairsPromise();
      })
      .then(addrPubPri => {
        assert(addrPubPri);
        console.log("addrPubPri : " , addrPubPri);

        sess.loginUser = userId;
        sess.userAddress = result["address"];

        result["address"] = addrPubPri[0]["address"];
        result["pubkey"] = addrPubPri[0]["pubkey"];
        result["privkey"] = addrPubPri[0]["privkey"];

        var sql = 'INSERT INTO [user] (password, dateOfenroll, address, pubkey, userid) VALUES(?, ?, ?, ?, ?)';
        var params = [req.body.password, Date.now(), result["address"], result["pubkey"], req.body.username ];
        var dataTypes = ['varchar', 'bigint', 'varchar', 'varchar','varchar'];
        console.log("sql ==> ", sql)
        console.log("params ==> ", params)

        //return conCubrid.execute(sql);
        return conCubrid.executeWithTypedParams(sql, params, dataTypes);
      })
      .then(() => {
        return multichain.importAddressPromise({
          address: result["address"],
          rescan: false
        })
      })
      .then(() => {
            console.log("TEST: GRANT")
            return multichain.grantPromise({
                addresses: result["address"],
//                    permissions: "send,receive,create"
                permissions: "connect,send,receive,issue,mine,admin,activate,create"
            })
      })
      .then(txid => {
            console.log("TEST:   confirmCallbackEnroll() ")
            assert(txid);
            confirmCallbackEnroll(result,res);
      })
      .then(() =>{
        console.log("TEST:   cubrid.commit() ")
        return conCubrid.commit();
      })
      .then(() => {
        console.log("TEST:   cubrid.endTransaction() ")
        return conCubrid.endTransaction();
      })
      .then(() => {
        console.log("DB close()");
        // send the result to a browser.
        res.json(result);
        return conCubrid.close();
      })
      .catch(err => {
        // Handle the error.
        console.log("err  ==> ", err);
        conCubrid.rollback();
        throw err;
      });
});


  let listenForConfirmations = (txid, cb) => {
      console.log("WAITING FOR CONFIRMATIONS")
      var interval = setInterval(() => {
          getConfirmations(txid, (err, confirmations) => {
              if(confirmations > 0){
                  clearInterval(interval);
                  return cb(null, true);
              }
              return cb(null, false);
          })
      }, 5000)
  }

  let getConfirmations = (txid, cb) => {
      multichain.getWalletTransactionPromise({
          txid: txid
      }, (err, tx) => {
          if(err){
              console.log("look for confirmed state", err)
              return cb(err)
          }
          return cb(null, tx.confirmations);
      })
  }


  let confirmCallbackEnroll = (result_return,res) => {
      bluebird.bind(this)   // this is not working????
      .then(() => {

          console.log("TEST: LIST STREAMS")
          return multichain.listStreamsPromise({
            streams: "BookingStream"
          })
      })
      .then(stream => {
  //       console.log("stream : ", stream)
          assert.equal(stream.length, 1)

          console.log("TEST: SUBSCRIBE STREAM")
          return multichain.subscribePromise({
              stream: "BookingStream"
          })
      })
      .then(() => {
  //      console.log("subscribed  : ", subscribed);
        console.log("TEST: CREATE RAW SEND FROM");
//var objOfme = {};
//var arrOfme = [];
//arrOfme[0] = '{"for":"BookingStream","key":"bookingTime","data":"'+ new Buffer(Date.now().toString()).toString("hex")+'"}';
//arrOfme[0] = {"for":"BookingStream","key":"bookingTime","data":"5554584f732046545721"};
//        result_return["dateOfenroll"] = new Buffer(Date.now()).toString("hex");
        return multichain.createRawSendFromPromise({
              from: result_return["address"],
              to: {},
//              to: arrOfme,
              msg : [{"for":"BookingStream","key":"bookingTime","data":new Buffer(new String(
                result_return["dateOfenroll"])).toString("hex")}],
//              msg : arrOfme,
//              action: "send"
            })
      })         // signrawtransaction [paste-hex-blob] '[]' '["privkey"]'
      .then(hexstringblob => {
          console.log("hexstringblob  : ", hexstringblob);

          assert(hexstringblob)

          return multichain.signRawTransactionPromise({
              hexstring: hexstringblob,
      //        parents: [],
              privatekeys: [result_return["privkey"]]
          })
      })      //  sendrawtransaction [paste-bigger-hex-blob]
      .then(hexvalue => {
          console.log("hexvalue.hex  : ", hexvalue.hex);
          assert(hexvalue)

          return multichain.sendRawTransactionPromise({
              hexstring: hexvalue.hex
          })
      })
      .then(tx_hex => {
          console.log("tx_hex  : ", tx_hex);
          assert(tx_hex)

          console.log("Finished Successfully of Inputing Blockchain");
//          res.json(result_return);
      })
      .catch(err => {
          console.log(err)
          throw err;
      })
  }


  // XMLHttpRequest communication
//  app.post('/checkID/:username', function(req, res){
  app.post('/checkID', function(req, res){

     var result = { };
     var userId = req.body.username;

//     console.log("chk req.params   : ", req.params);
     console.log("chk req.body   : ", req.body);
     console.log("chk IDname   : ", IDname);

     // CHECK REQ VALIDITY
     if(!userId){
  //     if(!req.body["password"] || !req.body["name"]){
         result["success"] = 0;
         result["error"] = "invalid request";
         res.json(result);
         return;
     }

     const promise = conCubrid.connect()
     .then(() => {
       console.log('db connection is established');
       var sql = 'SELECT * FROM [user] WHERE userid = '+"'"+userId+"'";
       console.log("sql ==> ", sql)
       return conCubrid.query(sql);
     })
     .then(response => {
       //assert(response.result.RowsCount === 0);

       if( response.result.RowsCount === 0){
         result["success"] = 1;
       }else if(response.result.RowsCount > 0){
         // DUPLICATION FOUND
         result["success"] = 0;
         result["error"] = "duplicate";
       }
       res.json(result);
       console.log("DB close()");
       return conCubrid.close();
     })
     .catch(err => {
       // Handle the error.
       console.log("err  ==> ", err);
       throw err;
     });
  });

  app.get('/',urlencodedParser,function(req,res){
      var sess = req.session;
//
// //      var testval = new Buffer("문자 변환 테스트 ").toString("hex");
// var testval= "7b22314e5761416f6347514242526f33577757436a35467970733235334e48716f4a525752394b75315935627857555a7a59653464665663614a6d734e3236454479393676713667654e4b697756223a7b2264657669636541646472657373223a22315935627857555a7a59653464665663614a6d734e3236454479393676713667654e4b697756222c227573657241646472657373223a22314e5761416f6347514242526f33577757436a35467970733235334e48716f4a525752394b75222c22656e726f6c6c656444617465223a313530333330323933363332302c22617070726f76616c426f6f6b696e67223a66616c73652c22626f6f6b696e6754696d65223a2231353033333035383830303030227d2c22314e5761416f6347514242526f33577757436a35467970733235334e48716f4a525752394b75315935627857555a7a59653464665663614a6d734e3236454479393676713667654e4b69775631353033333037303830303030223a7b2264657669636541646472657373223a22315935627857555a7a59653464665663614a6d734e3236454479393676713667654e4b697756222c227573657241646472657373223a22314e5761416f6347514242526f33577757436a35467970733235334e48716f4a525752394b75222c22656e726f6c6c656444617465223a313530333330333337363436382c22617070726f76616c426f6f6b696e67223a66616c73652c22626f6f6b696e6754696d65223a2231353033333037303830303030227d7d";
//
//
// //      var testval = new Buffer("test converting by me   한글도 가능혀 ").toString("hex");
//       console.log("testval hex  : ", testval);
//       console.log("testval toString(utf8) : ", testval.toString("utf8"));
//       console.log("testval toString(ascii) : ", testval.toString("ascii"));
//       console.log("testval toString() : ", testval.toString());
//       console.log("testval toString(hex) : ", testval.toString("hex"));
//
//       const buf2 = new Buffer(testval, 'hex');
//       console.log("buf2.toString()   :  ", buf2.toString());
//


      res.render('index', {
          title: "인덱스화면",
          length: 5,
          loginUser: sess.loginUser,
          userAddress: sess.userAddress
      })
  });

  // app.get('/login',function(req,res){
  //   res.render('login');
  // })
  app.get('/main',function(req,res){
    var sess = req.session;
    console.log("call main()");
    res.render('main', {
        title: "main 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  })
  // app.get('/main/:username/:useraddress',function(req,res){
  //   console.log("call main()");
  //   res.render('main');
  // })
  app.get('/signup',function(req,res){   // 사용자 등록화면
    var sess = req.session;
    console.log("call signup()");

    // sess.loginUser = users[IDname]["username"];
    // sess.userAddress = users[IDname]["address"];
    // console.log("sess.loginUser :  ", sess.loginUser)
    // console.log("sess.userAddress :  ", sess.userAddress)

    res.render('signup', {
        title: "signup 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  })
  app.get('/devices',function(req,res){
    var sess = req.session;
    console.log("call devices()");

    console.log("sess.loginUser  :  ", sess.loginUser);

    res.render('devices', {
        title: "devices 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  })

  app.get('/booking',function(req,res){
    var sess = req.session;
    console.log("req.query  : ", req.query);
    res.render('booking',{
      deviceName : req.query.deviceName,
      deviceAddress : req.query.deviceAddress,
      loginUser: sess.loginUser,
      userAddress: sess.userAddress
    })
  });
  app.get('/device_detail',function(req,res){
    var sess = req.session;
    console.log("req.query  : ", req.query);
    res.render('device_detail',{
      deviceName : req.query.deviceName,
      deviceAddress : req.query.deviceAddress,
      loginUser: sess.loginUser,
      userAddress: sess.userAddress
    })
  });

  app.get('/device_add',function(req,res){
    var sess = req.session;
    console.log("call device_add()");
    res.render('device_add', {
        title: "device_add 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  })
  app.get('/device_add2',function(req,res){
    var sess = req.session;
    console.log("call device_add2()");
    res.render('device_add2', {
        title: "device_add2 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  });
  app.get('/users',function(req,res){
    var sess = req.session;
    console.log("call users()");
    res.render('users', {
        title: "users 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  });
  app.get('/booking_list',function(req,res){
    var sess = req.session;
    console.log("call booking_list()");
    res.render('booking_list', {
        title: "booking_list 페이지",
        length: 5,
        loginUser: sess.loginUser,
        userAddress: sess.userAddress
    })
  });
  //  app.post('/login/:IDname',jsonParser, function(req, res){
  app.post('/login',urlencodedParser, function(req, res){
      var sess = req.session;
      var userId = req.body.userId;
      var password = req.body.password
      var result = {};

      if (!req.body)
        console.log("bodyParser is not working!!!!");

      console.log("req.body  : ", req.body);

      const promise = conCubrid.connect()
      .then(() => {
        console.log('db connection is established');
        var sql = 'SELECT * FROM [user] WHERE userid = '+"'"+userId+"'";
        console.log("sql ==> ", sql)
        return conCubrid.queryAllAsObjects(sql)
        //return conCubrid.query(sql);
      })
      .then(response => {
        //assert(response.result.RowsCount === 0);
    //    console.log(response);
        const rowsCount = response.length;
        if(rowsCount > 0){
            const row = response[0];

            // console.log(row.password);
            // console.log(row.dateofenroll);
            // console.log(row.address);
            // console.log(row.pubkey);
            if(row.password === password){
              result["success"] = 1;
              sess.loginUser = userId;
              sess.userAddress = row.address;
            }else{
              // password incorrect
              result["success"] = 0;
              result["error"] = "password incorrect";
            }
        }else {
          // userId incorrect
          result["success"] = 0;
          result["error"] = "userId incorrect";
        }
        res.json(result);
        console.log("DB close()");
        return conCubrid.close();
      })
      .catch(err => {
        // Handle the error.
        console.log("err  ==> ", err);
        throw err;
      })


/*                res.redirect('choice', {
                  title: "MY HOMEPAGE",
                  length: 5,
                  IDname: req.body.IDname,
                  amount: 0
              })
*/

  });

  app.get('/logout', function(req, res){
        var sess = req.session;

        console.log("logout() call in main.js")

        if(sess.loginUser){
            req.session.destroy(function(err){
                if(err){
                    console.log(err);
                }else{
                    res.redirect('/');
                }
            })
        }else{
            res.redirect('/');
        }
  });
};
