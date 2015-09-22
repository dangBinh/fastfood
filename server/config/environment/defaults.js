module.exports = {


  timestamp: '1426704140101',


  // Snap engage login

  snapengage: {
    username: 'ifemiadetayo@outlook.com',
    url: 'http://snapengage.com'
  },

  // Domain
  domain: 'admin',

  // Environment
  end: 'default',

  // Debug mode - enable to show console logs
  debugMode: true,

  // Port which the service is running on
  port: process.env.NODE_ENV || process.env.PORT || 3001,

  // Language
  lang: 'en',

  // Access tokens

  secret: "5O4Vvr9SJZjg4lF61jMqkfy7MM88urvs",

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'jff-main-secret'
  },

  // configs

  email : {
    from: 'no-reply@just-fastfood.com',  //to be changed
    fromName: 'Just-FastFood'
  },

  redis: {
    host: 'beardfish.redistogo.com',
    port: '10578',
    user: 'redistogo',
    pass: 'c274cdc97dfdbd257b8cd3511a272ad5'
  },

  s3: {
    key: '',
    secret: '',
    region: 'eu-west-1'
  }
};
