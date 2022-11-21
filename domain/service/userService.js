// const Company = require("../model/companies");
var Users  = require("../model/users")


const userService = {
    find: async (email) => {
        return  Users.findOne({email});
    },

    update: async (email, data) =>{
        const user = await Users.findOne({email});
        if(user.roleNumber == 0){
            user.info = data;
            const updatedUser = await user.save()
            if(updatedUser){
               return updatedUser.info
            }
            else{
                throw new Error("Error: update fail")
            }
        }else{
            throw new Error("Error: update fail")
        }

    }
}
module.exports = userService;