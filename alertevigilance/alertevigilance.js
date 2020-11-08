exports.action = function(data, callback){

    let client = setClient(data);
	vigilance (data, client);

	info("alerte vigilance from:", data.client, "To:", client);
	
	callback();
}

function vigilance (data, client) {
    if (!Config.modules.alertevigilance.num_departement){
    Avatar.speak('numéro département non renseigner, renseigne le dans le fichier propriété', data.client, function(){ 
    Avatar.Speech.end(data.client);
    });
    return;
} 
    var num_departement = Config.modules.alertevigilance.num_departement

    var tts = Config.modules.alertevigilance.tts[client];
    var url = 'http://alerte.vigilance-meteo.fr/getwarning_fr.php?plz='+num_departement+'&uwz=UWZ-FR&lang=fr';
	http_request(url)
	.then(body => scraper(body))
	.then(function(vigilance) {
	//Avatar.speak(tts, data.client, function(){
    Avatar.speak(tts+vigilance, data.client, function(){ 
    Avatar.Speech.end(data.client);
	});
	//});
	})
    .catch(function(err) {
	Avatar.speak(err, data.client, function(){ 
	Avatar.Speech.end(data.client);
	});
	});
	  
function scraper(body) {
	return new Promise(function (resolve, reject) { 
	var $ = require('cheerio').load(body, { xmlMode: true, ignoreWhitespace: false, lowerCaseTags: false });
	info(vigilance)
	var vigilance = $("#content h1:nth-child(2)").first().text()+ " : "+$('#content p:nth-child(3)').first().text()+ " : "+$('#content div:nth-child(4) div:nth-child(1)').first().text();
	if (!vigilance) {
	return reject('Désolé je n\'arrive pas accédé au site');
}
	resolve (vigilance);
	});
}

function http_request (url) {
	return new Promise(function (resolve, reject) {
	var request = require('request');
	request({ 'uri' : url}, function (err, response, body) {
	if (err || response.statusCode != 200) {
	return reject ('Désolé je n\'arrive pas accédé au site');
}
    resolve(body);
	});
	});
}	
}


function setClient(data){
    var client = data.client;
    if (data.action.room)
    client = (data.action.room != 'current') ? data.action.room : (Avatar.currentRoom) ? Avatar.currentRoom : Config.default.client;
    if (data.action.setRoom)
    client = data.action.setRoom;
    return client;
}