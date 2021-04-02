
require('dotenv').config();

const app = require('./server/server');

require('./database');


app.listen(app.get('port'), () => {
  console.log('Server on port ',app.get('port'));
 // console.log('Environment:', process.env.NODE_ENV);
});