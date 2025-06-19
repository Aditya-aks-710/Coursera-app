const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { userModel, purchaseModel, courseModel } = require("../db");
const { userAuth } = require("../middleware/userauth");
const { signupSchema, signinSchema } = require("../validators/admin");
const bcrypt = require("bcrypt");

const userRouter = Router();

userRouter.post("/signup", async function(req, res) {
    try{
        const { email, password, name } = signupSchema.parse(req.body);
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
    } catch (err) {
        if(err instanceof z.ZodError) {
            return res.status(400).json({
                errors: err.errors
            });
        }
        return res.status(500).json({
            message: "Internal Server error"
        });
    }
});

userRouter.post("/signin", async function(req, res) {
    try {
        const { email, password } = signinSchema.parse(req.body);
        
        const response = await userModel.findOne({ 
            email: email
        });

        const passwordMatched = await bcrypt.compare(password, response.password);

        if(response && passwordMatched){
            const token = jwt.sign({
                id: response._id.toString()
            }, process.env.JWT_SECRET_USER);
            res.json({
                token: token
            });
        }
        else{
            return res.status(401).json({
                message: "Incorrect email or password"
            });
        }
    } catch (err) {
        if(err instanceof z.ZodError) {
            return res.status(400).json({
                errors: err.errors
            });
        }
        return res.status(500).json({
            message: "Internal Server error"
        });
    }
});

userRouter.get("/purchases", userAuth, async function(req, res) {

    const purchases = await purchaseModel.find({
        userId: req.userId
    });

    if(purchases.length == 0) {
        return res.status(200).json({
            message: "Empty, Please buy first"
        });
    }

    const courseId = purchases.map(p => p.courseId);

    const courses = await courseModel.find({
        _id: {
            $in: courseId
        }
    });

    res.json({ courses });
});

module.exports = {
    userRouter: userRouter
}