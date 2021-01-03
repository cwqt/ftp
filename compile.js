const fs      = require('fs');
const replace = require("replace");
const YAML    = require('yaml')
const timeago = require("timeago.js")
const desam   = require("./desamber")

class File {
  constructor(filename, rawfile) {
    var fileContent = YAML.parse(rawfile);

    this.name         = filename.replace(/\.[^/.]+$/, "");
    this.data         = fileContent.data.split(';base64,').pop();
    this.uploader     = fileContent.uploader || "Anon";
    this.extension    = fileContent.data.split(';')[0].split('/')[1];
    this.creationDate = new Date(fileContent.creationDate || 0);

    if (this.extension == "plain") { this.extension == "txt" }
  }
}

function getFile(name) {
  var filePath = __dirname+"/f/"+name;
  var fileData = fs.readFileSync(filePath, "utf8");
  var file = new File(name, fileData);
  return file
}

function writeFileToDisk(file) {
  var dir = __dirname+"/_site"
  fs.writeFile(`${dir}/${file.name}.${file.extension}`, file.data, 'base64', function(err) {
    if (err) { console.log(err) }
    // console.log(`Wrote ${file.name} to disk.`)
  });
}

function getFileSizeFromB64(b64) {
  //https://stackoverflow.com/questions/29939635/how-to-get-file-size-of-newly-created-image-if-src-is-base64-string
  var stringLength = b64.length - 'data:image/png;base64,'.length;
  var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
  var sizeInKb = sizeInBytes/1000;
  return Math.ceil(sizeInKb).toString();
}

function getListFileMarkup(files) {
  files.sort(function(a,b){
    return b.creationDate - a.creationDate;
  });

  var listString = "";
  files.forEach((file, i) => {

    var dateString = "";
    var dateAsUTC = "Unknown";
    //for files that did not have a creationDate 
    //made before v2 of ftp
    if (file.creationDate.getFullYear() != "1970") {
      // console.log(file.creationDate)
      dateString = ` (${timeago.format(file.creationDate)})`
      d = new Date(file.creationDate);
      dateAsUTC = d.toUTCString();
    }
    var fullFilename = file.name + "." + file.extension;

    var markup = `
    <div class="file-item dropdown">
        <p>${fullFilename}</p>
        <span>${dateString}</span>
        <a id="outbound-link" target="_blank" href="https://ftp.cass.si/${fullFilename}">
          <img src="/img/link.png"/>
        </a>
    </div>
    <div class="file-accordian">
        <div class="flag-delete-button icon-button"><img src="/img/delete.png" /></div>
        <div class="left"><img id="thumbnail" src="http://placehold.it/280x170" /></div>
        <div class="right">
            <p><img src="/img/uploader.png" /><b>Uploader: </b>${file.uploader}</p>
            <p><img src="/img/date.png" /><b>Upload date: </b>${dateAsUTC}</p>
            <p><img src="/img/filesize.png" /><b>File size: </b>${getFileSizeFromB64(file.data)}kb</p>
            <p><img src="/img/yaml.png" /><b>YAML:</b><a href="https://gitlab.com/cxss/site/blob/ftp/f/${file.name}.yml">ftp://f/${fullFilename}.yml</a></p>
        </div>
    </div>`

    listString = listString + markup;
  })

  return listString
}

fs.readdir(__dirname+"/f/", function(err, files) {
  FileObjects = [];
  files.forEach(file => {
    FileObjects.push(getFile(file))
  })

  FileObjects.forEach(file => {
    //convert b64 to file and write to _site
    writeFileToDisk(file);
  })

  // add files to list.html
  replace({
      regex: "INSERT_LIST_HERE",
      replacement: getListFileMarkup(FileObjects),
      paths: [__dirname+"/_site"],
      recursive: true,
      silent: false,
  });

  //desamber update times
  replace({
      regex: "UPDATED_AT",
      replacement: `${desam.date()} ${desam.time()}`,
      paths: [__dirname+"/_site"],
      recursive: true,
      silent: false,
  });

  //date string
  var compileDate = new Date(Date.now());
  replace({
      regex: "COMPILE_DATE_TIME",
      replacement: `${compileDate.toUTCString()}`,
      paths: [__dirname+"/_site"],
      recursive: true,
      silent: false,
  });
})
 