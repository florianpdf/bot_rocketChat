// Youtube module and song init
const youtubeApi = require('./youtube_api');
const youtubeStream = require('youtube-audio-stream');
const decoder = require('lame').Decoder
const libao = require('libao');

// APP Init
const express = require('express');
const app = express();

// Other external modules
const functions = require('./functions');
const request = require('request');

// RocketChatAPI Init
const RocketChatApi = require('rocketchat').RocketChatApi;
const rocketChatApi = new RocketChatApi(
	'https', 
	'chat.wildcodeschool.fr', 
	443, 
	'your_rocket_chat_id', 
	'your_rocket_chat_mdp');
const roomId = 'room_id';
const user = 'your_rocket_chat_id';
const mdp = 'your_rocket_chat_mdp';

let unreadMessages = [];
let songInformations = '';
let playList = [];

// Get song informations by id
function getSongInformation(songId){
	console.log(songId);
	youtubeApi.getById(songId).then(function(result){
		let items = result.items[0];
		let informations = {
			'duration': functions.durationConvertor(items.contentDetails.duration),
			'channelTitle': items.snippet.channelTitle,
			'title': items.snippet.localized.title,
			'description': items.snippet.localized.description
		}
	});
}

// Get the first result song => search by title
// NO COMPLETE
function getSongByTitle(){
	youtubeApi.getByTitle('Attaque terroriste au Niger').then(function(result){
		console.log(result.items[0].id.videoId);
	});
}

// Post msg on room in RocketChat
function postMessage(msg){
	rocketChatApi.sendMsg("room_id", msg, function(err,body){
	    if(err)
	        console.log(err);
	    else
	        console.log(body);
	})
}

// List all RocketChatChannel
function getAllChannels(){
	rocketChatApi.getPublicRooms(function(err,body){
		if(err)
			console.log(err);
		else
			console.log(body);
	});
}


app.get('/unreads', function (req, res) {
	request.post({
		url:'https://chat.wildcodeschool.fr/api/v1/login', 
		form: {
			"user": user, 
			"password" : mdp
		}
	}, function (error, response, body) {
		setInterval(function(){
			const json = JSON.parse(body);
			const authToken = json.data.authToken; 
			const userId = json.data.userId; 
			request.get({
				url:'https://chat.wildcodeschool.fr/api/v1/channels.history?roomId=' + roomId + '&unreads=true', 
				headers: {
					'X-Auth-Token': authToken,
					'X-User-Id': userId
				}
			}, function (error, response, body){
				if (error){
					console.log(error);
				}
				else{
					var objBody = JSON.parse(body).messages;
					for (let index in objBody){
						let msg = objBody[index].msg;
						let author = objBody[index].u.name;
						let msgId = objBody[index]._id;

						// TODO: Custom regex for get only video ID
						let regex = /youtube\.com\/watch\?v=([0-9a-z]+)/gmi;
						
						// console.log(msg)
						// if (regex.test(msg)) {
							// console.log(regex.exec(msg));
							// let id = regex.exec(msg)[1] // TODO: Uncoment this when regex ok
							let id = msg; // TODO: Uncoment this when regex ok
							unreadMessages.push({
								'idMsg': msgId,
								'idSong': id,
								'author': author
							});
						// }
						rocketChatApi.rocketChatClient.chat.delete({ roomId, msgId });
					}
				}
			})
		}, 1000);

	})
	for (var i = 0; i < unreadMessages.length; i++) {
		youtubeApi.getById(unreadMessages[i].url).then(function(result){
			let items = result.items[0];
			playList.push( {
				'duration': functions.durationConvertor(items.contentDetails.duration),
				'channelTitle': items.snippet.channelTitle,
				'title': items.snippet.localized.title,
				'description': items.snippet.localized.description,
				'idSong': unreadMessages[i].idSong
			});
			console.log(playList);
		});
	};

	
	playSong();
	
})

function playSong(){
	if(playList.length == 0) {
		setTimeout(function(){
			playSong();
		}, 10000);
	} else {
		let currentDate = new Date(); 
		let datetime = currentDate.getDate() + "/"
		                + (currentDate.getMonth()+1)  + "/" 
		                + currentDate.getFullYear() + " @ "  
		                + currentDate.getHours() + ":"  
		                + currentDate.getMinutes() + ":" 
		                + currentDate.getSeconds();
		let post = "Le " + datetime + ', vous écoutez ' + playList[0].title;
			postMessage(post);
			var requestUrl = 'http://youtube.com/watch?v=' + "HiF9TsGm2g0";

			youtubeStream(requestUrl).pipe(decoder()).pipe(libao());
			playList.shift();
			setTimeout(function(){
				playSong();
			}, playList[0].duration.totalseconds * 1000);
		
	}
}





app.get('/youtube/:videoId', function (req, res) {
    var requestUrl = 'http://youtube.com/watch?v=' + req.params.videoId;

	try {
		youtubeApi.getById(req.params.videoId).then(function(result){
			let items = result.items[0];
			let informations = {
				'duration': functions.durationConvertor(items.contentDetails.duration),
				'channelTitle': items.snippet.channelTitle,
				'title': items.snippet.localized.title,
				'description': items.snippet.localized.description
			}
			console.log(informations);
		});

		// Play on Speacker
		youtubeStream(requestUrl)
		.pipe(decoder())
		.pipe(libao())

	} catch (exception) {
		res.status(500).send(exception);
	}
});


app.get('/rocket', function (req, res) {
	// rocketChatApi.sendMsg(roomId, "@all c'est de la balle node !! pour la " + counter + " fois", function(err,body){
	//     if(err)
	//         console.log(err);
	//     else
	//         console.log(body);
	// })
	
	// List all channel
	rocketChatApi.getPublicRooms(function(err,body){
	if(err)
		console.log(err);
	else
		console.log(body);
})

});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})


 
