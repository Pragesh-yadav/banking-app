const mongoose = require('mongoose');
var Schema=mongoose.Schema;
const mongoAccountSchema = new Schema({
    fullName: String,
    emailId: String,
    dateOfBirth: Date,
    password: String,
    phoneNo: String,
    accountType: String,
    address: String,
    accountNo: {type: String, unique: true},
    closingBalance: String,
    createdOn: Date,
    lastActive: Date,
    payees: [
        {
            firstname: String,
            lastname: String,
            accountNo: String
        }
    ],
    isClosed: Boolean,
    closedOn: Date
});


module.exports = {
  
    mongoAccountSchema
}