var inspector = require('inspector')
//inspector.open(9330, null, true)

function tryRequire(module) {
	try {
		return require(module)
	} catch(error) {
		return {}
	}
}
if (typeof chai === 'undefined') { chai = require('chai') }
assert = chai.assert
//if (typeof msgpack-struct === 'undefined') { msgpack-struct = require('..') }
var Serializer = require('..').Serializer
var parse = require('..').parse
var serialize = require('..').serialize


var zlib = tryRequire('zlib')
var deflateSync = zlib.deflateSync
var inflateSync = zlib.inflateSync
var deflateSync = zlib.brotliCompressSync
var inflateSync = zlib.brotliDecompressSync
var constants = zlib.constants
try {
//	var { decode, encode } = require('msgpack-lite')
} catch (error) {}

if (typeof XMLHttpRequest === 'undefined') {
	var fs = require('fs')
	var sampleData = JSON.parse(fs.readFileSync(__dirname + '/samples/study.json'))
} else {
	var xhr = new XMLHttpRequest()
	xhr.open('GET', 'samples/outcomes.json', false)
	xhr.send()
	var sampleData = JSON.parse(xhr.responseText)
}
var ITERATIONS = 200000

suite('msgpack-struct basic tests', function(){
	test('serialize/parse data', function(){
		var data = {
			data: [
				{ a: 1, name: 'one', type: 'odd', isOdd: true },
				{ a: 2, name: 'two', type: 'even'},
				{ a: 3, name: 'three', type: 'odd', isOdd: true },
				{ a: 4, name: 'four', type: 'even'},
				{ a: 5, name: 'five', type: 'odd', isOdd: true },
				{ a: 6, name: 'six', type: 'even', isOdd: null }
			],
			description: 'some names',
			types: ['odd', 'even'],
			convertEnumToNum: [
				{ prop: 'test' },
				{ prop: 'test' },
				{ prop: 'test' },
				{ prop: 1 },
				{ prop: 2 },
				{ prop: [undefined] },
				{ prop: null }
			]
		}
		let structures = []
		let serializer = new Serializer({ structures })
		var serialized = serializer.serialize(data)
		var parsed = serializer.parse(serialized)
		assert.deepEqual(parsed, data)
	})

	test('mixed array', function(){
		var data = [
			'one',
			'two',
			'one',
			10,
			11,
			null,
			true,
			'three',
			'three',
			'one', [
				3, -5, -50, -400,1.3, -5.3, true
			]
		]
		let structures = []
		let serializer = new Serializer({ structures })
		var serialized = serializer.serialize(data)
		var parsed = serializer.parse(serialized)
		assert.deepEqual(parsed, data)
	})

	test('serialize/parse sample data', function(){
		var data = sampleData
		let structures = []
		let serializer = new Serializer({ structures, objectsAsMaps: false })
		debugger
		var serialized = serializer.serialize(data)
		var parsed = serializer.parse(serialized)
		assert.deepEqual(parsed, data)
	})

	test.skip('extended class', function(){
		function Extended() {

		}
		Extended.prototype.getDouble = function() {
			return this.value * 2
		}
		var instance = new Extended()
		instance.value = 4
		var data = {
			extendedInstance: instance
		}
		// TODO: create two of these
		var options = new Options()
		options.addExtension(Extended, 'Extended')
		var serialized = serialize(data, options)
		var parsed = parse(serialized, options)
		assert.equal(parsed.extendedInstance.getDouble(), 8)
	})


	test('map/date', function(){
		var map = new Map()
		map.set(4, 'four')
		map.set('three', 3)


		var data = {
			map: map,
			//date: new Date(1532219539819)
		}
		let serializer = new Serializer()
		var serialized = serializer.serialize(data)
		var parsed = serializer.parse(serialized)
		assert.equal(parsed.map.get(4), 'four')
		assert.equal(parsed.map.get('three'), 3)
		//assert.equal(parsed.date.getTime(), 1532219539819)
	})

	test('numbers', function(){
		var data = {
			bigEncodable: 48978578104322,
			dateEpoch: 1530886513200,
			realBig: 3432235352353255323,
			decimal: 32.55234,
			negative: -34.11,
			exponential: 0.234e123,
			tiny: 3.233e-120,
			zero: 0,
			//negativeZero: -0,
			Infinity: Infinity
		}
		var serialized = serialize(data)
		var parsed = parse(serialized)
		assert.deepEqual(parsed, data)
	})

	test('utf16 causing expansion', function() {
		this.timeout(10000)
		let data = {fixstr: 'ᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝ', str8:'ᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝᾐᾑᾒᾓᾔᾕᾖᾗᾘᾙᾚᾛᾜᾝ'}
		var serialized = serialize(data)
		parsed = parse(serialized)
		assert.deepEqual(parsed, data)
	})

})
suite('msgpackr performance tests', function(){
	test('performance', function() {
		var data = sampleData
		this.timeout(10000)
		let structures = []
		let serializer = new Serializer({ structures, objectsAsMaps: false })
		var serialized = serializer.serialize(data)
		console.log('msgpack-struct size', serialized.length)
		for (var i = 0; i < ITERATIONS; i++) {
			var parsed = serializer.parse(serialized)
		}
	})
	test('performance serialize', function() {
		var data = sampleData
		this.timeout(10000)
		let structures = []
		let serializer = new Serializer({ structures, objectsAsMaps: false })

		for (var i = 0; i < ITERATIONS; i++) {
			//serialized = serialize(data, { shared: sharedStructure })
			var serialized = serializer.serialize(data)
			serializer.resetMemory()
			//var serializedGzip = deflateSync(serialized)
		}
		//console.log('serialized', serialized.length, global.propertyComparisons)
	})
})


