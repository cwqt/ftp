var count = 2;
function validate() {
	var un = document.myform.username.value;
	var pw = document.myform.pword.value;
	var valid = false;

	var unArray = ["ttxi"];
	var pwArray = ["2415"];

	for (var i=0; i <unArray.length; i++) {
		if ((un == unArray[i]) && (pw == pwArray[i])) {
			valid = true;
		break;
		}
	}

	if (valid) {
		alert ("Login was successful");
		window.location = "../cms";
	return false;
	}

	var t = " tries";
	if (count == 1) {t = " try"}

	if (count >= 1) {
		alert ("Invalid username and/or password.  You have " + count + t + " left.");
		document.myform.username.value = "";
		document.myform.pword.value = "";
		setTimeout("document.myform.username.focus()", 25);
		setTimeout("document.myform.username.select()", 25);
		count --;
	}

	else {
		alert ("Still incorrect! You have no more tries left!");
		document.myform.username.value = "No more tries allowed!";
		document.myform.pword.value = "";
		document.myform.username.disabled = true;
		document.myform.pword.disabled = true;
	return false;
	}
}