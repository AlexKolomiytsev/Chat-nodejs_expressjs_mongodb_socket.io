/**
 * Created by sanya on 22.02.2016.
 */
(function() {
	var socket = io.connect('', {
		'reconnection delay': 1,
		reconnect: false
	});

	var form = $('#room form');
	var ul = $('#room ul');
	var input = $('#room input');

	socket
			.on('message', function(username, message) {
				printMessage(username + "> " + message);
			})
			.on('leave', function(username) {
				printStatus(username + " exit from chat");
			})
			.on('join', function(username) {
				printStatus(username + " entry to chat");
			})
			.on('connect', function() {
				printStatus("Connections is established");
				form.on('submit', sendMessage);
				input.prop('disabled', false);
			})
			.on('disconnect', function() {
				printStatus("Connections is lost");
				form.off('submit', sendMessage);
				input.prop('disabled', true);
				setTimeout(reconnect, 500);
			});

	function reconnect() {
		socket.once('error', function() {
			setTimeout(reconnect, 500);
		});
		socket.socket.connect();
	}

	function sendMessage() {
		var text = input.val();
		socket.emit('message', text, function() {
			printMessage(text);
		});
		input.val('');
		return false;
	}
	function printMessage(text) {
		$('<li>', {text: text}).addClass('list-group-item').appendTo(ul);
	}
	function printStatus(status) {
		$('<li>', {text: status}).addClass('alert-info').appendTo(ul);
	}


	//form.submit(function() {
	//	var text = input.val();
	//	input.val('');
//
	//	socket.emit('message', text, function(data) { //третий необязательный аргумент - функция - принимает данные от сервера
	//		console.log(data);
	//		$('<li>', {text: text}).addClass('list-group-item').appendTo(ul);
	//	});
//
	//	return false;
	//});


	//socket.on('message', function(text) {
	//	$('<li>', {text: text}).addClass('list-group-item').appendTo(ul);
	//});


})();