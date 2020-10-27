var httpFlow = (function () {

    function get(options) {
        return new Promise((resolve, reject) => {
            try {
                const http = new XMLHttpRequest();
                const url = options.url
                http.open("GET", url, false);
                http.setRequestHeader('Access-Control-Allow-Origin', '*');
                http.withCredentials = true;
                http.setRequestHeader("Content-Type", "application/json");
                http.send(null);

                http.onreadystatechange = (e) => {
                    if (e.readyState == 4 && e.status == 200) {
                        resolve(http.response)
                    }
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    function post(options) {
        return new Promise((resolve, reject) => {
            try {
                const http = new XMLHttpRequest()
                const url = options.url
                http.open('POST', url)
                http.setRequestHeader('Access-Control-Allow-Origin', '*');
                http.setRequestHeader('Content-type', 'application/json')
                http.send(JSON.stringify(params)) // Make sure to stringify
                http.onload = function () {
                    // Do whatever with response
                    resolve(http.response)
                }
            } catch (error) {
                reject(error)
            }
        })
    }

    async function fetchGet(options) {
        document.getElementById("cover-spin").style.display = "block";
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "VVZzRVFSRDB6Q2ExcUlTNVlHOWc=:X");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "_x_w=38_2; _x_m=x_c");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        let responseData = await fetch(options.url, requestOptions).then(function (response) {
            document.getElementById("cover-spin").style.display = "none";
            if (response.ok) {
                return response.json()
            } else {
                return response.status
            }
        }).catch(error => console.log('error', error));

        return responseData

    }

    async function fetchPost(options) {
        document.getElementById("cover-spin").style.display = "block";
        var myHeaders = new Headers();
        myHeaders.append("Authorization", "VVZzRVFSRDB6Q2ExcUlTNVlHOWc=:X");
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Cookie", "_x_w=38_2; _x_m=x_c");
        let response = fetch(options.url, {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: options.data
        })
            .then(json)
            .then(function (data) {
                document.getElementById("cover-spin").style.display = "none";
                console.log('Request succeeded with JSON response', data);
            })
            .catch(function (error) {
                return error
            });
        return response
    }



    return {
        get: get,
        post: post,
        fetchGet: fetchGet,
        fetchPost: fetchPost
    }
})();
