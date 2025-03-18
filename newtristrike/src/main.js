import Landing from './pages/landing_page.jsx';
import LoginSignup from './pages/logSignUp_pages.js';
import Login from './pages/login_page';
import SignUp from './pages/signUp_page.js';
import Home from './pages/home_page.js';
import Dashboard from './pages/dashboard_page.js';
import StoreStrike from './pages/store_page.js';

import PageNotFound from './pages/pageNotFound';
import SPA from './core/spa';



const app = new SPA({
  root: document.getElementById('app'),
  defaultRoute: PageNotFound,
});


app.add('/', Landing);
app.add('/login-signup', LoginSignup);
app.add('/login', Login);
app.add('/signup', SignUp);

app.add('/home', Home);
app.add('/dashboard', Dashboard);
app.add('/store', StoreStrike)



app.handleRouteChanges();

