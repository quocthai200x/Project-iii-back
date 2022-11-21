const express = require("express")
const router = express.Router()
const roleService = require("../../domain/service/roleService")
var auth = require("../../config/auth")
var authorize = require("../../config/authorize")

router.post("/", auth.required, authorize.canWriteRolePermission, async (req, res) => {
    const { name } = req.body;
    // console.log(name, req.companyId);
    try {
        const createdRole = await roleService.create(name, req.companyId);
        res.json(createdRole)
    } catch (err) {
        res.status(400);
        res.json({
            error: err.message
        });
    }

})

router.put('/', auth.required, authorize.canWriteRolePermission, async (req, res)=>{
    const {roleSetting, roleName} = req.body;
    const {companyId} = req;
    try {
        const updateRole = await roleService.updateRole(roleSetting, roleName, companyId)
        res.json(updateRole)
    } catch (err) {
        res.status(400);
        res.json({
            error: err.message
        });
    }
})






module.exports = router;