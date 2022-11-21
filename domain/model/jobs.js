var mongoose = require("../../infrastructure/db");
const { Schema } = require('mongoose');
const jobDictionary = require("../../config/dictionary/job");



let NameValueSchema = new Schema({
    name: String,
    value: Number
})

let workingAddress = new Schema({
    address: String,
    district: String,
    ward: String,
    province: String,
    latitude: Number,
    longitude: Number,
})

let SalarySchema = new Schema({
    isVisible: Boolean,
    from: Number,
    to: Number,
})



let typeSchema = new Schema({
    field: String,
    name: String,
})

let jobInfoSchema = new Schema({
    name: String,
    level: NameValueSchema,
    type: [typeSchema],
    workingAddress: [workingAddress],
    desc: String,
    requirement: String,
    salaryRate: SalarySchema,
    keyword: [String],
    languageRecruitment: [String],
    emailReceive: [String],
    outdate: Date,
})
var JobSchema = new Schema({
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    info: jobInfoSchema,
    // createBy: {type:  Schema.Types.ObjectId, ref: 'User'},
    status: { type: NameValueSchema, default: jobDictionary.status.draft },
   

}, { timestamps: true }
)

SalarySchema.index({from: 1})
SalarySchema.index({to: 1})
JobSchema.index({"info.keyword": "text", "info.name": "text"})
// JobSchema.index({})
JobSchema.index({"info.level.name": 1})

JobSchema.index({companyId: 1, "info.name": -1});
JobSchema.index({"info.workingAddress.province": 1})
JobSchema.index({"info.type.name": 1})






var Job = mongoose.model("Job", JobSchema)
module.exports = Job;


