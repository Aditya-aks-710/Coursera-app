const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { userModel } = require("../db");
const { userAuth } = require("../auth");
const bcrypt = require("bcrypt");

const userRouter = Router();

userRouter.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const response = await userModel.exists({
        email: email
    });
    
    if(response){
        return res.status(409).json({
            message: "email already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

    await userModel.create({
        email: email,
        password: hashedPassword,
        name: name
    });

    res.status(201).json({
        message: "Signed Up successfully"
    });
});

userRouter.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    
    const response = await userModel.findOne({ 
        email: email
    });

    const passwordMatched = await bcrypt.compare(password, response.password);

    if(response && passwordMatched){
        const token = jwt.sign({
            id: response._id.toString()
        }, process.env.JWT_SECRET);
        res.json({
            token: token
        });
    }
    else{
        return res.status(401).json({
            message: "Incorrect email or password"
        });
    }

});

userRouter.get("/purchases", userAuth, function(req, res) {
    res.json({
        message: "Welcome Back"
    });
});

module.exports = {
    userRouter: userRouter
}