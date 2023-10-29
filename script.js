document.getElementById('githubLogin').addEventListener('click', function() {
    const clientID = GITHUB_CLIENT_ID;
    const clientSecret = GITHUB_CLIENT_SECRET;  // ⚠️ NEVER expose this in production
    const redirectURI = chrome.identity.getRedirectURL('github');
    const authURL = `https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=${redirectURI}&scope=repo`;

    chrome.identity.launchWebAuthFlow({
        url: authURL,
        interactive: true
    }, function(redirectURL) {
        const queryString = new URLSearchParams(new URL(redirectURL).search);
        const code = queryString.get('code');

        // Exchange the code for an access token
        exchangeCodeForToken(code, clientID, clientSecret, redirectURI)
        .then(token => {

            // Successful login, switch the screen
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('postLoginScreen').style.display = 'block';

            fetchReposWithToken(token);
        })
        .catch(error => {
            console.error('Error exchanging code for token:', error);
        });
    });
});

function exchangeCodeForToken(code, clientID, clientSecret, redirectURI) {
    return new Promise((resolve, reject) => {
        const data = new URLSearchParams();
        data.append('client_id', clientID);
        data.append('client_secret', clientSecret);
        data.append('code', code);
        data.append('redirect_uri', redirectURI);

        fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data.toString()
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                reject(result.error);
            } else {
                resolve(result.access_token);
            }
        })
        .catch(reject);
    });
}

function fetchReposWithToken(token) {
    fetch('https://api.github.com/user/repos', {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    .then(response => response.json())
    .then(repos => {
        const reposDropdown = document.getElementById('reposList');
        if (repos.length > 0) { // Check if there are repos to display
            reposDropdown.innerHTML = repos.map(repo => `<option>${repo.name}</option>`).join('');
            reposDropdown.style.display = 'block'; // Show the dropdown
        } else {
            reposDropdown.style.display = 'none'; // Hide the dropdown if no repos
        }
    })
    .catch(error => {
        console.error('Error fetching repos:', error);
    });
}

document.getElementById('fetchButton').addEventListener('click', fetchData);

function fetchData() {
    // Get the value from the input field
    const text = document.getElementById('issueInput').value;
    const cohere_api_key = document.getElementById('cohereAPI').value;
    const repo = document.getElementById('reposList').value;

    // Construct the URL with the query parameter
    const url = '/data?cohere_api_key=' + encodeURIComponent(cohere_api_key) + '&text=' + encodeURIComponent(text) + '&repo=' + encodeURIComponent(repo);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            document.getElementById('output').innerText = JSON.stringify(data.summary);
        });
}
