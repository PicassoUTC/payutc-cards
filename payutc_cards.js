const fishingrod = require('fishingrod');
// get list of cards
const cards = require('./cards.json');
const config = {
	i: 1
};

// App name is Registrar
const constants = require('./config.json');
console.log('Config', constants.app_key);
// login before launching creation
fishingrod.fish({
	https:true, 
	host: 'api.nemopay.net',
	path: '/services/GESARTICLE/login2?system_id=payutc&app_key=' + constants.app_key,
	method: 'POST',
	data:{
		login:constants.username,
		password: constants.password
	},
	headers:{
		'Content-Type': 'application/json'
	}
}).then((res) => {
	var response = JSON.parse(res.response);
	// launch creation
	if(!response.sessionid){
		console.log(response);
		throw new Error('No session id in response');
	}
	console.log('Login success!');
	launch(response.sessionid);
}).catch(e => {
	console.error('Could not login', e);
});

var dups = 0;
function launch(sid){
	// for each tag we create a new user
	for(var uid of cards){
		fishingrod.fish({
			https: true,
			host: 'api.nemopay.net',
			path: `/services/REGISTER/register?app_key=${constants.app_key}&sessionid=${sid}&system_id=payutc`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			data:{
				user:{
					adult: true,
					email: `bde_${uid}@utc.fr`,
					firstname: 'Exterieur',
					lastname: 'TAG:' + uid.substr(-6),
					password: '0000',
					send_password_creation_mail: false,
					send_welcome_email: false,
					tag_uid: uid,
					username: `ext_${uid}`
				}
			}
		}).then((res) => {
			try{
				var response = JSON.parse(res.response);
			} catch(e) {
				console.error(response);
				throw e;
			}
			// check if user was created
			if(!response.id){
				if(response.error.type === 'DuplicateUser'){
					dups++;
					return console.log('Dup!', dups);
				}
				console.error('USERERR', response);
				throw new Error('Could not create user');
			} else {
				console.log('Ok!', response.id , response.lastname , config.i);
				config.i++;
			}
		}).catch(e => {
			console.error(e);
		});
	}
}