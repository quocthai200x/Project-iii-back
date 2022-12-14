// const Company = require("../model/companies");
var Users = require("../model/users")
var Jobs = require("../model/jobs");
const roleDictionary = require("../../config/dictionary/role");


const userService = {
    updateModel: async () => {
        const userFound = await Users.find();
        userFound.forEach((user, index) => {
            if (!user.info.ward) {
                user.info.ward = ""
                let res = user.save();
                if (index == userFound.length - 1) {
                    if (res) {
                        return res
                    } else {
                        throw new Error("Lỗi")
                    }
                }
            }

        })
    },
    getAllEmailCompany: async () => {
        return Users.find({ roleNumber: 1 }).select({ email: 1 })
    },
    find: async (email) => {
        let user = await Users.findOne({ email })
            .populate({
                path: "companyId",
                match: {
                    roleNumber: 1 || 2
                }
            })
            .populate({
                path: "roleId",
                match: {
                    roleNumber: 2
                }
            })
            .select({ hash: 0, salt: 0 })
            .exec();
        if (user) {
            return user
        }
        else {
            throw new Error("Cant find user")
        }
    },

    update: async (email, data) => {
        const user = await Users.findOne({ email });
        if (user.roleNumber == 0) {
            user.info = data;
            const updatedUser = await user.save()
            if (updatedUser) {
                return updatedUser.info
            }
            else {
                throw new Error("Error: update fail")
            }
        } else {
            throw new Error("Error: update fail")
        }

    },
    likeJob: async (email, jobName, companyId) => {
        const user = await Users.findOne({ email }).select("activity.jobSaved");
        // old doc without "like" field
        const job = await Jobs.findOne({ "info.name": jobName, companyId })
        if (!user || !job) {
            throw new Error("Not found");
        } else {
            if (!user.activity.jobSaved) {
                user.activity.jobSaved = [];
            }

            if (user.activity.jobSaved.find(item => job._id.equals(item))) {
                //user had liked && and now delete 
                // console.log(user.activity.jobSaved.find(item => job._id.equals(item)))
                user.activity.jobSaved = user.activity.jobSaved.filter(item => !job._id.equals(item))
            } else {
                // user not like && now like
                user.activity.jobSaved.push(job._id);
            }
            await user.save();
            return user.toObject().activity.jobSaved;
        }

    },
}
module.exports = userService;