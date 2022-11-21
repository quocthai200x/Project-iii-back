var express = require("express")
var passport = require("passport")
// var passportLocal = require("passport-local")
var router = express.Router()
var companyService = require("../../domain/service/companyService")
// var authService = require("../../domain/service/authService")

// var userService = require("../../domain/service/userService")
var auth = require("../../config/auth")
var authorize = require('../../config/authorize')


router.put("/", auth.required, authorize.canWriteCompanyInfo, async (req, res) => {
    const companyId = req.companyId;
    const data = req.body
    
    try {
        const result = await companyService.update(data,  companyId)
        res.json({
            result,
        });
    } catch (err) {
        res.status(400);
        res.json({
            email: err.message
        });
    }
})



module.exports = router;