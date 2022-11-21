// const Company = require("../model/companies");
var Role = require("../model/roles")
var User = require("../model/users")
var roleDictionary = require("../../config/dictionary/role")

const roleService = {
    create: async (name, companyId) => {
        const roleFound = await Role.findOne({
            name,
            companyId
        })
        if (roleFound) {
            throw new Error("Role existed")
        }
        const newRole = new Role({
            name,
            companyId
        })
        let createdRole = await newRole.save();
        if (createdRole) {
            return createdRole
        }
        else {
            throw new Error("Cant create role")
        }
    },
    updateRole: async (roleSetting, roleName, companyId) => {
        const roleFound = await Role.findOne({ companyId, name: roleName });

        if (roleFound) {
            // check role dung la cong ty tao ra 
            roleFound.settings = roleSetting;
            const result = await roleFound.save();
            if (result) {
                return true;
            } else {
                throw new Error("Fail")
            }
        }
        else {
            throw new Error("Not found")
        }
    },
    attachRole: async (roleName, targetEmail, companyId) => {
        const roleFound = await Role.findOne({ name: roleName, companyId });
        const userFound = await User.findOne({ email: targetEmail, roleNumber: 2, companyId })
        if (roleFound && userFound) {
            // check role dung la cong ty tao ra 
            // && user target thuoc cong ty 
            // && user la employee
            userFound.roleId = roleFound._id;
            const result = await userFound.save();
            if (result) {
                return true;
            } else {
                throw new Error("Fail")
            }

        }
        else {
            throw new Error("Not found")
        }
    }
}
module.exports = roleService;