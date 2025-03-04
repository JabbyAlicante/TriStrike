import Home from './pages/home'
import PageNotFound from './pages/pageNotFound';
import SPA from './core/spa';
import Page from './pages/page';

import './styles/common.css';

/**
 * Create an instance of SPA
 *
 */
const app = new SPA({
  root: document.getElementById('app'),
  defaultRoute: PageNotFound,
});

// our home page. by default you could define routes using string
app.add('/', Home);

// or, you could also define a route using Regular Expression with or without named groups
app.add(/\/pages\/(?<id>\d+)/i, Page);

// Ensure our app is running
app.handleRouteChanges();

