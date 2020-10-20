function handleFiles(files) {
	// Check for the various File API support.
	if (window.FileReader) {
		// FileReader are supported.
		getAsText(files[0]);
	} else {
		alert('FileReader are not supported in this browser.');
	}
}

function getAsText(fileToRead) {
	var reader = new FileReader();
	// Handle errors load
	reader.onload = loadHandler;
	reader.onerror = errorHandler;
	// Read file into memory as UTF-8      
	reader.readAsText(fileToRead);
}

function loadHandler(event) {
	var csv = event.target.result;
	var a = Papa.parse(csv, { header: true })
	console.log(a)
	//processData(csv);
}

function processData(csv) {
	var allTextLines = csv.split(/\r\n|\n/);
	var lines = [];
	while (allTextLines.length) {
		lines.push(allTextLines.shift().split(','));
	}
	console.log(lines);
	drawOutput(lines);
}

//if your csv file contains the column names as the first line
function processDataAsObj(csv) {
	var allTextLines = csv.split(/\r\n|\n/);
	var lines = [];

	//first line of csv
	var keys = allTextLines.shift().split(',');

	while (allTextLines.length) {
		var arr = allTextLines.shift().split(',');
		var obj = {};
		for (var i = 0; i < keys.length; i++) {
			obj[keys[i]] = arr[i];
		}
		lines.push(obj);
	}
	console.log(lines);
	drawOutputAsObj(lines);
}

function errorHandler(evt) {
	if (evt.target.error.name == "NotReadableError") {
		alert("Canno't read file !");
	}
}

function drawOutput(arr) {
	//Clear previous data
	/* document.getElementById("output").innerHTML = "";
	var table = document.createElement("table");
	for (var i = 0; i < lines.length; i++) {
		var row = table.insertRow(-1);
		for (var j = 0; j < lines[i].length; j++) {
			var firstNameCell = row.insertCell(-1);
			firstNameCell.appendChild(document.createTextNode(lines[i][j]));
		}
	}
	document.getElementById("output").appendChild(table); */

	var headerLen = arr[0]
	var jsonArr = []
	var primeCol = ['Ticket ID', 'Text Identifier', 'phone']


	var primeColNumber = {}

	for (var i = 0; i < headerLen.length; i++) {
		for (var j = 0; j < primeCol.length; j++) {
			if (headerLen[i].includes(primeCol[j])) {
				primeColNumber[headerLen[i]] = j
			}
		}
	}
	var reqField = Object.keys(primeColNumber)
	if (reqField.includes('Ticket ID')) {
		for (var k = 0; k < arr.length; k++) {
			var emailField = primeColNumber['Ticket ID']
			var cat = primeColNumber['Text Identifier'] || 0
			var jsonData = {}
			jsonData.email = arr[k][emailField]
			jsonData.cat = arr[k][cat]
			jsonArr.push(jsonData)
		}
	}
	else {
		console.log('no req header found')
	}


}

//draw the table, if first line contains heading
function drawOutputAsObj(lines) {
	//Clear previous data
	document.getElementById("output").innerHTML = "";
	var table = document.createElement("table");

	//for the table headings
	var tableHeader = table.insertRow(-1);
	Object.keys(lines[0]).forEach(function (key) {
		var el = document.createElement("TH");
		el.innerHTML = key;
		tableHeader.appendChild(el);
	});

	//the data
	for (var i = 0; i < lines.length; i++) {
		var row = table.insertRow(-1);
		Object.keys(lines[0]).forEach(function (key) {
			var data = row.insertCell(-1);
			data.appendChild(document.createTextNode(lines[i][key]));
		});
	}
	document.getElementById("output").appendChild(table);
}

