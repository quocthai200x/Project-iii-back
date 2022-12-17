var Company = require("../model/companies")

var mongoose = require("../../infrastructure/db");

const CompanyService = {
    get:async (companyName)=>{
        const company = await Company.findOne({'info.name': companyName}).select({info: 1});
        if(company){
            return company
        }else{
            throw new Error("Not found")
        }

    },
    update: async (data, companyId) => {
        const company = await Company.findById(companyId);
        if(company){
            data.name = company.info.name;
            company.info = data;
            const updatedCompany = await company.save()
            if (updatedCompany) {
                return updatedCompany
            }
            else {
                throw new Error("Error: update fail")
            }
        }else{
            throw new Error("Not found")
        }
    },
    updateModel: async () => {
        const companyFound = await Company.find();
        companyFound.forEach((company, index) => {
            let newJobInfo = company.info
            newJobInfo.video= "https://www.youtube.com/embed/7tz4Ya6gzG4"
            company.info = newJobInfo
            let res = company.save();
            if (index == companyFound.length - 1) {
                if (res) {
                    return res
                } else {
                    throw new Error("Lỗi")
                }
            }


        })
    }
}

module.exports = CompanyService;