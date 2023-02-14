import axios from 'axios'
import convert from 'xml-js'
//import fs from 'fs'
//import {GoogleAuth} from 'google-auth-library';
//import {google} from 'googleapis';

//Map the XML to JSON
async function mapXMLtoObj(xmllink = '')
{
  try
  {
    if(xmllink[xmllink.length-1] == '/') //some regions have '/' already, so remove it for our purposes.
      xmllink = xmllink.slice(0, -1);

    let XMLData = (await axios.get(xmllink + '/patchinfo.xml')).data;
    return convert.xml2js(XMLData);
  }
  catch(err)
  {
    console.log('FAILED TO LOAD: ' + xmllink);
    //console.log(err);
  }
};


//Dat -> Proper link
async function datToLink(link = '')
{
  try
  {
    let res = await axios.get(link);
    return res.data.replaceAll(/(>|<)/ig, '');
  }
  catch(err)
  {
    console.log('FAILED TO LOAD: ' + xmllink);
    //console.log(err);
  }
}

/*
function DownloadAndUpload(link = '', path='', filename = '')
{
  try
  {
    const filepath = './Downloads/'+path;
    downloadFile(link, filepath);
    upload(path, filename);
    return './Downloads/'+path;
  }
  catch(err)
  {
    console.log(err);
  }
}
*/

//data\\x2.exe
function checkPDB(XMLObj)
{
  try
  {
    const found = XMLObj.elements[0].elements[1]
    .elements.find(element => 
       element.attributes.Name == 'data\\x2.pdb'
    || element.attributes.Name == 'data\\x2.PDB'
    || element.attributes.Name == 'data\\X2.pdb'
    || element.attributes.Name == 'data\\X2.PDB');
    
    if(found != undefined)
    {
      return 'EXIST';
    }
    else
    {
      return 'NONE';
    }
  }
  catch(err)
  {
    console.log("something went wrong: checkpdb");
  }
}

function checkUnpackedX2(XMLObj)
{
  try
  {
    const found = XMLObj.elements[0].elements[1].elements.find(element => element.attributes.Name == 'data\\x2.exe');
    if(found.attributes.Size > 30000000) //above 30mb is a candidate for an unpacked client
    {
      return 'EXIST';
    }
    else
    {
      return 'NONE';
    }
  }
  catch(err)
  {
    console.log("something went wrong: checkunpackedx2");
  }
}

//TO-DO. Finish integrating Google Drive API and implement automatic upload->link functionality.

/*
const downloadFile = function(url, dest) {
  var file = fs.createWriteStream(dest);
  var request = http.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close();  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};
*/

/**
 * Insert new file.
 * @return{obj} file Id
 * */
/*
 async function upload(filename, filepath) {

  // Get credentials and build service
  // TODO (developer) - Use appropriate auth mechanism for your app
  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/drive',
  });
  const service = google.drive({version: 'v3', auth});
  const fileMetadata = {
    name: filename,
  };
  const media = {
    mimeType: 'application/vnd.google-apps.file',
    body: fs.createReadStream(filepath),
  };
  try {
    const file = await service.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });
    console.log('File Id:', file.data.id);
    return file.data.id;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
*/

//Export all functions
export{mapXMLtoObj, datToLink, checkPDB, checkUnpackedX2};