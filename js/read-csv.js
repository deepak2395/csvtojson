/* **************************************** */
/* **************************************** */

/* App_Name: CSV file handling,
Version 1.0.0,
Latest_Update : 27-10-2020
Latest_modifier : Deepak */

/* **************************************** */
/* **************************************** */

function readFileAsync(file) {
	return new Promise((resolve, reject) => {
		//File read through broswer
		let reader = new FileReader();
		reader.onload = () => {
			resolve(reader.result);
		};
		reader.onerror = reject;
		reader.readAsArrayBuffer(file);
	})
}

function arrayBufferToString(arrayBuffer, decoderType = 'utf-8') {
	//decode arrayBuffer to string
	let decoder = new TextDecoder(decoderType);
	return decoder.decode(arrayBuffer);
}

function processFile(file) {
	return new Promise(async (resolve, reject) => {
		// file read and decode it to string 
		try {
			let fileContents = await readFileAsync(file).then(function (data) {
				return arrayBufferToString(data);
			}).catch((err) => { console.error(err); });
			resolve(fileContents)
		} catch (err) {
			console.log(err);
			reject(err)
		}
	})

}

async function finalManupulation() {

	let file = document.getElementById('csvFileInput');

	let outputContents = []
	if (file.files.length) {
		for (let i = 0; i < file.files.length; i++) {
			// FileReader are supported.
			// File size limiting
			/* 
			let size = (files[0].size / 1024 / 1024).toFixed(2);
			if (size > 4 || size < 2) {
				alert("File must be between the size of 2-4 MB but here we have " + size + " MB");
			} else {
				alert("File size - " + size)
			} */
			let currContent = await processFile(file.files[i]).catch((err) => { console.error(err); });;
			outputContents.push(currContent)
		}
	} else {
		return alertPrompt('Kindly upload the file...!')
	}

	let updatedDataObj = {}
	let userAcceptent = true

	// multiple file hanling
	/* 	let allAttr = document.getElementById('output').attributes
		var allAttrNames = Object.value(fileContents)
		let csvContentAttr = allAttrNames.filter(function (attrName) {
			if (attrName.includes('csv')) {
				return attrName
			}
		}); */
	for (let i = 0; i < outputContents.length; i++) {
		let currData = outputContents[i]
		let csv = currData
		/* let selectedType = document.getElementById("mySelect").value;
		let promptContent = "Type is not mentioned, can we continue..!" */
		if (!csv) {
			return alertPrompt('Kindly upload the file...!')
		}
		/* 		if (!selectedType) {
					userAcceptent = await confirmPrompt(promptContent)
				} */
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
				/* if (selectedType) {
					updatedDataObj = arrayOfData.map(function (elem) {
						return {
							...elem,
							Types: selectedType
						}
					});
				} else {
					updatedDataObj = arrayOfData
				} */
				updatedDataObj = arrayOfData
				console.log(updatedDataObj)
				drawOutputAsObj(updatedDataObj)

				let newobj = jsonKeyLowerCase(updatedDataObj[0])

				let csvObjKeysLowercase = Object.keys(newobj)
				let isCsvHasTicket = true
				if (!csvObjKeysLowercase.includes('tickets')) {
					//	await alertPrompt("Ticket field missing.")
					isCsvHasTicket = await confirmPrompt("Ticket field missing. Can we continue?")
				}

				if (isCsvHasTicket) {
					drawDynamicMapping(updatedDataObj)
					let output = document.getElementById('output')
					var enc = window.btoa(JSON.stringify(updatedDataObj));
					output.setAttribute('csvJson', enc)
				}
			} else {
				console.log('no rows found')
			}
		} else {

		}
	}

}

function jsonKeyLowerCase(jsonObj) {
	try {
		var key, keys = Object.keys(jsonObj);
		var n = keys.length;
		var newobj = {}
		while (n--) {
			key = keys[n];
			newobj[key.toLowerCase()] = jsonObj[key];
		}
		return newobj
	} catch (error) {

	}

}


