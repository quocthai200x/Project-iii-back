var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var roleDictionary = require("../../config/dictionary/role")
var applicationDictionary = require("../../config/dictionary/application")
const path = require("path")
// var ValidationService = require('./validationService');
// const { validJob, validUser } = require("./validationService")


const ApplicationService = {
    findOneInCompany: async (applicationId, companyId) => {

        const applicationFound = await Application.findOne({ _id: applicationId, companyId })
            .populate({ path: "candidateId", select: { "info": 1 } })
            .populate({ path: "jobId", select: { "info": 1 } })
            .lean()
        // .populate({ path: "companyId", select: { "info.logo": 1, "info.name": 1 } })
        if (applicationFound) {
            const [countTurnIn, countApprove, countInterview, countOffer, countGetHired, countRejectByUser, countNotQualify] = await Promise.all([
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.turnIn.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.approve.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.interview.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.offer.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.getHired.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.rejectByUser.value }).lean(),
                Application.countDocuments({ jobId: applicationFound.jobId._id, "status.value": applicationDictionary.status.notQualify.value }).lean(),
            ]);
            return {
                data: applicationFound,
                countTurnIn, countApprove, countInterview, countOffer, countGetHired, countRejectByUser, countNotQualify
            }
        } else {
            throw new Error("Not found")
        }
    },
    findByJobName: async (jobName, companyId) => {
        const jobFound = await Job.findOne({ companyId, "info.name": jobName }).select({ _id: 1 })
        console.log(jobFound)
        if (jobFound) {
            const applicationFound = Application.find({ companyId, jobId: jobFound._id }).populate({ path: "candidateId", select: "info" })
            if (applicationFound) {
                return applicationFound
            } else {
                throw new Error("Not found")
            }
            return 1
        } else {
            throw new Error("Not found")
        }

    },
    getAllByUser: async (candidateId) => {
        const applicationFound = Application.find({ candidateId }).sort({ updatedAt: -1 })
            .populate({ path: "jobId", select: { "info.name": 1, "info.salaryRate": 1, "info.workingAddress": 1, "info.recruitmentProcess": 1 }, })
            .populate({ path: "companyId", select: { "info.logo": 1, "info.name": 1 } })
        if (applicationFound) {
            return applicationFound
        } else {
            throw new Error("Not found")
        }
    },

    getAllByCompany: async (companyId) => {
        const applicationFound = Application.find({ companyId }).sort('jobId').populate({ path: "candidateId", select: "info" })
        if (applicationFound) {
            return applicationFound
        } else {
            throw new Error("Not found")
        }
    },
    findWithCandidateAndJobID: async (candidateId, jobId) => {
        const applicationFound = Application.findOne({ candidateId, jobId })
        if (applicationFound) {
            return applicationFound
        } else {
            throw new Error("Not found")
        }
    },
    // getByJob: async(id)
    invite: async (jobName, candidateEmail, companyId) => {
        const JobFound = await Job.findOne({ companyId, "info.name": jobName });
        const UserFound = await User.findOne({ email: candidateEmail, roleNumber: 0 });
        // console.log(JobFound)
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
        const JobFound = await Job.findOne({ "info.name": jobName, companyId });
        if (JobFound) {
            const candidateApplierFound = await Application.findOne({ jobId: JobFound._id, candidateId: userId })
            if (!candidateApplierFound) {
                const newApplication = new Application({
                    jobId: JobFound._id, candidateId: userId, companyId
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
        if (applicationFound && applicationFound.status.value == applicationDictionary.status.turnIn.value
            && applicationFound.companyId.toString() == companyId
            && applicationDictionary.created.isUser(applicationFound.createdBy)
        ) {
            applicationFound.status = applicationDictionary.status.approve;
            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },

    approveByUser: async (userId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if (applicationFound
            && applicationFound.status.value == applicationDictionary.status.turnIn.value
            && applicationDictionary.created.isCompany(applicationFound.createdBy)
            && applicationFound.candidateId.toString() == userId
        ) {
            applicationFound.status = applicationDictionary.status.approve;
            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },
    rejectByCompany: async (companyId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if (applicationFound
            && applicationFound.companyId.toString() == companyId

        ) {
            applicationFound.status = applicationDictionary.status.notQualify
            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },



    rejectByUser: async (userId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if (applicationFound
            && applicationDictionary.created.isCompany(applicationFound.createdBy)
            && applicationFound.candidateId.toString() == userId
        ) {
            applicationFound.status = applicationDictionary.status.rejectByUser

            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },
    acceptToWork: async (userId, applicationId) => {
        const applicationFound = await Application.findById(applicationId);
        if (applicationFound
            && applicationFound.status.value == applicationDictionary.status.offer.value
            && applicationFound.candidateId.toString() == userId
        ) {
            applicationFound.status = applicationDictionary.status.getHired;
            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant approve")
            }
        } else {
            throw new Error("Not found")
        }
    },

    updateStatusByCompany: async (companyId, applicationId, type, statusIndex) => {
        const applicationFound = await Application.findById(applicationId).populate({ path: "jobId", select: "info.recruitmentProcess" })
        if (applicationFound
            && applicationFound.companyId.toString() == companyId
            && (applicationFound.status.value < applicationDictionary.status.rejectByUser.value
                || applicationFound.status.value < applicationDictionary.status.notQualify.value
                || applicationFound.status.value < applicationDictionary.status.getHired.value)

        ) {
            let interviewStatus = null;
            console.log(applicationFound.jobId.info.recruitmentProcess)
            // đang giai đoạn approve mới được value 1 (approve --> interview)
            if (type == 'set-interview' && applicationFound.status.value == applicationDictionary.status.approve.value) {
                interviewStatus = applicationDictionary.status.interview
                if (applicationFound.jobId.info.recruitmentProcess.length > 0) {
                    interviewStatus.note = applicationFound.jobId.info.recruitmentProcess[0]
                }
            }
            // giai đoạn nếu có vòng phỏng vấn value 2 (invterview --> interview)
            if (type == 'continue-interview'
                &&
                (
                    applicationFound.status.value == applicationDictionary.status.interview.value

                    || (statusIndex == 0 && applicationFound.status.value == applicationDictionary.status.approve.value)
                )
                && applicationFound.jobId.info.recruitmentProcess.length > 0
            ) {
                interviewStatus = applicationDictionary.status.interview
                if (statusIndex >= applicationFound.jobId.info.recruitmentProcess.length) {
                    statusIndex = applicationFound.jobId.info.recruitmentProcess.length - 1
                }
                interviewStatus.note = applicationFound.jobId.info.recruitmentProcess[statusIndex]
            }
            // giai đoạn có thể ấn offer value 2 (interview --> offer)
            if (type == 'offer' && applicationFound.status.value == applicationDictionary.status.interview.value) {
                interviewStatus = applicationDictionary.status.offer
            }
            if (!interviewStatus) {
                throw new Error("Something wrong with type")
            }
            applicationFound.status = interviewStatus;
            const result = await applicationFound.save();
            if (result) {
                return result;
            } else {
                throw new Error("Cant update status")
            }
        } else {
            throw new Error("Not found")
        }
    },



    commentCompany: async (_id, candidateId, comment) => {
        const applicationFound = await Application.findOne({ _id, candidateId });
        if (applicationFound && !applicationFound.candidateComment && applicationFound.status.value >= applicationDictionary.status.getHired.value) {
            applicationFound.candidateComment = comment;
            const result = await applicationFound.save();
            if (result) {
                return applicationFound.candidateComment;
            } else {
                throw new Error("Cant comment")
            }
        } else {
            throw new Error("Not found ")
        }
    },
    commentUser: async (_id, companyId, comment) => {
        const applicationFound = await Application.findOne({ _id, companyId });
        if (applicationFound && !applicationFound.companyComment && applicationFound.status.value >= applicationDictionary.status.getHired.value) {
            applicationFound.companyComment = comment;
            const result = await applicationFound.save();
            if (result) {
                return applicationFound.companyComment;
            } else {
                throw new Error("Cant comment")
            }
        } else {
            throw new Error("Not found ")
        }
    }
}

module.exports = ApplicationService;