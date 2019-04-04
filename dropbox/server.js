var fs = require('fs');
require('es6-promise').polyfill();
require('isomorphic-fetch'); // or another library of choice.
const readline = require('readline')
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
    console.log(error);
  });


dbx.filesListFolder({ path: '' })
  .then(function (response) {
    // console.log(response.entries);
  })
  .catch(function (error) {
    console.error(error);
  });


//-----------------------------Taking in file------------------------------------//
var fs = require('fs');
var textFile = fs.readFileSync('file.txt')
var text = textFile.toString()
//txt file taken in okay doke


//------------------------CIPHERING-------------------------------------------------//
var ciphertext = CryptoJS.AES.encrypt(text, 'secret key 123');
console.log("This is the message pre-encryption: " + text);
console.log("This is the message encrypted: " + ciphertext);
var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
//console.log(ciphertext)
var plaintext = bytes.toString(CryptoJS.enc.Utf8);
console.log("This is the message decrypted: " + plaintext);


//-----------------------------FILE UPLOADING-------------------------------------//


//attempting to create folder first 
dbx.filesCreateFolder({ path: '/sharedfolderbutnotshared2' })
  .then(function (response) {
    dbx.sharingShareFolder({
      path: response['path_lower'],
      shared_link_policy: 'anyone',
      actions: ['invite_editor'],
    })
     

    });

var fileCommitInfo = {};
fileCommitInfo.contents = ciphertext;
fileCommitInfo.path = '/sharedfolderbutnotshared2/test text.txt';
fileCommitInfo.mode = { '.tag': 'overwrite' };
fileCommitInfo.autorename = true;
fileCommitInfo.mute = true;


var sharingAddFolderMember = {};
sharingAddFolderMember.shared_folder_id = 'new folder'
sharingAddFolderMember.members = ['sabahk32@hotmail.com'].email
sharingAddFolderMember.quiet = false


dbx.filesUpload(fileCommitInfo)
  .then(function (response) {
    //console.log(response);
  })
  .catch(function (errr) {
    console.log(errr);
  });

//------------------------------Group Info------------------------------------------//

//

