const express = require('express');
const app = express();
app.use(express.json());
const accountservicerouter = require('./account-service/account-controller');
app.use('/bankingapp/api/account', accountservicerouter);
const port =  8081;
app.listen(port, ()=>{
    console.log(`Application running in ${environment} environment, listening to port ${port}....`);
});
