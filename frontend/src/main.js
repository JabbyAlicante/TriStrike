import Home from './pages/landing_page'
import LogSignUpPage from './components/logSignUp';
import PageNotFound from './pages/pageNotFound';
import SPA from './core/spa';



const app = new SPA({
  root: document.getElementById('app'),
  defaultRoute: PageNotFound,
});


app.add('/', Home);
app.add('/', LogSignUpPage);



app.handleRouteChanges();

