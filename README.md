# interpolate-require-loader

Webpack loader to interpolate require requests.

Useful if you need to use a 'require' requests in some non js files.

'require' acts like normal require in js file and support full webpack syntax. 

## Installation

`npm install --save-dev interpolate-require-loader`

## Example Usage

**webpack.config.js:**

```js
module.exports = {
  entry: 'index.html',
  output: { 
    filename: '[name].[ext]',
    publicPath: '',
  },
  module: {
    rules: [{
      test: /\.html$/,
      use: [
        { loader: 'file-loader', options: { name: '[name].[ext]' } },
        'require-loader',
        'extract-loader',
        'html-loader'
      ]
    },{
      test: /\.svg$/,
      use: [
        { loader: 'file-loader', options: { name: '[name].[ext]' } },
      ]
    }]
  }
};
```

**index.html:**

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="shortcut icon" type="image/svg" sizes="any" href="require('./favicon.svg')">
    <link rel="manifest"
          href="require('!!file-loader?name=[path][name].[ext]!interpolate-require-loader!../assets/favicons/site.webmanifest')">
  </head>
  <body>
    Some content
  </body>
</html>
```

### Output

**index.html:**
```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="shortcut icon" type="image/svg" sizes="any" href="favicon.svg">
    <link rel="manifest" href="site.webmanifest">
  </head>
  <body>
    Some content
  </body>
</html>
```
