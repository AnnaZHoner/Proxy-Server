const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})

var fs = require('fs');
require('es6-promise').polyfill();
require('isomorphic-fetch'); // or another library of choice.
const hostname = 'localhost';
const port = 3000;

//----------------------------------VARS----------------------------------------------//

var CryptoJS = require("crypto-js");
var AES = require("crypto-js/aes");
var SHA256 = require("crypto-js/sha256");
var Dropbox = require('dropbox').Dropbox;
var dbx = new Dropbox({ accessToken: 'DyQ1AM63lPAAAAAAAAAAjcKhGpnTxEfJkjaTh6skBrOszanCrbtVhfjdkgJHxZVK' });
var newFolder = 'group folder0'
var sharedId = ''
var sharingAddFolderMember = {};
var sharingRemoveFolderMember = {};
var enteredEmail = 'honera@tcd.ie'



//Taking in file
var fs = require('fs');
var textFile = fs.readFileSync('file.txt')
var text = textFile.toString()

//CIPHERING
var ciphertext = CryptoJS.AES.encrypt(text, 'secret key 123');
var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
var plaintext = bytes.toString(CryptoJS.enc.Utf8);

//add function delay
function resolveAfter2Seconds() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, 1000);
  });
}

//commit file
var fileCommitInfo = {};
fileCommitInfo.contents = ciphertext;
fileCommitInfo.path = '/' + newFolder + '/text.txt';
//fileCommitInfo.mode = {update:'conflicted copy', '.tag': 'update'}
fileCommitInfo.mode = { '.tag': 'overwrite' };
fileCommitInfo.autorename = true;
fileCommitInfo.mute = true;
fileCommitInfo.strict_conflict = true;

//run create folder
async function createFolder() {
  try {
    var response = await dbx.sharingShareFolder({ path: '/' + newFolder })
    console.log('folder created')
  }
  catch (e) { console.log('folder was not created' + JSON.stringify(e)) }
  var result = await resolveAfter2Seconds();
}

//run upload
async function upload() {
  try {
    var response = await dbx.filesUpload(fileCommitInfo)
    console.log(response)
    sharedId = response.parent_shared_folder_id
  }
  catch (e) { console.log('your file upload failed' + JSON.stringify(e)) }
}

//run sharing
async function sharing(enteredEmail) {
  console.log('shared folder id: ' + sharedId)
  sharingAddFolderMember.shared_folder_id = sharedId
  sharingAddFolderMember.members = [{ member: { email: enteredEmail, '.tag': 'email' }, access_level: { '.tag': 'editor' } }]
  sharingAddFolderMember.quiet = true
  try {
    var responseSharing = await dbx.sharingAddFolderMember(sharingAddFolderMember)
    //console.log(responseSharing)
  }
  catch (e) { console.log('folder failed to share' + JSON.stringify(e)) }
}
async function addAnother() {
  readline.question(`Would you like to enter another email?(Y\N) `, (ans) => {
    if (ans == 'Yes' ||ans == 'Y' ||ans == 'yes' ||ans == 'y')
    {
      readline.question(`Enter the email now: `, (enteredEmail) => {
        console.log('\n' + enteredEmail + ' will now be joined to the folder')
        sharing(enteredEmail);
        addAnother();
        //readline.close()
      })
    }
    else {
      console.log('Goodbye')
      
    }
  })
}

async function removing() {
  console.log('removing MEMEbers ')
  sharingRemoveFolderMember.shared_folder_id = sharedId
  sharingRemoveFolderMember.member = [{email: 'honera@tcd.ie'}]
  sharingRemoveFolderMember.leave_a_copy = false
  try {
    var responseRemoving = await dbx.sharingRemoveFolderMember(sharingRemoveFolderMember)
    //console.log(responseSharing)
  }
  catch (e) { console.log('failed to remove member' + JSON.stringify(e)) }

}

async function start() {
  console.log('calling');
  await createFolder();
  await upload();
  await sharing(enteredEmail);
  addAnother();
  //await removing();
}


start();
//readline.close()