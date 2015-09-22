module.exports = [
  { resources: '/events', permissions: ['get', 'post', 'delete'] },
  { resources: '/event/:id', permissions: ['get', 'put', 'delete'] },

  { resources: '/campaigns', permissions: ['get'] },
  { resources: '/campaigns/:id', permissions: ['get'] },

  { resources: '/leads', permissions: ['get'] },
  { resources: '/leads/:id', permissions: ['get'] },
  { resources: '/leads/csv', permissions: ['get'] },

  { resources: '/users', permissions: ['get'] },
  { resources: '/users/:id', permissions: ['get', 'put'] },
  { resources: '/users/:id/setting/type', permissions: ['put'] },
  { resources: '/users/:id/setting/status', permissions: ['put'] },
  { resources: '/users/:id/setting/password', permissions: ['put'] },
  { resources: '/users/states/:id', permissions: ['put'] },
  { resources: '/users/check_password', permissions: ['post'] },

  { resources: '/layouts', permissions: ['get'] },
  { resources: '/layouts/:id', permissions: ['get'] },

  { resources: '/logout', permissions: ['get'] },

  { resources: '/profile', permissions: ['get'] },

  { resources: '/schema/:model', permissions: ['get'] },

  { resources: '/accounts/lead_count/:id', permissions: ['get'] },

  { resources: '/apps', permissions: ['get'] },
  { resources: '/apps/:id', permissions: ['get'] },

  { resources: '/themes', permissions: ['get', 'post'] },
  { resources: '/themes/:id', permissions: ['put', 'delete', 'get'] },

  { resources: '/emailing/contact_support', permissions: ['post'] },
  { resources: '/emailing/send_feedback', permissions: ['post'] },
  { resources: '/users/reset_password', permissions: ['post'] },
  { resources: '/users/resend_activation', permissions: ['post'] },

  { resources: '/validate/:type', permissions: ['get'] },

  { resources: '/forms', permissions: ['get', 'post'] },
  { resources: '/forms/:id', permissions: ['get', 'put', 'delete'] }
];
