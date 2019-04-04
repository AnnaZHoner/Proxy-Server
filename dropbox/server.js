require('es6-promise').polyfill();
require('isomorphic-fetch'); // or another library of choice.
const hostname = 'localhost';
const port = 3000;

//----------------------------------VARS----------------------------------------------//
var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var Dropbox = require('dropbox').Dropbox;
// var ACCESS_TOKEN = localStorage.accessToken;   //in case I want to load in the access token remotely later
var dbx = new Dropbox({ accessToken: 'DyQ1AM63lPAAAAAAAAAAjcKhGpnTxEfJkjaTh6skBrOszanCrbtVhfjdkgJHxZVK' });

dbx.filesListFolder({ path: '' })
  .then(function (response) {
    //console.log(response);
  })
  .catch(function (error) {
    // console.log(error);
  });


dbx.filesListFolder({ path: '' })
  .then(function (response) {
    // console.log(response.entries);
  })
  .catch(function (error) {
    //console.error(error);
  });


//-----------------------------Taking in file------------------------------------//
var fs = require('fs');
var textFile = fs.readFileSync('file.txt')
var text = textFile.toString()
//txt file taken in okay doke


//-----------------------------FILE UPLOADING-------------------------------------//
function uploadFile(tmpStrListStr) {
  var tmpStrList = "";
  var uploadSuccess = false;
  tmpStrList = tmpStrListStr.substring(0, tmpStrListStr.length - 1).split(",");
  istrue = true;
  for (var i = 0; i < tmpStrList.length; i++) {
    //var path = cordova.file.externalRootDirectory + '/Test/Logs/' + tmpStrList[i] + '.pdf';
    window.resolveLocalFileSystemURL(path, function (fileEntry) {

      fileEntry.file(function (file) {
        var reader = new FileReader();

        reader.onloadend = function (e) {

          var fileCommitInfo = {};
          fileCommitInfo.contents = textFile;
          fileCommitInfo.path = '/T-Comms testing' + textFile.name;
          fileCommitInfo.mode = { '.tag': 'overwrite' };
          fileCommitInfo.autorename = true;
          fileCommitInfo.mute = true;

          dbx.filesUpload(fileCommitInfo)
            .then(function (response) {
              alert(response);
            })
            .catch(function (errr) {
              console.log(errr);
            });

          }

          reader.readAsDataURL(file);
      });

  }, function (e) {
        console.log("FileSystem Error");
        console.dir(e);
    });

   }

}

        //------------------------CIPHERING-------------------------------------------------//
        var ciphertext = CryptoJS.AES.encrypt(text, 'secret key 123');
        console.log("This is the message pre-encryption: " + text);
        console.log("This is the message encrypted: " + ciphertext);
        var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
        console.log(ciphertext)
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        console.log("This is the message decrypted: " + plaintext);

//ayyyy we're decrypting bby
