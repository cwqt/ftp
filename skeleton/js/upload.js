async function sendImageCompressionRequest(binary) {
	// curl --user api:API_KEY \
	//       --data-binary @unoptimized.png -i https://api.tinify.com/shrink
  var result = await $.ajax({
    url: CORS_URL+'https://api.tinify.com/shrink',
    type: 'POST', //
		//send ArrayBuffer to compression api
    data: binary,
    processData: false,
    headers: {
			"Authorization": "Basic "+ btoa("api:" + auth.currentUser().user_metadata.tiny_token),
			"Content-Type": "application/octet-stream",
    },
    success: function(response) {
    	return response.output.url
    },
    error: function(xhr, textStatus, errorThrown) {
    	console.log(xhr, textStatus, errorThrown)
    }
  });
  //returns a URL with compressed file
  return result.output.url;
}

async function getCompressedImage(url) {
  //get that mfing blob
  var getBlob = new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
		  if (this.readyState == 4 && this.status == 200){
		  	resolve(this.response)
		  }
		}
		xhr.open('GET', CORS_URL + url);
		xhr.responseType = 'blob';
		xhr.send(); 
  })
  return await getBlob
}

function schemaToYaml(schema) {
	var string = `name: ${schema.name}
uploader: ${schema.uploader}
creationDate: ${schema.creationDate}
data: >
  "${schema.dataURI}"`
	return string
}

function setListFileStatus(index, message) {
	console.log(index, message)
	$(`#fi-debug-${index}`).html(message);
}

function setListFileSize(index, size) {
	$(`#fi-size-${index}`).html(size);	
}

function addListFileLink(index, url) {
	$(`#fi-${index}`).append(`<a href="${url}" target="_blank">${url}</a>`)
}

function setListItemStatus(index, status) {
	$(`#fi-${index}`).removeClass("rejected-item")
	$(`#fi-${index}`).removeClass("processing-item")
	$(`#fi-${index}`).removeClass("completed-item")
	$(`#fi-${index}`).addClass(`${status}-item`)
}

function getListFileMarkup(schema, index) {
  var markup = `
    <div class="file-item" id="fi-${index}">
      <p>${schema.originalName}</p>
      <span id="fi-size-${index}">${Math.ceil(schema.size/1000)}kb</span>
      <span id="fi-debug-${index}"></span>
    </div>
  `
  return markup
}

async function uploadFilesToRepository(files) {
  var actions = [];

  files.forEach(file => {
  	actions.push({
  		action: "create",
  		file_path: `f/${file.name}.yml`,
  		content: schemaToYaml(file)
  	})
  })

  console.log("actions:", actions)
  console.log("files:", files)
  await $.ajax({
    type: 'POST',
    url: `${CORS_URL}https://gitlab.com/api/v4/projects/${PROJECT_ID}/repository/commits`,
    dataType: "json",
    contentType: 'application/json; charset=UTF-8',
    data: JSON.stringify({
	  	branch: "ftp",
	  	commit_message: `FTP :: Uploading ${files.length} file(s)`,
	  	actions: actions    	
    }),
    beforeSend: function(xhr) {
      xhr.setRequestHeader("PRIVATE-TOKEN", auth.currentUser().user_metadata.gitlab_token);
    },
    success: function(response) {
    	console.log(response)
    	files.forEach((file, index) => {
    		setListFileStatus(index, "")
    		addListFileLink(index, `https://ftp.cass.si/${file.name}.${file.extension}`)
    	})
    },
    error: function(xhr, textStatus, errorThrown) {
    	console.log(xhr, textStatus, errorThrown)
    }
  });
  return;
}

function generateFilename() {
	var name = "";
	//window.performance.now: 731421.2699999334
	//take last 6
	//put onto end of x
	//  -> sgbd5f0gei999334
	var n = window.performance.now().toString().substr(-6);
	var x = [...Array(10)].map(i=>(~~(Math.random()*36)).toString(36)).join('');
	x = (x + n).split("");

  for(var i=x.length-1; i > 0; i--){
    const j = Math.floor(Math.random() * i)
    const temp = x[i]
    x[i] = x[j]
    x[j] = temp
  }

  var pickRand = (z) => { return Math.floor(Math.random() * Math.floor(z)) }
	x.forEach(char => {
		if (char.match(/[a-z]/i)) {
			if (pickRand(10) == 1) { char = char.toUpperCase()}
		}
		if (pickRand(22) == 1) { char = "=" }
		if (pickRand(44) == 1) { char = "~" }
		name += char;
	})

	return name.substring(0, 9)
}


function generateFileSchema(file) {
	var FileSchema = {
		name: 				generateFilename(),
		uploader: 		auth.currentUser().user_metadata.full_name,
		creationDate: Date.now(),
		originalName: file.name,
		extension: 		file.name.split('.').pop(),
		size: 				file.size,
		dataURI: 			"",
	}
	return FileSchema;
}

async function readFileAsDataURL(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(e) {
			resolve(e.target.result);
		}
	})
}

