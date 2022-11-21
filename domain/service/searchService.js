var Application = require("../model/applications")
var Job = require("../model/jobs")
var User = require("../model/users")
var Company = require('../model/companies')
var Role = require('../model/roles')
// var ElasticClient = require("../../infrastructure/elasticSearch")


const SearchService = {
    searchJob: async (body) => {
        let query = {};
        if(body.text){
            query.$text = {}
            query.$text.$search = body.text;
        }
        let newQuery =  {...query,...body.filter}
        console.log(newQuery)
        const result = await Job.find(newQuery).select({status: 0})
            //TO DO: làm thêm filter skip limit offset
            .populate({path: "companyId", select: {"info.name" : 1, "info.benefits": 1, "info.logo": 1}});
        if(result){
            return result;
        }else{
            throw new Error(" error")
        }
    },
    searchCandidate: async (body) => {
        let query = {};
        if(body.text){
            query.$text = {}
            query.$text.$search = body.text;
        }
        let newQuery =  {...query,roleNumber: 0, "info.allowSearchInfo":true, ...body.filter, }
        console.log(newQuery)
        const result = await User.find(newQuery).select({info: 1, email: 1})
            //TO DO: làm thêm filter skip limit offset
        if(result){
            return result;
        }else{
            throw new Error(" error")
        }
    }
}


module.exports = SearchService;