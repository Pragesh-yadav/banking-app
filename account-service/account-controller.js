const express = require('express');
const accountrouter = express.Router();
const accountDao = require('./account-dao');

accountrouter.post('/createnewaccount', (req, res) => {
    let newAccount = req.body;
   
   
    accountDao.createNewAccount(newAccount, res)
              .then()
              .catch((err) => console.log(`Error in creating new account for username ${newAccount.fullName}: ` + err));
});

accountrouter.post('/transferamount', (req, res) => {
    let transferAmount = req.body;
    transferAmount.amount=transferAmount.amount*100;
    if (isSameAccountNo(transferAmount.fromAccountId, transferAmount.toAccountId, res)) return;
    
    accountDao.transferAmount(transferAmount, res, req.header('x-auth-token'))
              .then()
              .catch((err) => console.log(`Error in transaction from ${transferAmount.fromAccountId} to ${transferAmount.toAccountId}
               of amount ${transferAmount.amount}: ` + err));
});


function isSameAccountNo(accountNo_1, accountNo_2, res) {
    if (accountNo_1 === accountNo_2) {
        console.log(`Transaction cannot be done on same account, from ${accountNo_1} to ${accountNo_2}`);
        res.status(400).send({
            messageCode: 'INVOPR',
            message: 'Operation cannot be done on same account no.'
        });
        return true;
    }
    return false;
}

module.exports = accountrouter;