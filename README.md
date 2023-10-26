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
