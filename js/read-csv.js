function handleFiles(files) {
	// Check for the letious File API support.

	if (window.FileReader) {
		// FileReader are supported.

		/* // File size limiting
		let size = (files[0].size / 1024 / 1024).toFixed(2);
		if (size > 4 || size < 2) {
			alert("File must be between the size of 2-4 MB but here we have " + size + " MB");
		} else {
			alert("File size - " + size)
		} */
		var output = []
		if (files.length) {
			for (let i = 0; i < files.length; i++) {
				let currFileContent = getAsText(files[i])
				loadHandler(currFileContent, i)
			}
		} else {
			return alert('Kindly upload the file...!')
		}


	} else {
		alert('FileReader are not supported in this browser.');
	}
}

function getAsText(fileToRead) {
	let reader = new FileReader();
	return new Promise((resolve, reject) => {
		// Handle errors load
		reader.onload = event => resolve(event)
		reader.onerror = error => reject(errorHandler())

		// Read file into memory as UTF-8   
		reader.readAsText(fileToRead)
	})

	/* 	reader.onload = loadHandler;
		reader.onerror = errorHandler;
		reader.readAsText(fileToRead); */
}

function loadHandler(event, i) {
	//Target file content found
	let csv = event.target.result;

	//Save encrypted content in Browser
	let output = document.getElementById('output')
	var enc = window.btoa(csv);
	output.setAttribute("csv" + i, enc);
}

function confirmPrompt(promptContent) {
	if (confirm(promptContent)) {
		// Pressed ok Return true
		return true
	} else {
		// Pressed ok Return false
		return false
	}
}


function readFileAsync(file) {
	return new Promise((resolve, reject) => {
		let reader = new FileReader();

		reader.onload = () => {
			resolve(reader.result);
		};

		reader.onerror = reject;

		reader.readAsArrayBuffer(file);
	})
}

function arrayBufferToString(arrayBuffer, decoderType = 'utf-8') {
	let decoder = new TextDecoder(decoderType);
	return decoder.decode(arrayBuffer);
}

function processFile(file) {
	return new Promise(async (resolve, reject) => {
		try {
			let arrayBuffer = await readFileAsync(file).then(function (data) {
				return data
			}).catch((err) => { console.error(err); });
			let currFileData = arrayBufferToString(arrayBuffer);
			console.log('currFileData', currFileData)
			resolve(currFileData)
		} catch (err) {
			console.log(err);
		}
	})

}

async function finalManupulation() {
	let file = document.getElementById('csvFileInput');

	let outputContents = []
	if (file.files.length) {
		for (let i = 0; i < file.files.length; i++) {
			/* 			let currFileContent = getAsText(files[i])
						loadHandler(currFileContent, i) */
			let currContent = await processFile(file.files[i]);
			outputContents.push(currContent)
		}
	} else {
		return alert('Kindly upload the file...!')
	}

	console.log('outputContents', outputContents)

	let updatedDataObj = {}
	let userAcceptent = true
	/* 	let allAttr = document.getElementById('output').attributes
		var allAttrNames = Object.value(fileContents)
		let csvContentAttr = allAttrNames.filter(function (attrName) {
			if (attrName.includes('csv')) {
				return attrName
			}
		}); */
	for (let i = 0; i < outputContents.length; i++) {
		let currData = outputContents[i]
		/* 		let enc = document.getElementById('output').getAttribute(currData);
				let csv = window.atob(enc); */
		let csv = currData
		let selectedType = document.getElementById("mySelect").value;
		let promptContent = "Type is not mentioned, can we continue..!"
		if (!csv) {
			return alert('Kindly upload the file...!')
		}
		if (!selectedType) {
			userAcceptent = confirmPrompt(promptContent)
		}
		if (userAcceptent) {
			console.log('csv', csv)
			let csvObj = Papa.parse(csv, { header: true })
			let arrayOfData = csvObj.data
			if (arrayOfData.length) {
				let errRowNumb = []
				if (csvObj.errors) {
					let err = csvObj.errors
					for (let i = 0; i < err.length; i++) {
						errRowNumb.push(err[i].row)
					}
				}
				for (let i = 0; i < errRowNumb.length; i++) {
					arrayOfData.splice(errRowNumb[i], 1)
				}
				if (selectedType) {
					updatedDataObj = arrayOfData.map(function (elem) {
						return {
							...elem,
							Types: selectedType
						}
					});
				} else {
					updatedDataObj = arrayOfData
				}
				console.log(updatedDataObj)
				drawOutputAsObj(updatedDataObj)
				drawDynamicMapping(updatedDataObj)

				let output = document.getElementById('output')
				var enc = window.btoa(JSON.stringify(updatedDataObj));
				output.setAttribute('csvJson', enc)

			} else {
				console.log('no rows found')
			}
		} else {

		}
	}

}


function errorHandler(evt) {
	if (evt.target.error.name == "NotReadableError") {
		alert("Canno't read file !");
	}
}

