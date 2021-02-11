const mongoose = require('mongoose');
const accountSchema = require('./account-schema-model').mongoAccountSchema;
const AccountModel = mongoose.model('Account', accountSchema);
const config = require('config');

const dbUrl = config.get('mongodb-config.protocol') + config.get('mongodb-config.host') + config.get('mongodb-config.port') + config.get('mongodb-config.db');

var accountNumberBase = 452300011000;

mongoose.connect(dbUrl, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
    .then(console.log('connected to mongo database....'))
    .catch(err => console.log('unable to connect, please check your connection....' + err));

const createNewAccount = async (accountDetails, response) => {
    accountDetails.closingBalance= accountDetails.closingBalance*100;
    let newAccount = new AccountModel({
            fullName: accountDetails.fullName,
            emailId: accountDetails.emailId,
            dateOfBirth: accountDetails.dateOfBirth,
            password: accountDetails.password,
            phoneNo: accountDetails.phoneNo,
            accountType: accountDetails.accountType,
            address: accountDetails.address,
        accountNo: accountNumberBase++,
        closingBalance: accountDetails.closingBalance,
        createdOn: Date.now(),
        lastActive: Date.now(),
        payees: [],
        isClosed: false,
        closedOn: null
    });

    await newAccount.save((err, result) => {
        if (err) {
            accountNumberBase--;
            console.log(`Error in creating new account for fullName ${accountDetails.fullName}: ` + err);
            return response.status(400).send({
                messageCode: new String(err.errmsg).split(" ")[0],
                message: 'Unable to create new account for fullName ' + accountDetails.fullName
            });
        }
        console.log('Account has been created with account no. ' + result.accountNo + 'for user with fullName ' + result.fullName);
        return response.send({
            messageCode: 'ACCR',
            message: 'Account has been successfully created.',
            accountNo: result.accountNo,
            closingBalance: result.closingBalance
        });
    });
}

const transferAmount = async (transferAmount, response) => {
    let fromaccountNo = transferAmount.fromAccountId
    let toaccountNo= transferAmount. toAccountId;
   let amount_tobe_transferrred=  transferAmount.amount
   
    let fromResult = await AccountModel.findOne({ accountNo: fromaccountNo, isClosed: false }, (fromErr, fromResult) => {
        if (fromErr || !fromResult) {
            console.log('Error in retrieving account: ' + fromErr);
            return response.status(400).send({
                messageCode: 'ACCRE',
                message: 'Unable to retrieve account with account no. ' + accountNo
            });
        }
    });
    let fromClosingBalance = parseFloat(fromResult.closingBalance);
    let transactionAmount = parseFloat(amount_tobe_transferrred);
    if (fromClosingBalance >= transactionAmount) {
        let toResult = await AccountModel.findOne({ accountNo: toaccountNo, isClosed: false }, (toErr, toResult) => {
            if (toErr || !toResult) {
                console.log('Error in retrieving account: ' + toErr);
                return response.status(400).send({
                    messageCode: 'ACCRE',
                    message: 'Unable to retrieve account with account no. ' + toaccountNo
                });
            }
        });
        let toClosingBalance = parseFloat(toResult.closingBalance);
        
        await AccountModel.updateOne({ accountNo: toaccountNo }, { $set: { closingBalance: toClosingBalance + transactionAmount } }, (toTransactionErr, toResult) => {
            if (toTransactionErr || !toResult) {
                console.log('Error in transaction: ' + toTransactionErr);
                return response.status(400).send({
                    messageCode: 'ACCTRANE',
                    message: 'Unable to retrieve account with account no. ' + toaccountNo
                });
            }
        });
        await AccountModel.updateOne({ accountNo: fromaccountNo }, { $set: { closingBalance: fromClosingBalance - transactionAmount } }, (fromTransactionErr, fromResult) => {
            if (fromTransactionErr || !fromResult) {
                console.log('Error in transaction: ' + fromTransactionErr);
                return response.status(400).send({
                    messageCode: 'ACCTRANE',
                    message: 'Unable to retrieve account with account no. ' + fromaccountNo
                });
            }
        });

        
        console.log('Transaction completed from ' + fromaccountNo + ' to ' + toaccountNo + ' of amount ' + amount_tobe_transferrred);
        return response.send({
            messageCode: 'ACCTRANC',
            message: 'Transaction completed from ' + fromaccountNo + ' to ' + toaccountNo + ' of amount ' + amount_tobe_transferrred
        });
    } else {
        return response.send({
            messageCode: 'ACCINSF',
            message: 'Insufficient fund for transaction'
        });
    }
}



module.exports = {
    createNewAccount,
    transferAmount
}