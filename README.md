# Darcy Ibex

Ibex are hardy mountain goats, known for traversing the most difficult terrain.

And similarly, our Ibex was made to survey the difficult terrain of using distributed Solid pods for a simple social media feed. Open up the webpage, log in with a Solid Webid (get one here, if you don’t have one yet), give Ibex the default suggested permissions and the tool will show you the posts from those who are your solid friends.

You also might need to manually set some permissions to ensure that people can post comments on your posts. Go to your Solid pod, “Your Storage”, then to the Public → Darcy → activity folder and drag the Everyone persona to “Posters”.

Everything you do will be stored in your own Solid pod. If you edit it on your Solid pod, these edits will show up directly in the feed too. We will not store any information about you with this tool.

Ibex does not store any data, and everything displayed comes from the Solid pod of the users who created the post or comment in question.

As such, Ibex has only minimal safety features (you can remove undesired comments on your posts) so we do only recommend it for use with no or at least only minimal threat models.

Generally, this is a prototype, and there will be errors and issues. Report here or tweet at us if you encounter any: @DarcySocial

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
