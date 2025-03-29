import { io } from 'socket.io-client';

class SPA {
  routes = [];
  socket = null;
  isConnected = false;
  shouldIgnoreState = true;

  beforeRouteChange = null;
  onStateChange = null;
  onDisconnect = null;
  routeGuards = {};

  //-----------------------------------connect to socket----------
  async initializeSocket(serverUrl) {
    if (typeof window === 'undefined') return;

    if (window.__IO__) {
      this.socket = window.__IO__;
      this.isConnected = true;
      console.log('✅ Using existing socket instance');
      return;
    }

    const socketUrl = serverUrl || import.meta.env.VITE_SERVER_URL || window.location.origin;

    window.__IO__ = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket = window.__IO__;
    this.isConnected = true;

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log(`✅ Connected to socket (${socketUrl})`);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('❌ Disconnected from socket');
      if (typeof this.onDisconnect === 'function') {
        this.onDisconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    this.socket.on('signup-response', (response) => {
      console.log('🆕 Signup response:', response);
      if (response.success) {
        alert('Signup successful! Welcome to the game.');
      } else {
        alert(`Signup failed: ${response.message}`);
      }
    });
    
    this.socket.on('login-response', (response) => {
      console.log('🔐 Login response:', response);
      if (response.success) {
        alert('Login successful! Welcome back.');
      } else {
        alert(`Login failed: ${response.message}`);
      }
    });
    

    // Handle state updates from master server
    this.socket.on('state_update', (state) => {
      if (!this.shouldIgnoreState) {
        console.log('🔄 State update received:', state);
        this.execute(window.location.pathname, state);
        if (typeof this.onStateChange === 'function') {
          this.onStateChange(state);
        }
      }
    });
  }

  /**
   * New SPA
   *
   * @typedef {object} SPAConfiguration
   * @property {HTMLElement} root
   * @property {Function} defaultRoute
   * @property {string} serverUrl
   *
   * @param {SPAConfiguration} config
   */
  constructor(config = {}) {
    this.context = {
      root: config?.root || document.getElementById('app'),
    };

    this.defaultRoute = {
      key: '*',
      callback: (config?.defaultRoute || (() => {})).bind(this.context),
    };

    // Initialize socket connection with custom server URL
    this.initializeSocket(config.serverUrl);
  }

  /**
   * Register route
   *
   * @param {string|RegExp} path
   * @param {Function} cb
   */
  add(path, cb) {
    this.routes.push({
      key: path,
      callback: (socket, params, root, state) =>
        cb(socket, params, root, state),
    });
  }

  /**
   * Get route
   *
   * @param {string} path
   * @returns {Route}
   */
  get(path) {
    const route = this.routes.find(
      (r) =>
        (r.key instanceof RegExp && r.key.test(path)) || r.key === path
    );
    return route || this.defaultRoute;
  }

  /**
   * Execute route
   *
   * @param {string} path
   * @param {Object} state
   */
  execute(path, state = null) {
    if (typeof this.beforeRouteChange === 'function') {
      this.beforeRouteChange(path, state);
    }

    const route = this.get(path);
    let params = {};

    if (route?.key instanceof RegExp) {
      const match = route.key.exec(path);
      if (match) {
        params = match.groups || match.slice(1);
      }
    } else {
      const queryString = window.location.search;
      const searchParams = new URLSearchParams(queryString);
      params = Object.fromEntries(searchParams.entries());
    }

    // ✅ Route guard
    if (this.routeGuards[route.key]) {
      const allow = this.routeGuards[route.key](state);
      if (!allow) {
        console.warn(`🚫 Access denied to: ${path}`);
        return;
      }
    }

    route?.callback(this.socket, params, this.context.root, state);
  }

  /**
   * Redirect route
   *
   * @param {string} path
   */
  redirect(path) {
    history.pushState({}, '', path);
    this.execute(path);
  }

  /**
   * Set default callback
   *
   * @param {Function} cb
   */
  setDefault(cb) {
    this.defaultRoute = {
      key: '*',
      callback: cb,
    };
  }

  /**
   * Enable state updates from the master server
   */
  enableStateUpdates() {
    this.shouldIgnoreState = false;
  }

  /**
   * Disable state updates from the master server
   */
  disableStateUpdates() {
    this.shouldIgnoreState = true;
  }

  /**
   * Set route guard
   *
   * @param {string|RegExp} path
   * @param {Function} callback
   */
  setRouteGuard(path, callback) {
    this.routeGuards[path] = callback;
  }

  /**
   * Set before route change hook
   *
   * @param {Function} callback
   */
  setBeforeRouteChange(callback) {
    this.beforeRouteChange = callback;
  }

  /**
   * Set state change hook
   *
   * @param {Function} callback
   */
  setOnStateChange(callback) {
    this.onStateChange = callback;
  }

  /**
   * Set disconnect hook
   *
   * @param {Function} callback
   */
  setOnDisconnect(callback) {
    this.onDisconnect = callback;
  }

  /**
   * Handle routing events
   */
  handleRouteChanges() {
    window.addEventListener('popstate', () => {
      this.execute(window.location.pathname);
    });

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        mutation?.addedNodes?.forEach((node) => {
          if (node.nodeName.toLowerCase() === 'a') {
            node.addEventListener('click', (e) => {
              try {
                const targetUrl = new URL(e.target.href);
                const target = e.target.getAttribute('target') || '_self';

                if (
                  targetUrl.origin === window.location.origin &&
                  target === '_self'
                ) {
                  e.preventDefault();
                  history.pushState({}, '', e.target.href);
                  this.execute(window.location.pathname);

                  if (targetUrl.hash) {
                    const focusElem = document.querySelector(targetUrl.hash);
                    if (focusElem) {
                      setTimeout(() => {
                        focusElem.scrollIntoView({
                          behavior: 'smooth',
                          block: 'end',
                          inline: 'nearest',
                        });
                      }, 500);
                    }
                  }
                }
              } catch (err) {
                console.error('SPA: Cannot parse target href', err);
              }
            });
          }
        });
      });
    });

    observer.observe(document, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    this.execute(window.location.pathname);
  }
}

export default SPA;
