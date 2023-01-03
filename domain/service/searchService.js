var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var Company = require('../model/companies')
var Role = require('../model/roles')
const jobDictionary = require("../../config/dictionary/job")
// var ElasticClient = require("../../infrastructure/elasticSearch")


const SearchService = {
    searchCandidateForCompany: async (companyId, pageNumber, limit) => {
        const companyFound = await Company.findById(companyId);
        let workingAreaWeight = 0.6;
        let provinceWeight = 0.4
        let textScoreWeight = 0.4
        if (!pageNumber) {
            pageNumber = 0;
        }

        if (!limit) {
            limit = 5;
        } else {
            limit = Number(limit)
        }
        const jobsFound = await Job.find({ companyId, 'status.value': jobDictionary.status.show.value }).select(['info.keyword', "info.workingAddress", "info.type"])
        if (jobsFound && jobsFound.length > 0) {
            // hiện jobsFound mới chứa keyword, cần thêm location và type name
            // làm tiếp, tìm kiêm trọng số với keyword, location, type name
            // console.log(jobsFound)
            let workingAreaName = companyFound.info.workingArea.map(ele => ele.name);
            let locationProvince = companyFound.info.location.map(ele => ele.province);
            let keywords = []
            jobsFound.forEach(job=>{
                job.info.workingAddress.forEach(location=>{
                    if(!locationProvince.includes(location.province)){
                        locationProvince.push(location.province)
                    }
                })
                job.info.type.forEach(type=>{
                    if(!workingAreaName.includes(type.name)){
                        workingAreaName.push(type.name)
                    }
                })
                job.info.keyword.forEach(keyword=>{
                    if(!keywords.includes(keyword)){
                        keywords.push(keyword)
                    }
                })
            })
            let strKeyword = keywords.join(' ')
            const result = await User.aggregate([
                {
                    $match: {
                        $text: {
                            $search: strKeyword,
                        },
                        
                        roleNumber: 0, "info.allowSearchInfo": true,
                    }
                },
                {
                    $project: {
                        _id: "$_id",
                        info:  "$info",
                        email: "$email" ,
                        textScore: {$meta: "textScore"},
                    }
                },
                { $unwind: { path: "$info.typeWorking", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$_id",
                        count: { $sum: { $size: { $filter: { input: workingAreaName, as: "item", cond: { $in: ["$info.typeWorking.name", ["$$item"]] } } } } },
                        info: { $first: "$info" },
                        email: { $first: "$email" },
                        textScore: {$first: "$textScore"},
                    }
                },
                
                {
                    $project: {
                        // your project fields
                        "info": 1,
                        email: 1,
                        // calculate the sum of the fields with different weights
                        score: {
                            $add:
                                [
                                    { $multiply: [textScoreWeight, "$textScore"] },
                                    {
                                        $multiply: [workingAreaWeight, '$count']
                                    },

                                    {
                                        $multiply: [provinceWeight,
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: ['$info.city'],
                                                        as: 'item',
                                                        cond: { $in: ['$$item', locationProvince] }
                                                    }
                                                }
                                            }]
                                    },
                                ]
                        }
                    }
                },
                {
                    $sort: {
                     
                        score: -1
                    }
                },
                {
                    $project: {
                        info: 1,
                        email: 1,
                        score: 1
                    }
                },
                {
                    $limit: limit
                },

            ])

            return result
        } else if (jobsFound.length == 0) {
            // let newQuery = { , }
            let workingAreaName = companyFound.info.workingArea.map(ele => ele.name);
            let locationProvince = companyFound.info.location.map(ele => ele.province);
            // console.log("hi")
            // console.log(workingAreaName)
            const result = await User.aggregate([
                {
                    $match: {
                        roleNumber: 0, "info.allowSearchInfo": true,
                    }
                },
                { $unwind: { path: "$info.typeWorking", preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: "$_id",
                        count: { $sum: { $size: { $filter: { input: workingAreaName, as: "item", cond: { $in: ["$info.typeWorking.name", ["$$item"]] } } } } },
                        info: { $first: "$info" },
                        email: { $first: "$email" }
                    }
                },

                {
                    $project: {
                        // your project fields
                        "info": 1,
                        email: 1,
                        // calculate the sum of the fields with different weights
                        score: {
                            $add:
                                [

                                    {
                                        $multiply: [workingAreaWeight, '$count']
                                    },

                                    {
                                        $multiply: [provinceWeight,
                                            {
                                                $size: {
                                                    $filter: {
                                                        input: ['$info.city'],
                                                        as: 'item',
                                                        cond: { $in: ['$$item', locationProvince] }
                                                    }
                                                }
                                            }]
                                    },
                                ]
                        }
                    }
                },
                {
                    $sort: {
                        score: -1
                    }
                },
                {
                    $project: {
                        info: 1,
                        email: 1,
                        score: 1
                    }
                },
                {
                    $limit: limit
                },

            ])

            return {
                total: result.length,
                data: result,
            };

        }
    },
    searchCompany: async (keyword, pageNumber, limit) => {
        if (!limit) {
            limit = 30;
        }

        let query = {};
        if (keyword) {
            query.$text = {}
            query.$text.$search = keyword;

        }
        // let newDate = new Date()
        // newDate.setDate(newDate.getDate() + 3);
        // let checkDate = { "info.outdate": { $gt: newDate }}
        // let checkStatus = {'status.value': 0}
        let newQuery = { ...query }
        // console.log(newQuery)
        let result;
        if (keyword) {
            result = await Company.find(newQuery).sort({ score: { $meta: "textScore" } }).limit(limit).skip(limit * pageNumber)
        } else {
            result = await Company.find(newQuery).limit(limit).skip(limit * pageNumber)
        }

        const count = await Company.find(newQuery).count()
        //TO DO: làm thêm filter skip limit offset
        if (result) {
            return { total: count, data: result };
        } else {
            throw new Error(" error")
        }
    },
    searchJob: async (body, pageNumber, limit) => {
        if (!limit) {
            limit = 50;
        }
        let query = {};
        if (body.text) {
            query.$text = {}
            query.$text.$search = body.text;

        }
        let newDate = new Date()
        newDate.setDate(newDate.getDate() + 3);
        let checkDate = { "info.outdate": { $gt: newDate } }
        let checkStatus = { 'status.value': 0 }
        let newQuery = { ...query, ...checkDate, ...body.filter, ...checkStatus }
        // console.log(newQuery)
        let result;
        if (body.text) {
            result = await Job.find(newQuery).sort({ score: { $meta: "textScore" } }).limit(limit).skip(limit * pageNumber).select({ status: 0 }).populate({ path: "companyId", select: { "info.name": 1, "info.benefits": 1, "info.logo": 1 } });
        } else {
            result = await Job.find(newQuery).sort({ 'info.outdate': 1 }).limit(limit).skip(limit * pageNumber).select({ status: 0 }).populate({ path: "companyId", select: { "info.name": 1, "info.benefits": 1, "info.logo": 1 } });
        }
        const count = await Job.find(newQuery).count()
        //TO DO: làm thêm filter skip limit offset
        if (result) {
            return { total: count, data: result };
        } else {
            throw new Error(" error")
        }
    },
    searchCandidate: async (body, pageNumber, limit) => {
        let query = {};
        if (body.text) {
            query.$text = {}
            query.$text.$search = body.text;
        }
        let newQuery = { ...query, roleNumber: 0, "info.allowSearchInfo": true, ...body.filter, }
        // console.log(newQuery)
        const result = await User.find(newQuery).sort({ score: { $meta: "textScore" } }).limit(limit).skip(limit * pageNumber).select({ info: 1, email: 1 })
        //TO DO: làm thêm filter skip limit offset
        if (result) {
            return result;
        } else {
            throw new Error(" error")
        }
    }
}


module.exports = SearchService;