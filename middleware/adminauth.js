const { adminModel } = require("../db");
const jwt = require("jsonwebtoken");

async function adminAuth(req, res, next) {
    const token = req.headers.token;
    
    if(!token){
        return res.status(404).json({
            message: "Please signin first"
        });
    }

    const response = jwt.verify(token, process.env.JWT_SECRET_ADMIN);

    if(response){
        const user = await adminModel.findOne({
            _id: response.id
        });
        if(user){
            req.userId = response.id;
            next();
        } else {
            res.status(404).json({
                message: "please Signin first"
            });
        }
    } else {
        res.status(404).json({
            message: "please Signin first"
        });
    }
}

module.exports = {
    adminAuth
}