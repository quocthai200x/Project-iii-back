const express = require("express")
const router = express.Router()
const userService = require("../../domain/service/userService")
const roleService = require("../../domain/service/roleService")
var auth = require("../../config/auth")
var authorize = require("../../config/authorize")

router.put("/update", auth.required, async (req, res) => {
    const { email } = req.payload;
    try {
        const updateUser = await userService.update(email, req.body);
        res.json(updateUser)
    } catch (err) {
        res.status(400);
        res.json({
            error: err.message
        });
    }

})

router.post("/attach-role", auth.required, authorize.canWriteUserPermission, async (req, res) => {
    const { roleName, targetEmail } = req.body;
    const { companyId } = req;
    try {
        const attached = await roleService.attachRole(roleName, targetEmail, companyId);
        res.json(attached)
    } catch (err) {
        res.status(400);
        res.json({
            error: err.message
        });
    }
})


// router.post("/:following/follow", async (req, res) => {
//     const { follower } = req.body;
//     const { following } = req.params
//     console.log(follower, following)
//     const result = await userService.follow(follower, following);
//     if (result === true) {
//         res.json({
//             success: 'true',
//             follower,
//         })
//     } else {
//         // TODO 
//     }
// })

// router.post("/:following/unfollow", async (req, res) => {
//     const { follower } = req.body;
//     const { following } = req.params
//     console.log(follower, following)
//     const result = await userService.unFollow(follower, following);
//     if (result === true) {
//         res.json({
//             success: 'true',
//             follower,
//         })
//     } else {
//         // TODO 
//     }
// })


// router.get("/",async  (req, res) => {
//     const queryString = req.query.q;
//     const result = await userService.search(queryString);
//     res.send({
//         result : result,
//         total :result.length,
//     });


// })


module.exports = router;