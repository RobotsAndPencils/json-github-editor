# json-github-editor

Modify JSON files in a GitHub repo with this structured, client-side editor that you host

## Why does this exist?

We store a configuration file for some of our infrastructure as JSON in a GitHub repo. It's always been edited by hand, often in GitHub's web editor, because pretty-printed JSON is easily human-readable and mostly easily human-editable. If a mistake was made while editing we would usually find out after trying to reload the configuration file. Some of the fields have a small set of possible values, but only certain people knew these or where to find them.

Our process was quick, easy and a little risky, as small mistakes are common and bigger ones are possible. A safer, more discoverable way to change this configuration file would be a big benefit to everyone as long as it didn't add too many extra steps.

This project aims to do just this, by taking a bunch of existing pieces and gluing them together to make something new.

## What is it?

There are just a few steps involved:

1. Authenticate the user to make sure they should have access and gain credentials to do work on their behalf
2. Fetch the JSON file and schema from GitHub
3. Allow the user to edit the configuration file with a structured editor determined by the schema
4. Present the user with a diff of the output JSON for confirmation
5. Commit the new JSON to GitHub

It's a Node.js app that serves a single web page containing the structured JSON editor. It has no other infrastructural dependencies. Most of the important code is in the web page, with a bit of support for authentication done by the server.

Host this app somewhere and anyone with read/write access to the repo containing your JSON file and schema will be able to use it.

## How does it work?

All of the important steps are performed by or strongly influenced by the following projects:

- [gatekeeper](https://github.com/prose/gatekeeper) and [micro-github](https://github.com/mxstbr/micro-github)
- [github.js](https://github.com/github-tools/github)
- [json-editor](https://github.com/jdorn/json-editor)
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)

The core idea here could probably be a single, static web page, but there are a few reasons that it isn't. First is that in order to keep OAuth secrets, well, secret, a server performs the final request to GitHub to get an access token instead of the browser. Gatekeeper and micro-github both provide turnkey solutions to this problem. The second reason, and why it's a rendered template instead of a non-static web page, is because this allows some parts of the page to be configurable as a more general solution.

## How do I help?

Please do! It's been a while since I've worked with these technologies so I'm sure it could use a lot of eyes on it. I'm curious what direct or tangential uses could come of this.

There's a few things I want for this project:

- It's made by gluing existing parts together
- It should be easy to make changes to
- It should use modern JavaScript

## Who started it?

- [Brandon Evans](https://www.github.com/interstateone)

<a href="http://www.robotsandpencils.com"><img src="R&PLogo.png" width="153" height="74" /></a>

Copyright 2017 Robots and Pencils. All rights reserved.