async function readFileAsArrayBuffer(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();
		reader.readAsArrayBuffer(file);
		reader.onload = function(e) {
			resolve(e.target.result);
		}
	})	
}

//======================================================
//setting password/token
$(document).keyup(function(event) {
	//recovery.jade
  if ($("#recoveryKey").is(":focus") && event.key == "Enter") {
		(async () => {
			$(".spinner").removeClass("hidden")
			try {
		  	await recoverUserFromKey($("#recoveryKey").val())
		  	$("#newPassword").removeClass("hidden")
		  	$("#recoveryKey").addClass("hidden")
			} catch(e) {	
				$("#debug_message").text(e);
				$("#recoveryKey").addClass("incorrect");
			}
			$(".spinner").addClass("hidden")
		})();
  }
  //index.jade / recovery.jade
  if ($("#newPassword").is(":focus") && event.key == "Enter") {
		(async () => {
			$(".spinner").removeClass("hidden")
			try {
		  	await setUserPassword(auth.currentUser(), $("#newPassword").val())
				$("#debug_message").text("Password changed!");
			} catch {
				$("#debug_message").text(e);				
			}
			$(".spinner").addClass("hidden")
		})();
  }
  if ($("#newToken").is(":focus") && event.key == "Enter") {
		(async () => {
			$(".spinner").removeClass("hidden")
			try {
		  	await setUserGitlabToken(auth.currentUser(), $("#newToken").val())
				$("#debug_message").text("GitLab token changed!");
			} catch(e) {
				$("#debug_message").text(e);
			}
			$(".spinner").addClass("hidden")
		})();
  }
});

// check if input already has autosaved token
if( $('#token').length && $('#token').val() != "") {
	var credentials = parseAuthContent($('#token').val())
	authUser(credentials.username, credentials.password)
}

// on input enter
$(document).keyup(function(event) {
  if ($("#token").is(":focus") && event.key == "Enter") {
		(async () => {
			// attempt to authorise
			var credentials = parseAuthContent($('#token').val())
			var user
			try {
				user = await authUser(credentials.username, credentials.password)
			} catch(e) {
				$("#token").addClass("incorrect");
			}

			//auth passed
			if (user) {
				// show add file ui
				$(".auth").addClass("hidden")
				$(".upload_button").removeClass("hidden")
				$(".files").removeClass("hidden")
			}
		})();
  }
});

// on input change (files added), parse files
function onFileAdded(event) {
	var startTime = Date.now();
	$(".upload_button").addClass("hidden")
	var blockedFileTypes = ["exe", "scr", "cpl", "docx", "doc", "jar"];
	var FileList = Array.from(event.target.files);//convert a FileList into Array
	var FilePromises = [];
	var Files = [];
	var useCompression = $('#useCompression').is(':checked');

	//let declared in a for loop declaration like this will create a
	//unique value of i for each invocation of the loop
	for(let i=0; i<FileList.length; i++) {
		let file = FileList[i];
		let FileSchema = generateFileSchema(file);
		$(".files").append(getListFileMarkup(FileSchema, i));

		if (blockedFileTypes.indexOf(FileSchema.extension) != -1) {
			setListItemStatus(i, "rejected");
			setListFileStatus(i, `<b>${FileSchema.extension}</b>'s are not allowed`);
			FileList.splice(i, 1);
			continue;
		}

		var p = new Promise(async (resolve, reject) => {
			setListItemStatus(i, "processing");
			
			//image compression
			if (file.type.includes("image") && useCompression) {
				var allowedTypes = ["png", "jpg", "jpeg"]				
				if (allowedTypes.indexOf(FileSchema.extension) != -1) {
					setListFileStatus(i, "Requesting to compress...");
					var fileArrayBuffer    = await readFileAsArrayBuffer(file);
					var compressedImageUrl = await sendImageCompressionRequest(fileArrayBuffer);
					setListFileStatus(i, "Getting compressed image...");
					var compressedFile     = await getCompressedImage(compressedImageUrl);

					var percentageSizeDiff = 100 - Math.ceil((compressedFile.size / FileSchema.size) * 100);
					setListFileSize(i, `${Math.ceil(compressedFile.size/1000)}kb (-${percentageSizeDiff}%)`);
					setListFileStatus(i, "Compressed!");
					file = compressedFile;
				}
			}

			//read the Blob/File into base64 URI
			setListFileStatus(i, "Reading file...");
			var dataURI = await readFileAsDataURL(file);
			FileSchema.dataURI = dataURI;
			Files.push(FileSchema);

			console.log(`Completed parsing ${FileSchema.name}`);
			setListFileStatus(i, "Waiting for other files...");
			resolve();
		})

		//process all files at the same time
		FilePromises.push(p);
	}

	// when all files are uploaded, batch send to gitlab
	Promise.all(FilePromises).then(async () => {
		Array.from(FileList).forEach((f, i) => {
			setListItemStatus(i, "completed");
			setListFileStatus(i, "Uploading...");
		})
		await uploadFilesToRepository(Files);
		$("#time").html(`Request took <b>${(Date.now()-startTime)/1000}</b> seconds.`)
	})
}
