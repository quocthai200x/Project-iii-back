var Company = require("../model/companies")

var mongoose = require("../../infrastructure/db");

const CompanyService = {
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


    }
}

module.exports = CompanyService;