function drawOutput(arr) {
	let headerLen = arr[0]
	let jsonArr = []
	let primeCol = ['Ticket ID', 'Text Identifier', 'phone']


	let primeColNumber = {}

	for (let i = 0; i < headerLen.length; i++) {
		for (let j = 0; j < primeCol.length; j++) {
			if (headerLen[i].includes(primeCol[j])) {
				primeColNumber[headerLen[i]] = j
			}
		}
	}
	let reqField = Object.keys(primeColNumber)
	if (reqField.includes('Ticket ID')) {
		for (let k = 0; k < arr.length; k++) {
			let emailField = primeColNumber['Ticket ID']
			let cat = primeColNumber['Text Identifier'] || 0
			let jsonData = {}
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
	let table = document.createElement("table");

	//for the table headings
	let tableHeader = table.insertRow(-1);
	Object.keys(lines[0]).forEach(function (key) {
		let el = document.createElement("TH");
		el.innerHTML = key;
		tableHeader.appendChild(el);
	});

	//the data
	for (let i = 0; i < lines.length; i++) {
		let row = table.insertRow(-1);
		Object.keys(lines[0]).forEach(function (key) {
			let data = row.insertCell(-1);
			data.appendChild(document.createTextNode(lines[i][key]));
		});
	}

	document.getElementById("output").appendChild(table);
}

function drawDynamicMapping(updatedJson) {
	try {
		if (updatedJson) {
			/* 	let option = { url: urls.fetchFreshDeskFields }
				console.log(httpFlow.fetchGet(option)) */
			document.getElementById('dynamic').innerHTML = ""
			document.getElementById('init').remove();
			let btnWrapper = document.createElement('div');
			btnWrapper.innerHTML = '<button id="final" type="button" onclick="mapFlow()">Try it</button>'
			document.getElementsByTagName('body')[0].appendChild(btnWrapper.getElementsByTagName('button')[0])
			let selectables = Object.keys(updatedJson[0])
			let selectTemplate = template.fullSectionWithLabel
			let optionTemplate = template.option
			let freshWorkFields = ['Ticket', 'Phone', 'tage3', 'tage4', 'tage5']
			let updatedMapperView = []
			for (let i = 0; i < freshWorkFields.length; i++) {
				let htmlString = selectTemplate
				let selectWrapper = document.createElement('div');
				selectWrapper.setAttribute('class', 'notReq')
				selectWrapper.innerHTML = htmlString
				selectWrapper.getElementsByTagName('strong')[0].innerHTML = freshWorkFields[i] + ': '
				selectWrapper.getElementsByTagName('label')[0].setAttribute('for', freshWorkFields[i])
				selectWrapper.getElementsByTagName('select')[0].setAttribute('id', freshWorkFields[i])
				for (let j = 0; j < selectables.length; j++) {
					let optionWrapper = document.createElement('div');
					optionWrapper.setAttribute('class', 'notReq')
					optionWrapper.innerHTML = optionTemplate
					optionWrapper.getElementsByTagName('option')[0].setAttribute('value', selectables[j])
					optionWrapper.getElementsByTagName('option')[0].innerHTML = selectables[j]
					selectWrapper.getElementsByTagName('select')[0].appendChild(optionWrapper.getElementsByTagName('option')[0])
				}
				updatedMapperView.push(selectWrapper)
				document.getElementById('dynamic').appendChild(selectWrapper)
			}
			/* 	let resetBtnWrapper = document.createElement('div');
				resetBtnWrapper.innerHTML = '<button type="button" onclick="finalManupulation()">Reset</button>'
				document.getElementsByTagName('form')[0].appendChild(resetBtnWrapper.getElementsByTagName('button')[0]) */
			document.getElementsByClassName("notReq").outerHTML = document.getElementsByClassName("notReq").innerHTML
			console.log('updatedMapperView', updatedMapperView)
		} else {
			console.log('Oops, Something Worng....!')
		}

	} catch (error) {
		console.log(error)
	}
}

function mapFlow() {
	try {
		let options = {}
		let enc = document.getElementById('output').getAttribute('csvJson');
		let csv = JSON.parse(window.atob(enc))
		let selectedMaps = document.getElementById('dynamic')
		let arrOfSelect = selectedMaps.getElementsByTagName("select")
		let valueArr = []
		let duplicateArr = []
		let sameFieldMapp = []
		for (let i = 0; i < arrOfSelect.length; i++) {
			if (arrOfSelect[i].value) {
				valueArr.push(arrOfSelect[i].value)
			}
		}

		duplicateArr = findDuplicates(valueArr)

		for (let i = 0; i < arrOfSelect.length; i++) {
			if (arrOfSelect[i].value) {
				csv = csv.map(function (obj) {
					//obj[arrOfSelect[i].getAttribute('id')] = obj[arrOfSelect[i].value]; // Assign new key 
					if (arrOfSelect[i].getAttribute('id').toLowerCase() == arrOfSelect[i].parentElement.children[0].getAttribute('for').toLocaleLowerCase()) {
						sameFieldMapp.push(arrOfSelect[i].getAttribute('id').toLowerCase())
						return obj;
					}
				});
			}
		}

		if (sameFieldMapp.length) {
			alert('same value mapped with same fileds ' + sameFieldMapp.join())
		} else {
			if (duplicateArr.length > 0) {
				alert('same value mapped with different fileds ' + duplicateArr.join())
			} else {
				for (let i = 0; i < arrOfSelect.length; i++) {
					if (arrOfSelect[i].value) {
						csv = csv.map(function (obj) {
							obj[arrOfSelect[i].getAttribute('id')] = obj[arrOfSelect[i].value]; // Assign new key 
							delete obj[arrOfSelect[i].value]; // Delete old key 
							return obj;
						});
					}
				}
				options.url = urls.fetchFreshDeskFields
				console.log(options, 'option')
				/* httpFlow.get(options) */
				drawOutputAsObj(csv)
			}
		}


	} catch (error) {

	}
}

function findDuplicates(arr) {
	let sorted_arr = arr.slice().sort(); // You can define the comparing function here.
	// JS by default uses a crappy string compare.
	// (we use slice to clone the array so the
	// original array won't be modified)
	let results = [];
	for (let i = 0; i < sorted_arr.length - 1; i++) {
		if (sorted_arr[i + 1] == sorted_arr[i]) {
			results.push(sorted_arr[i]);
		}
	}
	return results;
}