function createSchema(object) {
	let schema = []
	for (let key in object)	{
		let value = object[key]
		let childSchema
		if (value && typeof value == 'object') {
			childSchema = {
				key: key
			}
			if (value instanceof Array) {
				if (value[0] && typeof value[0] == 'object') {
					childSchema.schema = true
					childSchema.items = createSchema(value[0])
				}
			} else {
				childSchema.schema = true
				childSchema.structure = createSchema(value)
			}
		} else {
			childSchema = key
		}
		schema.push(childSchema)
	}
	return schema
}
function writeObjectWithSchema(object, schema) {
	let i = 0
	let base = {}
	let values = []
	for (let key in object) {
		let value = object[key]
		let childSchema = schema[i++]
		if (typeof childSchema == 'string' ? childSchema == key : (childSchema && childSchema.key == key)) {
			if (childSchema.schema) {
				if (childSchema.items) {
					value = writeArrayWithSchema(value, childSchema.items)
				} else {
					value = writeObjectWithSchema(value, childSchema.structure)
				}
			}
			values.push(value)
		} else {
			base[key] = value
		}
	}
	return values
}
function writeArrayWithSchema(array, schema) {
	let l = array.length
	let target = new Array(l)
	for (let i = 0; i < l; i++) {
		target[i] = writeObjectWithSchema(array[i], schema)
	}
	return target
}
function readObjectWithSchema(values, schema) {
	let l = values.length
	let target = {}
	for (let i = 0; i < l;) {
		let childSchema = schema[i]
		let value = values[i++]
		if (typeof childSchema == 'string') {
			target[childSchema] = value
		}
		else {
			if (typeof value == 'object' && value) {
				if (childSchema.items) {
					value = readArrayWithSchema(value, childSchema.items)
				} else if (childSchema.structure) {
					value = readObjectWithSchema(value, childSchema.structure)
				}
			}
			target[childSchema.key] = value
		}
	}
	return target
}
function readArrayWithSchema(values, schema) {
	let l = values.length
	let target = new Array(l)
	for (let i = 0; i < l; i++) {
		target[i] = readObjectWithSchema(values[i], schema)
	}
	return target
}
function internalize(object) {
	return eval('(' + JSON.stringify(object) +')')
}
