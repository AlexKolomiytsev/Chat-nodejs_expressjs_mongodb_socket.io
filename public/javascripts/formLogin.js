/**
 * Created by sanya on 21.02.2016.
 */
$(document.forms['login-form']).on('submit', function() {
	var form = $(this);

	$('.error', form).html('');
	$(':submit', form).button("loading");

	$.ajax({
		url: "/login",
		method: "POST",
		data: form.serialize(), //Serialize a form to a query string that could be sent to a server in an Ajax request.
		complete: function () {
			$(":submit", form).button("reset");
		},
		statusCode: {
			200: function () {
				form.html("You are logged in").addClass('alert-success');
				window.location.href = "/chat";
			},
			500: function(jqXHR) {
				var error = JSON.parse(jqXHR.responseText);
				$('.error', form).html(error.message).addClass('alert-danger');
			},
			403: function(jqXHR) {
				var error = JSON.parse(jqXHR.responseText);
				$('.error', form).html(error.message).addClass('alert-danger');
			}
		}
	});
	return false;
});
