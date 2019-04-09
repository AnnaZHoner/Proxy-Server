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
var newFolder = 'T-Comms Testing Folder'
var sharedId = ''
var sharingAddFolderMember = {};
var sharingRemoveFolderMember = {};
var SharingListFolderMembers = {};
var enteredEmail = ''



//Taking in file
var fs = require('fs');
var textFile = fs.readFileSync('file.txt')
var text = textFile.toString()

//CIPHERING
var ciphertext = CryptoJS.AES.encrypt(text, 'secret key 123');

//add function delay
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

//run create folder
async function createFolder() {
  try {
    var response = await dbx.sharingShareFolder({ path: '/' + newFolder })
    console.log('Folder sucessfully created.')
  }
  catch (e) { console.log('Folder already exists, will be updated.') }

}

//run upload
async function upload() {
  try {
    var response = await dbx.filesUpload(fileCommitInfo)
    sharedId = response.parent_shared_folder_id
  }
  catch (e) { console.log('\nFile failed to upload. Error: ' + JSON.stringify(e)) }
}

//run sharing
async function sharing(enteredEmail) {
  sharingAddFolderMember.shared_folder_id = sharedId
  sharingAddFolderMember.members = [{ member: { email: enteredEmail, '.tag': 'email' }, access_level: { '.tag': 'editor' } }]
  sharingAddFolderMember.quiet = true
  try {
    var responseSharing = await dbx.sharingAddFolderMember(sharingAddFolderMember)
  }
  catch (e) { console.log('\nFolder failed to share. Error: ' + JSON.stringify(e)) }
}

//Add extra folder memebers
async function addAnother() {
  readline.question(`Would you like to enter another email?(Y/N) `, (ans) => {
    if (ans == 'Yes' || ans == 'Y' || ans == 'yes' || ans == 'y') {
      readline.question(`Enter the email now: `, (enteredEmail) => {
        console.log('\n' + enteredEmail + ' will now be added to the folder')
        sharing(enteredEmail);
        addAnother();
      })
    }
    else {
      readline.question(`Would you like to remove an email?(Y/N) `, (ans) => {
        if (ans == 'Yes' || ans == 'Y' || ans == 'yes' || ans == 'y') {
          readline.question(`Enter the email now: `, (enteredEmail) => {
            removing(enteredEmail)
          })
        }
      
      })
    }
  })
  readline.question(`Would you like to download the uploaded file?(Y/N) `, (ans) => {
    if (ans == 'Yes' || ans == 'Y' || ans == 'yes' || ans == 'y') {
      download();
    }
  })
}

async function removing(removeEmail) {
  try {
    sharingRemoveFolderMember.shared_folder_id = sharedId
    sharingRemoveFolderMember.member = { 'email': removeEmail, '.tag': 'email' }
    sharingRemoveFolderMember.leave_a_copy = false
    var responseRemoving = await dbx.sharingRemoveFolderMember(sharingRemoveFolderMember)
    console.log( removeEmail + ' has been removed from the folder "' + newFolder + '".')
  }
  catch (e) { console.log('Failed to remove member. Error: ' + JSON.stringify(e)) }

}

//Downloading de-crypted file(if available)
async function download() {
  try {
    SharingListFolderMembers.shared_folder_id = sharedId
    SharingListFolderMembers.limit = 5
    var response = await dbx.sharingListFolderMembers(SharingListFolderMembers)
    var stream = fs.createWriteStream('C:/Users/Anna Honer/Documents/CS3031/download.txt')
    var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    try {
      console.log('Downloading...')
      stream.write(plaintext)
      console.log('Your file has been downloaded.\nGoodbye.')
      readline.close()
    }
    catch (e) {
      console.log("Exception caught in process: {0}", e);
    }
  }
  catch (e) { console.log('Failed to download file. Error: ' + JSON.stringify(e)) }
}


async function start() {
  await createFolder();
  await upload();
  readline.question(`Would you like to enter an email?(Y/N) `, (ans) => {
    if (ans == 'Yes' || ans == 'Y' || ans == 'yes' || ans == 'y') {
      readline.question(`Enter the email now: `, (enteredEmail) => {
        sharing(enteredEmail);
        addAnother();
      })
    }
    readline.question(`Would you like to download the uploaded file?(Y/N) `, (ans) => {
      if (ans == 'Yes' || ans == 'Y' || ans == 'yes' || ans == 'y') {
        download();
      }
      else {
        console.log('Closing program')
        readline.close()
      }
    })
  })
}

start();