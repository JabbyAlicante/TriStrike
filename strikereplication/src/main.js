import Landing from './pages/landing_page.jsx';
import LoginSignup from './pages/logSignUp_pages.js';
import Login from './pages/login_page.js';
import SignUp from './pages/signUp_page.js';
import Home from './pages/home_page.js';
import Dashboard from './pages/dashboard_page.js';
import StoreStrike from './pages/store_page.js';
import PageNotFound from './pages/pageNotFound.js';
import SPA from './core/spa.js';

const app = new SPA({
  root: document.getElementById('app'),
  defaultRoute: (socket, root) => new PageNotFound({ socket, root }),
});

app.add('/', (socket, params, root) => Landing(socket, params, root));
app.add('/login-signup', (socket, root) => LoginSignup(root, socket));

app.add('/login', (socket, root) => {
  const attemptLogin = (retries = 0) => {
    if (socket && socket.connected) {
      new Login({ root, socket }); 
    } else if (retries < 5) {
      console.warn(`⚠️ Socket not connected, retrying... (Attempt ${retries + 1})`);
      setTimeout(() => attemptLogin(retries + 1), 500 * (retries + 1)); 
    } else {
      console.error("❌ Failed to connect to socket after multiple attempts");
    }
  };

  attemptLogin();
});


app.add('/signup', (socket, params, root) => new SignUp({ root, socket, params }));
app.add('/home', (socket, params, root) => new Home({ root, socket, params }));
app.add('/dashboard', (socket, params, root) => new Dashboard({ root, socket, params }));
app.add('/store', (socket, params, root) => new StoreStrike({ root, socket, params }));

app.setRouteGuard('/dashboard', (state) => {
  if (!state?.isLoggedIn) {
    console.warn('⚠️ User not authenticated. Redirecting to /login');
    app.redirect('/login');
    return false;
  }
  return true;
});

app.setRouteGuard('/store', (state) => {
  if (!state?.isLoggedIn) {
    console.warn('⚠️ User not authenticated. Redirecting to /login');
    app.redirect('/login');
    return false;
  }
  return true;
});


app.setOnStateChange((state) => {
  if (import.meta.env.MODE === 'development') {
    console.log('🔄 State updated:', state);
  }
  if (!state?.isLoggedIn) {
    app.redirect('/login');
  }
});


app.setOnDisconnect(() => {
  console.log('⚠️ Connection lost! Redirecting to login...');
  app.redirect('/login');
});


app.add(/^\/profile\/(?<id>\d+)$/, (socket, params, root) => {
  root.innerHTML = `<h1>Profile ID: ${params.id}</h1>`;
});

app.add('.*', (socket, params, root) => new PageNotFound({ socket, root }));

app.handleRouteChanges();
