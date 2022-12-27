const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const fs = require('fs');

const BASE_PATH = path.resolve(process.env.BASE_PATH ?? './api');
const api = {};
try {
	fs.readdirSync(BASE_PATH, { withFileTypes: true })
		.filter(entry => entry.isFile() && entry.name.slice(-3) === '.js')
		.forEach(entry => {
			const source = require(path.join(BASE_PATH, entry.name));
			const routes = Object.keys(source).map((key) => {
				const [method, code, uri] = key.split(':');
				const response = source[key];
				return { method, code, uri, response };
			});
			api[entry.name.slice(0, -3)] = routes;
		});
} catch (err) {
	console.error(err);
	process.exit();
}

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
	res.json({ result: "OK" });
});

for (const name in api) {
	for (const route of api[name]) {
		const { method, code, uri, response } = route;
		app[method](`/${name}${uri}`, function (req, res, next) {
			if (code < 300) {
				res.status(code);
				if (response) res.json(response);
				else res.end();
			} else if (code < 400) {
				res.redirect(code, response);
			} else {
				next({
					code,
					message: response
				});
			}
		});
	}
}

app.use((req, res, next) => {
  res.status(404).json({ error: "NotFound" });
})

app.use(function (err, req, res, next) {
	res.status(err.code ?? 500);
	res.json({
		error: err.message ?? err
	});
})

module.exports = app;
