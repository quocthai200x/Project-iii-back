var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var Company = require('../model/companies')
var Role = require('../model/roles')
// var ElasticClient = require("../../infrastructure/elasticSearch")


const SearchService = {
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
        }else{
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
    searchCandidate: async (body) => {
        let query = {};
        if (body.text) {
            query.$text = {}
            query.$text.$search = body.text;
        }
        let newQuery = { ...query, roleNumber: 0, "info.allowSearchInfo": true, ...body.filter, }
        // console.log(newQuery)
        const result = await User.find(newQuery).select({ info: 1, email: 1 })
        //TO DO: làm thêm filter skip limit offset
        if (result) {
            return result;
        } else {
            throw new Error(" error")
        }
    }
}


module.exports = SearchService;