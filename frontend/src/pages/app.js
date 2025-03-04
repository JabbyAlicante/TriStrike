import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from '../pages/home';
import Page from '../pages/page';
import PageNotFound from '../pages/pageNotFound';
import Navigation from './navigation';
import DefaultLayout from '../layouts/default';

function App() {
  return (
    <Router>
      <DefaultLayout>
        <Navigation />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/page" component={Page} />
          <Route component={PageNotFound} />
        </Switch>
      </DefaultLayout>
    </Router>
  );
}

export default App;
