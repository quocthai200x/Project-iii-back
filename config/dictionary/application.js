const applicationDictionary = {
    byUser: 0,
    byCompany: 1,
    created:{
        isUser: (byWho) =>{
            return byWho == 0
        },
        isCompany: (byWho) =>{
            return byWho == 1
        }
    },
    status: [
        {
            name: "Nhận hồ sơ",
            value: 0
        },
        {
            name: "Duyệt hồ sơ",
            value: 1,
        },
        {
            name: "Interview",
            value: 2,
        },
        {
            name: "Đề nghị nhận việc",
            value: 3
        },
        {
            name: "Đã tuyển",
            value: 4,
        },{
            name: "Không đạt",
            value: 5,
        },{
            name:"Ứng viên từ chối",
            value: 6
        }
    ]
}

module.exports = applicationDictionary