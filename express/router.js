var url = require('url');
var matchURLToPath = require('./pathmatcher');
var parseParams = require('./parseParams');

var Router = {};

Router.methods = ['get', 'post'];

Router.routes = {};

Router.methods.forEach(method => {
	Router.routes[method] = Router.routes[method] || {};
	Router[method] = (path, callback) => {
		Router.routes[method][path] = callback;
	};
});

Router.handle = (req, res) => {
	let method = req.method.toLowerCase();
	let purl = url.parse(req.url).pathname;

	let body = '';
	req.on('data', data => {
		body += data;
		//console.log('heres the data in req.on: ' + body);
		//bodyParser.json()
	});

	req.on('end', () => {
		//console.log(body);
		let githubObj = JSON.parse(decodeURIComponent(body.substring(8))) || {
			pusher: { name: '' },
			repository: { name: '' }
		};
		// if (githubObj[pusher][name] === undefined) {
		// 	console.log('You did not push yet. So, cannot find pusher!!');
		// } else {
		// 	console.log('User name: ', githubObj[pusher][name]);
		// }
		// // let repo = githubObj[repository][name] || '';
		// console.log(githubObj);
		// console.log('User name: ', pusher);
		// console.log('Repo name: ', repo);
	});
	// req.on('end', () => {
	// 	req.body = body;
	// 	console.log('req.body is ' + req.body);
	// 	res.end('data');
	//});

	var callbackPath = purl;

	let patharray = Object.keys(Router.routes[method]);
	//.post is still .get
	patharray.forEach(path => {
		if (matchURLToPath(purl, path)) {
			callbackPath = path;
		}
	});

	if (Router.routes[method][callbackPath]) {
		let params = parseParams(callbackPath, purl);
		req.params = params; //params = {...}
		//if (method == 'post') { req.body = }
		Router.routes[method][callbackPath](req, res);
	} else {
		res.statusCode = 404;
		res.end('404 Not Found');
	}
};

module.exports = Router;
