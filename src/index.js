// The two lines below run React without JSX - no tooling needed
// Note: They run from main.js initially, and are overwritten when the tooling is activated

import App from './App'
import { Provider } from "./context";

wp.element.render(<Provider><App /></Provider>, document.getElementById( 'comments' ) );