var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var roleDictionary = require("../../config/dictionary/role")
var applicationDictionary = require("../../config/dictionary/application")
const path = require("path")
// var ValidationService = require('./validationService');
// const { validJob, validUser } = require("./validationService")


const ApplicationService = {
    getAllByUser: async(candidateId)=>{
        const applicationFound = Application.find({candidateId}).populate(["jobId"]);
        if(applicationFound){
            return applicationFound
        }else{
            throw new Error("Not found")
        }
    },
    getAllByCompany: async(companyId)=>{
        const applicationFound = Application.find({companyId}).sort('jobId').populate({path: "candidateId", select: "info"})
        if(applicationFound){
            return applicationFound
        }else{
            throw new Error("Not found")
        }
    },
    // getByJob: async(id)
    invite: async (jobName, candidateEmail, companyId) => {
        const JobFound = await Job.findOne({companyId, "info.name": jobName});
        const UserFound = await User.findOne({email:candidateEmail, roleNumber : 0});
        if (UserFound && JobFound && JobFound.status.value == 0) {
            const candidateApplierFound = await Application.findOne({ jobId: JobFound._id, candidateId: UserFound._id })
            if (!candidateApplierFound) {
                const newApplication = new Application({
                    jobId: JobFound._id, candidateId: UserFound._id, companyId
                })
                newApplication.createdBy = applicationDictionary.byCompany;
                const result = await newApplication.save();
                if (result) {
                    return result
                } else {
                    throw new Error("Cant create application")
                }
            } else {
                throw new Error("Application existed")
            }

        } else {
            throw new Error("Job & User not existed")
        }
    },
    apply: async (userId, jobName, companyId) => {
        const JobFound = await Job.findOne({"info.name": jobName, companyId});
        if (JobFound) {
            const candidateApplierFound = await Application.findOne({ jobId:JobFound._id, candidateId: userId })
            if (!candidateApplierFound) {
                const newApplication = new Application({
                    jobId:JobFound._id, candidateId: userId, companyId
                })
                newApplication.createdBy = applicationDictionary.byUser;
                const result = await newApplication.save();
                if (result) {
                    return result
                } else {
                    throw new Error("Cant create application")
                }
            } else {
                throw new Error("Application existed")
            }
        } else {
            throw new Error("Job not existed")
        }
    },
    approveByCompany: async (companyId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if(applicationFound && !applicationFound.isApproved 
            && applicationFound.companyId.toString() == companyId
            && applicationDictionary.created.isUser(applicationFound.createdBy)
            ){
            applicationFound.isApproved = true;
            const result = await applicationFound.save();
            if(result){
                return result;
            }else{
                throw new Error("Cant approve")
            }
        }else {
            throw new Error("Not found")
        }
    },
    approveByUser: async (userId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if (!applicationFound.isApproved
            && applicationFound
            && applicationDictionary.created.isCompany(applicationFound.createdBy)
            && applicationFound.candidateId.toString() == userId
        ){
            applicationFound.isApproved = true;
            const result = await applicationFound.save();
            if(result){
                return result;
            }else{
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },
    updateStatus: async (companyId, _id, status) =>{
        const applicationFound = await Application.findOne({_id, companyId, isClose: false, isApproved: true})
        if(applicationFound){
            applicationFound.status = status;
            const result = await applicationFound.save();
            if(result){
                return result;
            }else{
                throw new Error("cant update status")
            }
        }else{
            throw new Error("Not found")
        }
    },
    closeApplication: async (companyId, _id) =>{
        const applicationFound = await Application.findOne({_id, companyId, isClose: false, isApproved: true})
        if(applicationFound){
            applicationFound.isClose = true;
            const result = await applicationFound.save();
            if(result){
                return result;
            }else{
                throw new Error("cant close application")
            }
        }else{
            throw new Error("Not found ")
        }
    },
    commentCompany: async (_id, candidateId, comment) =>{
        const applicationFound = await Application.findOne({_id, candidateId, isClose: true});
        if(applicationFound && !applicationFound.candidateComment){
            applicationFound.candidateComment = comment;
            const result = await applicationFound.save();
            if(result){
                return applicationFound.candidateComment;
            }else{
                throw new Error("Cant comment")
            }
        }else{
            throw new Error("Not found ")
        }
    },
    commentUser: async(_id, companyId, comment) =>{
        const applicationFound = await Application.findOne({_id, companyId, isClose: true});
        if(applicationFound && !applicationFound.companyComment){
            applicationFound.companyComment = comment;
            const result = await applicationFound.save();
            if(result){
                return applicationFound.companyComment;
            }else{
                throw new Error("Cant comment")
            }
        }else{
            throw new Error("Not found ")
        }
    }
}

module.exports = ApplicationService;