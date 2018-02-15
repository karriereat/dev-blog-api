const pify = require('pify');

const clone = pify(require('git-clone'));
const fm = require('front-matter');
const fs = require('fs');
const highlightjs = require('highlight.js');
const marked = require('marked');
const micro = require('micro');
const { resolve } = require('path');
const rimraf = pify(require('rimraf'));

const readDirectory = pify(fs.readdir);
const readFile = pify(fs.readFile);
const { send } = micro;

const REPOSITORY_URL = 'https://github.com/karriereat/dev-blog.git';
const REPOSITORY_PATH = resolve(process.cwd(), 'repository');

const renderer = new marked.Renderer();
renderer.code = (code, language) => {
    const validLang = !!(language && highlightjs.getLanguage(language));
    const highlighted = validLang ? highlightjs.highlight(language, code).value : code;
    return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
};
marked.setOptions({ renderer });

async function cloneGitHubRepository() {
    await rimraf(REPOSITORY_PATH);
    return clone(REPOSITORY_URL, REPOSITORY_PATH);
}

async function listPosts() {
    const files = await readDirectory(`${REPOSITORY_PATH}/_posts`);
    return files.map(file => file.slice(0, -3));
}

async function readImage(path) {
    return readFile(`${REPOSITORY_PATH}${path}`);
}

async function readPost(slug) {
    const markdown = await readFile(`${REPOSITORY_PATH}/_posts/${slug}.md`, 'utf8');
    const { attributes, body } = fm(markdown);
    const html = marked(body);
    return {
        attributes,
        html,
    };
}

const server = micro(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.url === '/posts') {
        return send(res, 200, await listPosts());
    }

    if (req.url.indexOf('/assets/images/') === 0) {
        const slug = req.url;
        send(res, 200, await readImage(slug));
    }

    if (req.url.indexOf('/posts/') === 0) {
        const slug = req.url.split('/')[2];
        send(res, 200, await readPost(slug));
    }
});

module.exports = cloneGitHubRepository()
    .then(() => {
        const port = process.env.PORT || 4000;
        server.listen(port);
        console.log(`Server listening on localhost:${port}`);
        return server;
    });
