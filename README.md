# Brisbane Web Developer's simple Node.js website

## How to use

### Install Node.js if you have not

https://nodejs.org/en/

### Download ZIP

Better than `git pull` as you should have your own Git Repository for your own situation.

### Execute the followings on terminal (This step takes time)

```
sudo npm update -g
npm install --global gulp-cli
npm install
```

### Comment the following lines

in node_modules/bootstrap/scss/utilities/_text.scss if it exists:

```
.text-hide {
  @include text-hide();
}
```

### Install self-signed SSL Certificate

#### Windows

1. Open Control Panel.
2. Search "cert".
3. Select "Manage computer certificates".
4. Navigate the folder "Trusted Root Certification Authorities" > "Certificates"
    (Click the folder).
5. Right-Click the folder and select "All Tasks" > "Import...".
6. Import the file "ssl/httpd-selfsigned.crt".
7. (Important) Exit Chrome (or your web browser).

#### MacOS

Import Root Certificate with KeyChain Application.

### Finally

```
cp config.example.js config.js
gulp
```

Open https://localhost:8080/

## How to run on Production Environment

`gulp build` generates the compressed version of CSS file and JS file. I decided do this because the compression process takes too long for the development work. After that, [forever](https://www.npmjs.com/package/forever) or smilar program should keep your website running.

## References

- [Basic node.js server without express, returning HTML contents instead plain text.](https://gist.github.com/timbergus/5812357)
- [Simple HTTP Server and Router in node.js](https://gist.github.com/jeffrafter/353700)

### How to determine path to deep outdated/deprecated packages (NPM)?

When you see `WARN deprecated` on `npm install`.

http://stackoverflow.com/questions/36329944/how-to-determine-path-to-deep-outdated-deprecated-packages-npm/36335866#36335866

```shell
npm install -g npm-check-updates
ncu -u
```

### gulp does not work

Reinstall the package after clearing the cache for npm may resolve the issue.

```shell
rm -rf node_modules packaege-lock.json
rm -rf package-lock.json
npm cache clean --force
npm install
```
