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
        let response = await fetch(options.url)

        if (response.ok) { // if HTTP-status is 200-299
            // get the response body (the method explained below)
            return response
        } else {
            return (response.status);
        }
    }

    async function fetchPost(options) {
        let response = fetch(options.url, {
            method: 'post',
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            },
            /*  headers: new Headers(), */
            body: options.data
        })
            .then(json)
            .then(function (data) {
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
