GITHUB_TOKEN=''; // Replace with your Github token
GITHUB_USERNAME=''; // Replace with your Github username
// Login to Github and get auth token
document.getElementById('login').addEventListener('click', function() {
    console.log("running");
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
            
            GITHUB_TOKEN = token;
            // Successful login, switch the screen
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('postLoginScreen').style.display = 'block';

            fetchReposWithToken(token);
            return fetchGitHubUserDetails(token);
        })
        .then(username => {
            GITHUB_USERNAME = username;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});


// helper function to get token
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

// fetch repos from current user
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


function fetchGitHubUserDetails(token) {
    return fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `token ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch user details.');
        }
        return response.json();
    })
    .then(user => {
        return user.login;  // The 'login' property contains the username
    });
}


document.getElementById('fetchButton').addEventListener('click', fetchData);

// fetch data from Cohere API
function fetchData() {
    // Get the value from the input field
    const text = document.getElementById('issueInput').value;
    //const cohere_api_key = document.getElementById('cohereAPI').value;
    const cohere_api_key = COHERE_API_KEY;
    const repo = document.getElementById('reposList').value;

    // Construct the URL with the query parameter
    const url = 'http://localhost:8000/data?cohere_api_key=' + encodeURIComponent(cohere_api_key) + '&text=' + encodeURIComponent(text) + '&repo=' + encodeURIComponent(repo);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const output = data.summary;
            const points = output.split("\n").map(point => {
                const trimmedPoint = point.trim();
                return trimmedPoint.length > 2 ? trimmedPoint.substring(2) : trimmedPoint;
            });
            // create issues in repo
            createIssuesWithToken(GITHUB_TOKEN, repo, points);
        });
}

// create issues on Github
function createIssuesWithToken(token, repoName, issueTitles) {
    // Get the authenticated user's repos URL directly
    const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/issues`;
    const createdIssuesList = document.getElementById('createdIssuesList'); // Get the list element

    issueTitles.forEach(title => {
        const issueData = {
            title: title
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(issueData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to create issue with title: ${title}`);
            }
            return response.json();
        })
        .then(issue => {
            console.log(`Successfully created issue #${issue.number}: ${title}`);

            // Create a new list item for the issue and append it to the list
            const li = document.createElement('li');
            li.innerHTML = `<h3><a href="${issue.html_url}" target="_blank">Issue #${issue.number}: ${title}</a></h3>`;
            createdIssuesList.appendChild(li);
        })
        .catch(error => {
            console.error('Error creating issue:', error);
        });
    });
}


// updates character count in issue input
document.getElementById('issueInput').addEventListener('input', function() {
    const charCount = this.value.length;
    const remainingChars = 250 - charCount;
    
    let message;
    if (remainingChars > 0) {
        message = remainingChars + " more characters needed";
    } else {
        message = "Meets minimum characters needed";
    }

    document.getElementById('charCount').innerText = message;
});