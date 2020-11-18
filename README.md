# Reactive WordPress Comments (by Nativ3.io)

## About the plugin
* Simplified comment plugin using WP REST and React
* Auto replace WP comment function(with id="comments"), no settings needed

## Requirement
* WP REST API must be enabled
* Allow new comment on posts or pages
* Gutenberg must be active

## Development
* Download the base directory `react-wp-comments` to plugins folder of your local dev server
* Activate the plugin & check your page for React welcome message 
* Problems? Check settings in files: `react-wp-comments.php` and `assets/js/main.js`
* Works? start the tooling below & try the other snippets in `src/index.js`

## Tooling
* First, run `npm install` inside the base directory of this plugin. This will install all NPM Modules listed in the package.json file. 
* Next, run `npm run dev` to watch the `src/index.js` file for changes and compile everything into `assets/js/main.js` and `assets/css/main.css`
* Finally, you can use `npm run build` to just compile the `src/index.js` file into `assets/js/main.js` and `assets/css/main.css`.

## Roadmap
* Pagination / lazy loading
* Custom comment location
* Shortcode available
* Preset and custom styling
* Internationalization
* Custom labels
* Upload avatar
* Remember user details