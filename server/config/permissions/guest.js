module.exports = [

  { resources: '/leads', permissions: ['post'] },
  { resources: '/leads/conversion/:id', permissions: ['put'] },

  { resources: '/authenticate', permissions: ['post'] },

  { resources: '/apps/fb/:type/:appId/:pageId', permissions: ['get'] },

  { resources: '/users/forgot_password', permissions: ['post'] },
  { resources: '/users/activate', permissions: ['post'] },
  { resources: '/users/reset', permissions: ['post']},

  { resources: '/vouchers/:id/generate', permissions: ['post'] },

  { resources: '/mailgun/bounce', permissions: ['post']},
  { resources: '/mailgun/click', permissions: ['post']},
  { resources: '/mailgun/delivered', permissions: ['post']},
  { resources: '/mailgun/open', permissions: ['post']},
  { resources: '/mailgun/spam', permissions: ['post']},
  { resources: '/mailgun/unsubscribe', permissions: ['post']},
  { resources: '/sms/sms_callback', permissions:['post']},
  { resources: '/salesforce/integration', permissions:['post']},


];
