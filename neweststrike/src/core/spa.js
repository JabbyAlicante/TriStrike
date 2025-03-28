import { io } from 'socket.io-client';

class SPA {
  /**
   * @typedef {Object} Route
   * @property {string | RegExp} key
   * @property {Function} callback
   */
  routes = [];

  socket = null;
  isConnected = false;
  shouldIgnoreState = true;

  async initializeSocket(serverUrl) {
    if (typeof window === 'undefined') return;

    if (window.__IO__) {
      this.socket = window.__IO__;
      this.isConnected = true;
      console.log('✅ Using existing socket instance');
      return;
    }

    // ✅ Support for master/slave URL
    const socketUrl = serverUrl || window.location.origin;

    window.__IO__ = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true, // ✅ Enable auto-reconnection
      reconnectionAttempts: 5, // ✅ Try reconnecting 5 times
      reconnectionDelay: 1000, // ✅ Delay between attempts (1 second)
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
    });

    // ✅ Handle state updates from master server
    this.socket.on('state_update', (state) => {
      if (!this.shouldIgnoreState) {
        console.log('🔄 State update received:', state);
        this.execute(window.location.pathname, state);
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
      callback: (config?.defaultRoute || (() => { })).bind(this.context),
    };

    // ✅ Initialize socket connection with custom server URL
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
    const route = this.get(path);
    let params;

    if (route?.key instanceof RegExp) {
      params = route.key.exec(window.location.pathname);

      if (params?.groups && Object.keys(params?.groups).length > 0) {
        params = params.groups;
      } else {
        params = Array.from(params);
        params?.shift();
      }
    }

    // ✅ Pass socket, params, and state to the callback
    route?.callback(this.socket, params, this.context.root, state);
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

  enableStateUpdates() {
    this.shouldIgnoreState = false;
  }

  disableStateUpdates() {
    this.shouldIgnoreState = true;
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
                    focusElem &&
                      setTimeout(() => {
                        focusElem.scrollIntoView({
                          behavior: 'smooth',
                          block: 'end',
                          inline: 'nearest',
                        });
                      }, 500);
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
