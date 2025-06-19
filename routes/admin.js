const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { adminModel, courseModel } = require("../db");
const { adminAuth } = require("../middleware/adminauth");
const { signupSchema, signinSchema } = require("../validators/admin");
const { signupSchema, signinSchema } = require("../validators/admin");
const adminRouter = Router();

adminRouter.post("/signup", async function(req, res) {
    try{
        const { email, password, name } = signupSchema.parse(req.body);

        const response = await adminModel.findOne({
            email: email
        });

        if(response){
            return res.status(409).json({
                message: "email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

        await adminModel.create({
            email: email,
            password: hashedPassword,
            name: name
        });

        res.status(201).json({
            message: "Signin successful"
        });
    } catch (err) {
        if(err instanceof z.ZodError) {
            return res.status(400).json({
                errors: err.errors
            });
        }
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
});

adminRouter.post("/signin", async function(req, res) {
    try {
        const { email, password } = signinSchema.parse(req.body);

        const response = await adminModel.findOne({
            email: email
        });

        const passwordMatched = await bcrypt.compare(password, response.password);

        if(response && passwordMatched){
            const token = jwt.sign({
                id: response._id.toString()
            }, process.env.JWT_SECRET_ADMIN);
            res.status(201).json({
                token: token
            });
        } else {
            res.status().json({
                message: "Incorrect email and password"
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

adminRouter.post("/course", adminAuth, async function(req, res) {
    const { title, description, price, imageURL } = req.body;

    await courseModel.create({
        title: title,
        description: description,
        price: price,
        imageURL: imageURL,
        creatorId: req.userId
    });
    res.status(201).json({
        message: "Course creation Successful"
    });
});

adminRouter.put("/course/edit", adminAuth, async function(req, res) {
    const { _id, title, description, price, imageURL } = req.body;
    
    const updatedCourse = await courseModel.findOneAndUpdate(
        { _id: _id, creatorId: req.userId },
        {
            $set: {
                title: title,
                description: description,
                price: price,
                imageURL: imageURL
            }
        },
        {
            new: true
        }
    )
    if(!updatedCourse) {
        return res.status(403).json({
            message: "Unable to edit this course"
        });
    }
    res.status(200).json({
        message: "Edit success"
    });
});

adminRouter.get("/course/preview", adminAuth, async function(req, res) {
    const courses = await courseModel.find({
        creatorId: req.userId
    });
    if(courses.size == 0){
        return res.status(401).json({
            mmessage: "No course found"
        });
    }
    res.status(200).json({courses});
});

module.exports = {
    adminRouter: adminRouter
}