function errorHandler(evt) {
	if (evt.target.error.name == "NotReadableError") {
		alertPrompt("Canno't read file !");
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
	table.setAttribute('class', 'table')

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

async function drawDynamicMapping(updatedJson) {
	// creating dynamic fields based on freshwork api 
	try {
		if (updatedJson) {
			// freshwork api call
			let reqFields = ['Subject', 'Description', 'Source', 'Type']
			//let ignoreFields = ['Subject', 'Description', 'Source']
			let option = { url: urls.fetchFreshDeskFields }
			let apiResponse = await httpFlow.fetchGet(option)
			let freshWorkFields = apiResponse.filter(function (obj) {
				return reqFields.includes(obj.label_for_customers)
			}).map(function (elm) {
				return elm.label_for_customers
			})
			document.getElementById('dynamic').innerHTML = ""
			/* 			document.getElementById('init').remove();//mapFlow
						let btnWrapper = document.createElement('div');
						btnWrapper.innerHTML = '<button class="" id="final" type="button" onclick="mapFlow()">Try it</button>'
						document.getElementsByTagName('body')[0].appendChild(btnWrapper.getElementsByTagName('button')[0]) */
			document.getElementById('init').setAttribute('onclick', 'mapFlow()')
			document.getElementById('init').setAttribute('id', 'final')
			let selectables = Object.keys(updatedJson[0])
			let selectTemplate = template.fullSectionWithLabel
			let optionTemplate = template.option
			/* let freshWorkFields = ['Ticket', 'Phone', 'tage3', 'tage4', 'tage5'] */
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
			let mapWrapper = document.createElement('div');
			mapWrapper.innerHTML = '<h4 class="col-sm-offset-2 col-sm-10">Mapping Between Fields: </h4>'

			var mapper = document.getElementById("mapper");
			mapper.insertBefore(mapWrapper, mapper.childNodes[0]);
			/* 	let resetBtnWrapper = document.createElement('div');
				resetBtnWrapper.innerHTML = '<button type="button" onclick="finalManupulation()">Reset</button>'
				document.getElementsByTagName('form')[0].appendChild(resetBtnWrapper.getElementsByTagName('button')[0]) */
			document.getElementsByClassName("notReq").outerHTML = document.getElementsByClassName("notReq").innerHTML
			//console.log('updatedMapperView', updatedMapperView)
		} else {
			console.log('Oops, Something Worng....!')
		}

	} catch (error) {
		console.log(error)
	}
}

async function mapFlow() {
	//mapping functionality field name change based on mapping
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

		/* 	for (let i = 0; i < arrOfSelect.length; i++) {
				if (arrOfSelect[i].value) {
					csv = csv.map(function (obj) {
						//obj[arrOfSelect[i].getAttribute('id')] = obj[arrOfSelect[i].value]; // Assign new key 
						if (arrOfSelect[i].getAttribute('id').toLowerCase() == arrOfSelect[i].parentElement.children[0].getAttribute('for').toLowerCase()) {
							sameFieldMapp.push(arrOfSelect[i].getAttribute('id').toLowerCase())
							return obj;
						}
					});
				}
			} */

		if (sameFieldMapp.length) {
			alertPrompt('same value mapped with same fileds ' + sameFieldMapp.join())
		} else {
			if (duplicateArr.length > 0) {
				alertPrompt('same value mapped with different fileds: ' + '<strong>' + duplicateArr.join() + '</strong>')
			} else {
				for (let i = 0; i < arrOfSelect.length; i++) {
					if (arrOfSelect[i].value) {
						csv = csv.map(function (obj) {
							if (arrOfSelect[i].getAttribute('id').toLowerCase() == arrOfSelect[i].value.toLowerCase()) {
								return obj;
							} else {
								obj[arrOfSelect[i].getAttribute('id')] = obj[arrOfSelect[i].value]; // Assign new key 
								delete obj[arrOfSelect[i].value]; // Delete old key 
								return obj;
							}
						});
					}
				}

				let newobj = jsonKeyLowerCase(csv[0])

				let csvObjKeysLowercase = Object.keys(newobj)
				if (!csvObjKeysLowercase.includes('tickets')) {
					return await alertPrompt("Ticket field missing.")
					//isCsvHasTicket = await confirmPrompt("Ticket field missing. Can we continue?")
				}

				//DB update need be done here -- Bussiness logic 1
				let requests = csv.map(async obj => {
					let newobj = jsonKeyLowerCase(obj)
					let reqData = {}
					let reqFields = ['subject', 'description', 'source', 'type']
					for (let i = 0; i < reqFields.length; i++) {
						if (newobj[reqFields[i]]) {
							reqData[reqFields[i]] = newobj[reqFields[i]]
						}
					}
					options = {
						url: urls.fetchFreshUpdateFields + "/" + newobj['tickets'],
						method: 'PUT',
						data: reqData
					}
					return httpFlow.fetchPromiseAll(options)
				});

				let outputsResponse = []
				let successResponse = []
				let errResponse = []
				let successToken = []
				let failureToken = []
				await Promise.all(requests)
					.then(jsonResponses => {
						jsonResponses.forEach(jsonResponse => {
							outputsResponse.push(jsonResponse)
							if (jsonResponse.status != 200) {
								errResponse.push(jsonResponse)
								failureToken.push(jsonResponse.url.split('tickets/')[1])
							} else {
								successResponse.push(jsonResponse)
								successToken.push(jsonResponse.url.split('tickets/')[1])
							}
						})
						let trueFields = jsonResponses.filter(function (obj) {
							return obj.status == 200
						})
						return trueFields
					})
					.then(results => results.forEach(result => console.log('result', result)));
				document.getElementById("cover-spin").style.display = "none";
				console.log('apiResponse', outputsResponse)
				console.log('errResponse', errResponse)
				if (requests.length == successToken.length) {
					alertPrompt('All Tickets Success')
				} else {
					alertPrompt('Success Tickets: ' + successToken.join() + ',' + '\nFailure Tickets: ' + failureToken.join())
				}

				drawOutputAsObj(csv)
			}
		}


	} catch (error) {
		console.log('error', error)
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

function alertPrompt(params) {
	// broswer alert panel
	try {
		$.alert({
			title: 'Alert!',
			content: params,
			useBootstrap: true // Key line
		});
	} catch (error) {
		console.log(error)
	}
}

function confirmPrompt(params) {
	// Broswer confirmation panel
	return new Promise((resolve, reject) => {
		try {
			$.confirm({
				title: 'Confirm!',
				content: params,
				buttons: {
					confirm: function () {
						resolve(true)
					},
					cancel: function () {
						resolve(false)
					}
				},
				useBootstrap: true // Key line
			});
		} catch (error) {
			console.log(error)
		}
	})
}

function restPage(params) {
	try {
		window.location.reload()
	} catch (error) {
		console.log(error)
	}
}