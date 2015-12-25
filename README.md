# artista-mean

## Installation

```sh
$ npm install -g artista-mean
```

## Features

Generates MEAN stack from JSON file.

No definition. All you need is data JSON files!

artista-mean analyze JSON files, then generate schemas.

 * Generates express project
 * Generates mongoose ODM
 * Generates AngularJS application
 * Generates Management Page for JSON data


## Quick Start

* Prepare directory for JSON files

```sh
% tree /tmp/json
/tmp/json
├── Car.json
└── Person.json

0 directories, 2 files
```

Car.json
```js
[
    {
	"id": 7,
	"name": "RX-7"
    },
    {
	"id": 8,
	"name": "Elise"
    },
    {
	"id": 9,
	"name": "NSX"
    }
]
```

Person.json
```js
[
    {
	"id": 1,
	"name": "Takayoshi Aoyagi",
	"gender": "male",
	"age": 43,
	"company": {
	    "name": "Artista",
	    "position": "president"
	},
	"hobbies": ["Car", "Music", "Taekwon-do"],
	"married": true
    }
]
```

 * Execute command

```sh
$ artista-mean /tmp/sample /tmp/json
$ cd /tmp/sample && npm install
$ npm start
```

* Auto generated Admin page

http://localhost:3000/admin.html
