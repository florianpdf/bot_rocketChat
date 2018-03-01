const YouTube = require('youtube-node');
const youTube = new YouTube();

youTube.setKey('your_youtube_api_key');

module.exports = {
	getByTitle: function(title){
		return new Promise(function(resolve, reject){
			youTube.search(title, 1, function(error, result) {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	},

	getById: function(id){
		return new Promise(function(resolve, reject){
			youTube.getById(id, function(error, result) {
				if (error) {
					reject(error);
				} else {
					resolve(result);
				}
			});
		});
	}
}