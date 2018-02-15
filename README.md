# karriere.at Dev Blog API

Fetch posts and assets from the karriere.at Dev Blog GitHub repository and provide them as an API.

```
npm install
npm start
```

Valid endpoints are `/posts`, `/posts/:slug` and `/assets/images/:path`.

* `/posts` lists the slugs of all posts.
* `/posts` returns the post's YAML front matter and HTML, using [highlight.js](https://highlightjs.org/).
* `/assets/images/:path` serves static images, referenced in posts.
