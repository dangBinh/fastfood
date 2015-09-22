module.exports = [
  // Test resources
  { resources: '/permissions/account_admin', permissions: ['get', 'post', 'put', 'delete'] },

  { resources: '/users', permissions: ['post'] },
  { resources: '/users/:id', permissions: ['delete'] },

  { resources: '/accounts', permissions: ['put', 'delete', 'post'] },
  { resources: '/accounts/:id/profile_image', permissions: ['post']},
  { resources: '/sms/buy_number', permissions: ['post']},
  { resources: '/sms/send_callbackUrl', permissions: ['post']},
  { resources: '/sms/:id/create_sms', permissions: ['post']},
  { resources: '/sms/search_number', permissions: ['post']},
  { resources: '/sms/fetch_sms/', permissions: ['get']},
  { resources: '/sms/fetch_inbound_sms', permissions: ['get']},

  { resources: '/sms/fetch_sms/:id', permissions: ['get']},
  { resources: '/sms/purchase_credit', permissions: ['post']}
];
