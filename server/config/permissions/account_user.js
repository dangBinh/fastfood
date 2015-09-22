module.exports = [
  // Test resources
  { resources: '/permissions/account_user', permissions: ['get', 'post', 'put', 'delete'] },

  { resources: '/accounts', permissions: ['get', 'post'] },
  { resources: '/accounts/:id', permissions: ['get', 'post', 'delete', 'put'] },


  { resources: '/leads/:id', permissions: ['put', 'delete'] },
  { resources: '/leads/:id/restore', permissions: ['put'] },
  { resources: '/leads/batch/remove', permissions: ['delete'] },

  // Capture admin routes
  { resources: '/capture', permissions: ['get', 'put', 'post'] },
  { resources: '/capture/:id', permissions: ['get', 'post', 'delete', 'put'] },
  { resources: '/capture/:id/restore', permissions: ['put'] },
  { resources: '/capture/import', permissions: ['post'] }
];
