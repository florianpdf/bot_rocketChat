const request = require('request');

// https://rocket.chat/docs/developer-guides/rest-api/

/*request.get('https://demo.rocket.chat/api/v1/info', function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});*/

request.post({
	url:'https://chat.wildcodeschool.fr/api/v1/login', 
	form: {
		"user": "your_rocket_chat_id", 
		"password" : "your_rocket_chat_mdp"
	}
}, function (error, response, body) {

	const json = JSON.parse(body);
	const authToken = json.data.authToken; 
	const userId = json.data.userId; 
	request.get({
		url:'https://chat.wildcodeschool.fr/api/v1/channels.history?roomId=wnguzpXn9ictnjoyK&unreads=true', 
		headers: {
			'X-Auth-Token': authToken,
			'X-User-Id': userId
		}
	}, function (error, response, body){
			console.log(error,body);
	})
});