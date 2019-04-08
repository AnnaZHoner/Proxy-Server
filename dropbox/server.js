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
var dbx = new Dropbox({ accessToken: 'DyQ1AM63lPAAAAAAAAAAjcKhGpnTxEfJkjaTh6skBrOszanCrbtVhfjdkgJHxZVK' });
var newFolder = 'group folder03'
var sharedId = ''
var sharingAddFolderMember = {};


//Taking in file
var fs = require('fs');
var textFile = fs.readFileSync('file.txt')
var text = textFile.toString()

//CIPHERING
var ciphertext = CryptoJS.AES.encrypt(text, 'secret key 123');
var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);

//Running everthing in asyn 
function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 2000);
  });
}

//commit file
var fileCommitInfo = {};
fileCommitInfo.contents = ciphertext;
fileCommitInfo.path = '/' + newFolder + '/text.txt';
fileCommitInfo.mode = { '.tag': 'overwrite' };
fileCommitInfo.autorename = true;
fileCommitInfo.mute = true;
fileCommitInfo.strict_conflict = true;


async function createFolder() {
  try {
    var response = await dbx.sharingShareFolder({ path: '/' + newFolder })
    console.log('folder created')
  }
  catch (e) { console.log('folder was not created' + JSON.stringify(e)) }
  var result = await resolveAfter2Seconds();
}


async function upload() {
  try {
    var response = await dbx.filesUpload(fileCommitInfo)
    sharedId = response.parent_shared_folder_id
  }
  catch (e) { console.log('your file upload failed' + JSON.stringify(e)) }
}


async function sharing() {
  console.log('shared folder id: ' + sharedId)
  sharingAddFolderMember.shared_folder_id = sharedId
  sharingAddFolderMember.members = [{ member: { email: 'honera@tcd.ie', '.tag': 'email' }, access_level: { '.tag': 'editor' } }]
  sharingAddFolderMember.quiet = false
  try {
    var responseSharing = await dbx.sharingShareFolder(sharingAddFolderMember)
    console.log(responseSharing)
  }
  catch (e) { console.log('folder failed to share' + JSON.stringify(e)) }
}


async function start() {
  console.log('calling');
  await createFolder();
  await upload();
  await sharing();
  // console.log(result);
}

start();
