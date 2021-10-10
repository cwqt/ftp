//CORS policy means have to proxy request through this service
const CORS_URL 		= 'https://vercel-cors-proxy-cxss.vercel.app/?url='
const PROJECT_ID 	= "23430748"

//create GoTrue Netlify identify auth object
var auth = new GoTrue({
	APIUrl: "https://cass.si/.netlify/identity",
	setCookie: true,
})

async function authUser(username, password){
	$(".spinner").removeClass("hidden")
	return new Promise((resolve, reject) => {
		auth.login(username, password).then(resp => {
			console.log(resp);
			$(".spinner").addClass("hidden")
			resolve(resp);
		}).catch(err => {
			$(".spinner").addClass("hidden")
			reject(err);
		});		
	})
}

function setUserPassword(user, password) {
	return new Promise((resolve, reject) => {
		user.update({ password: password })
	  .then(user => resolve(user))
	  .catch(error => {
	    reject(error)
	  });		
	})
}

function setUserGitlabToken(user, token) {
	return new Promise((resolve, reject) => {
		user.update({ data: { gitlab_token: token } })
	  .then(user => resolve(user))
	  .catch(error => {
	    reject(error)
	  });		
	})
}

function sendRecoveryTokenToEmail(email) {
	return new Promise((resolve, reject) => {
		auth.requestPasswordRecovery(email)
		  .then(response => resolve(response))
		  .catch(error => reject(error));		
	})
}

function recoverUserFromKey(recoveryKey) {
	return new Promise((resolve, reject) => {
		auth.recover(recoveryKey)
			.then(resp => resolve(resp))
			.catch(error => reject(error));
	})
}

function parseAuthContent(content) {
	var parts = content.split(':', 2);
	var obj = {
		username: parts[0],
		password: parts[1]
	}
	return obj
}
