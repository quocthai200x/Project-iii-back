var Job = require("../model/jobs")
var jobDictionary = require("../../config/dictionary/job")

const jobService = {
    // search: async (key) => {
    //     console.log(key)
    //     key = key.split(" ");
    //     console.log(key);
    //     const searchFound = await Job.find(
    //         {
    //             "info.name":{
    //                 "$in": {
    //                     $regex: key,
    //                     $option: 1
    //                 }
    //             }
    //         }
    //     )
    // if(searchFound) {
    //     return searchFound
    // }else{
    //     throw new Error("No items found")
    // }
    // },
    get: async (id) => {
        const jobFound = await Job.findById(id).select({ "_id": 0, "companyId": 0 });
        if (jobFound && jobFound.status.name == jobDictionary.status.show.name && jobFound.status.value == jobDictionary.status.show.value) {
            return jobFound
        } else {
            throw new Error("Not existed")
        }
    },
    create: async (companyId, jobInfo) => {
        // console.log(jobInfo)
        const jobFound = await Job.findOne({companyId, "info.name": jobInfo.name })
        if (jobFound) {
            throw new Error("Job in company existed");
        } else {
            const job = new Job({
                companyId,
                info: jobInfo
            })
            const createdJob = await job.save();
            if (createdJob) {
                return createdJob;
            } else {
                throw new Error("Cant create job")
            }
        }
    },
    update: async (companyId, jobName, jobInfo) => {
        const jobFound = await Job.findOne({"info.name": jobName, companyId});
        if (jobFound) {
            jobFound.info = jobInfo;
            const updateJob = await jobFound.save();
            if (updateJob) {
                return updateJob;
            } else {
                throw new Error("Cant update job")
            }
        } else {
            throw new Error("Job not existed");

        }
    },
    updateStatus: async (companyId, jobName, status) => {
        const jobFound = await Job.findOne({"info.name": jobName, companyId});
        if (jobFound) {
            jobFound.status = status;
            const updateJob = await jobFound.save();
            if (updateJob) {
                return status;
            } else {
                throw new Error("Cant update job")
            }
        } else {
            throw new Error("Job not existed");

        }
    },
    // updateStatusAllVisible: async () => {
    //     let show = {
    //         name: "Đang hiển thị",
    //         value :0
    //     }
    //     const jobFound = await Job.find();
    //     jobFound.forEach((job,index) =>{
    //         job.status = show
    //         let res = job.save();
    //         if(index == jobFound.length-1){
    //             if(res){
    //                 return res
    //             }else{
    //                 throw new Error("Lỗi")
    //             }
    //         }
    //     })
        
    // }
}

// const jobService = {
//     getJob: () => {
//         return Job.find({});
//     },

//     saveJob: (email, content, imageUrl) => {
//         const job = new Job({
//             email,
//             content,
//             imageUrl
//         })
//         job.save();
//         return job;
//     },
//     like: async (jobId, email) => {
//         const job = await Job.findById(jobId).select("like");
//         // old doc without "like" field
//         if (!job.like) {
//             job.like = [];
//         }
//         if (job.like.find(item => item === email) != null) {
//             //user had liked && and now delete 
//             job.like = job.like.filter(item => item !== email)
//         } else {
//             // user not like && now like
//             job.like.push(email);

//         }
//         await job.save();
//         return job.toObject().like;
//     },
//     comment: async (jobId, email, content) => {
//         const result = await Job.update({ "_id": jobId }, {
//             $push: {
//                 comments: { email, content }
//             }
//         })

//     },
//     loadComment :async(jobId)=>{
//         const job = await job.findById(jobId).select("comments");
//         return job.toObject().comments;
//     }
// }
module.exports = jobService;