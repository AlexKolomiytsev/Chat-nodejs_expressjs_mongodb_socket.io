/**
 * Created by sanya on 22.02.2016.
 */
//$('#logout').click(function() {
//	$("<form method='POST' action='/logout'>").submit();
//	return false;
//});

var logoutLink = document.getElementById('logout');
logoutLink.addEventListener("click", function(e) {
	e.preventDefault();
	//alert("Alolol");
	var form = document.createElement("form");
	form.setAttribute("method","POST");
	form.setAttribute("action", "/logout");
	document.body.appendChild(form);
	form.submit();

	//var xhr = new XMLHttpRequest();
	//xhr.open("POST", '/logout');
	//xhr.send();
	//return false;
});