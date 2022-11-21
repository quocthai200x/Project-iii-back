var mongoose = require("../../infrastructure/db");
const { Schema } = require('mongoose');
var applicationDictionary = require("../../config/dictionary/application")
let NameValueSchema = new Schema({
    name: String,
    value: Number
})

let ReviewSchema = new Schema({
    content: String,
    rate: Number,
    
}, { timestamps: true })

let ApplicationSchema = new Schema({
    jobId:{ type: Schema.Types.ObjectId, ref: 'Job' },
    companyId:{ type: Schema.Types.ObjectId, ref: 'Company' },
    candidateId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {type: NameValueSchema, default: applicationDictionary.status[0] },
    createdBy: Number,
    isApproved: {type: Boolean, default: false},
    isClose: {type: Boolean, default: false},
    companyComment: ReviewSchema,
    candidateComment: ReviewSchema,

}, { timestamps: true })

ApplicationSchema.index({candidateId: 1})
ApplicationSchema.index({companyId: 1})
ApplicationSchema.index({jobId: 1, candidateId: -1})
ApplicationSchema.index({_id: 1, companyId: 1, isClose: 1, isApproved: 1})

var Application= mongoose.model("Application", ApplicationSchema)
module.exports = Application;