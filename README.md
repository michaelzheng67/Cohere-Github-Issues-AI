# Github Issues AI

## Idea: A browser extension that allows you to specify a repository and write plain text about a problem that you want to solve. The extension will then automatically create github issues for you

Tech stack: 
- Cohere for "Classify" function and being able to identify what the user wants
- Github API to create issues
- Python backend
- chrome extension template: https://github.com/ClydeDz/chrome-extension-template

Architecture:
- Chrome extension client side is covered with the chrome extension template
- Frontend js communicates with python backend through HTTP requests (can build server side using flask)
- HTTP requests hits Cohere and sends it data in order to classify
- based on Cohere output, script creates issue for indicated repo

Use of Cohere:
The general idea of how we're going to accomplish this task is by using Cohere's summarizer (as well as potentially their Classifier as well). The input the user gives will always be plain text. Thus, this plain text is sent to Cohere in order for it to summarize it into succinct, actionable bullet point items. We may potentially need the classifier as well in order to predict whether the user will want a single issue or multiple that build up to the larger solution. 

Each bullet point summary is then passed to a function that creates an issue in the designated repo for a Github user.

Mockup:
![Screenshot 2023-10-27 at 8 09 22 PM](https://github.com/michaelzheng67/Cohere-Github-Issues-AI/assets/82613778/22343b88-e400-4e02-94e4-464270de6d88)

Architecture:
- The frontend of the chrome extension is pretty basic, just a webpage basically that has functionality through js functions
- have a button that calls a python endpoint that hits Cohere's API and returns bullet points that are then used to create issues on the client side that is authenticated to Github
- The Cohere API is also fed information about the codebase itself. This way, we can include more description into the issues that will allow us to give context to the issues

Setup instructions:
- create an oauth app on github to authorize the app to use your repos: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app
- set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET based on your oauth app
- create a cohere developer account: https://cohere.com
- set COHERE_API_KEY based on cohere dev account keys
- run "source venv/bin/activate" to activate virtual python environment with deps installed
- run "python server.py" to get backend endpoint running
- go to chrome and go to "manage extensions"
- select "load unpacked" and choose this project
- you should be able to run the extension now!