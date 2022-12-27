const _ = require("lodash");
const { faker } = require('@faker-js/faker');

const objectId = () => faker.datatype.hexadecimal({ prefix: '', length: 24, case: 'lower'});
const pastUnixDT = () => (new Date(faker.date.past())).getTime();
const cohort = (n) => `web+${n}`;
const infoBlock = () => ({
	"text": faker.lorem.lines(5),
	"image": faker.image.cats(),
	"reactions": faker.datatype.number({ precision: 1, max: 100 })
});

const userA = { //active user
	"_id": objectId(),
	"createdAt": pastUnixDT(),
	"updatedAt": null,
	"email": faker.internet.email(),
	"cohort": cohort(16),
	"name": faker.name.fullName(),
};
const shortProfileA = {
	..._.omit(userA, ['name']),
	"profile": {
		"name": userA.name,
		"photo": faker.image.cats(),
		"city": {
		  "name": faker.address.city(),
		  "geocode": [
	    	faker.address.latitude(56, 55, 4),
	    	faker.address.longitude(38, 37, 4)
		  ]
		}
	}
};
const userB = {
	"_id": objectId(),
	"createdAt": pastUnixDT(),
	"updatedAt": null,
	"email": faker.internet.email(),
	"cohort": cohort(16),
	"name": faker.name.fullName()
};
const reactions = [
	...["hobby","edu","status","job",null].map(target => ({
		"_id": objectId(),
		"from": _.pick(userB, ['_id', 'name', 'email']),
		"target": target,
		"text": faker.lorem.lines(1),
		"to": _.pick(userA, ['_id', 'name', 'email']),
	})),
	...["like","smile","heart"].map(emotion => ({
		"_id": objectId(),
		"from": _.pick(userB, ['_id', 'name', 'email']),
		"target": null,
		"emotion": emotion,
		"to": _.pick(userA, ['_id', 'name', 'email']),
	}))
];
const fullProfileA = {
	..._.omit(userA, ['name']),
	"profile": {
		...shortProfileA.profile,
		"birthday": faker.date.birthdate().toString().slice(0, 10),
	    "quote": faker.lorem.lines(1).slice(50),
	    "telegram": faker.internet.userName(),
	    "github": faker.internet.userName(),
	    "template": null
	},
	"info": {
		"hobby": infoBlock(),
		"status": infoBlock(),
		"job": infoBlock(),
		"edu": infoBlock()
	},
	"reactions": reactions.length
};
const shortProfileB = {
	..._.omit(userB, ['name']),
	"profile": {
		"name": userB.name,
		"photo": faker.image.cats(),
		"city": {
		  "name": faker.address.city(),
		  "geocode": [
	    	faker.address.latitude(56, 55, 4),
	    	faker.address.longitude(38, 37, 4)
		  ]
		}
	}
};
const fullProfileB = {
	..._.omit(userB, ['name']),
	"profile": {
		...shortProfileB.profile,
		"birthday": faker.date.birthdate().toString().slice(0, 10),
	    "quote": faker.lorem.lines(1).slice(50),
	    "telegram": faker.internet.userName(),
	    "github": faker.internet.userName(),
	    "template": null
	},
	"info": {
		"hobby": infoBlock(),
		"status": infoBlock(),
		"job": infoBlock(),
		"edu": infoBlock()
	},
	"reactions": 0
};

module.exports = {
	"post:200:/users": userA,
	"get:200:/users": {
		"total": 2,
		"items": [
			userA,
			userB
		]
	},
	[`put:200:/users/${userA._id}`]: userA,
	[`put:200:/users/${userB._id}`]: userB,
	"get:200:/comments": {
		"total": 5,
		"items": reactions.filter(r => !!r.text)
	},
	...reactions.filter(r => !!r.text).reduce((a, c) => Object.assign(a, {
		[`delete:200:/comments/${c._id}`]: null
	}), {}),
	"get:200:/profiles": {
		"total": 2,
		"items": [
			shortProfileA,
			shortProfileB
		]
	},
	[`get:200:/profiles/${userA._id}`]: fullProfileA,
	[`patch:200:/profiles/${userA._id}`]: fullProfileA,
	[`get:200:/profiles/${userA._id}/reactions`]: {
		"total": reactions.length,
		"items": reactions.map(item => _.omit(item, ['to']))
	},
	[`post:403:/profiles/${userA._id}/reactions`]: { error: "Forbidden" },
	[`get:200:/profiles/${userB._id}`]: fullProfileB,
	[`patch:403:/profiles/${userB._id}`]: { error: "Forbidden" },
	[`get:200:/profiles/${userB._id}/reactions`]: {
		"total": 0,
		"items": []
	},
	[`post:200:/profiles/${userB._id}/reactions`]: null
}