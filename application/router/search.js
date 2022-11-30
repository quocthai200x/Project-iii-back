const express = require("express")
const searchService = require("../../domain/service/searchService")
const router = express.Router()
var auth = require("../../config/auth")
var authorize = require("../../config/authorize")


router.post("/job" , async(req,res)=>{
    try {
        const {pageNumber} = req.query
        const result = await searchService.searchJob(req.body, pageNumber);
        res.json(result);
    } catch (err) {
        res.status(400);
        res.json({
            code: err.message
        })
    }
})

router.post("/candidate", auth.required, authorize.canSearchCandidate,  async(req,res)=>{
    try {
        // const {index} = req.params
        const result = await searchService.searchCandidate(req.body);
        res.json(result);
    } catch (err) {
        res.status(400);
        res.json({
            code: err.message
        })
    }
})

module.exports = router;
