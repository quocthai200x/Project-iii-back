const { expressjwt: jwt } = require("express-jwt")

const getToken =(req)=> {
    const {headers:{authorization}} = req;
    if(authorization && authorization.split(" ")[0] == "Bearer"){
        return authorization.split(" ")[1];
    }else{
        return null;
    }

}
const auth ={
    required :jwt({
        secret : process.env.JWT_SECRET,
        requestProperty: "payload",
        algorithms: ['HS256'],
        getToken : getToken
    }) ,
    optinal: jwt({
        secret : process.env.JWT_SECRET,
        requestProperty: "payload",
        getToken : getToken,
        credentialsRequired : false,
        algorithms: ['HS256'],

    }),
}

module.exports = auth
