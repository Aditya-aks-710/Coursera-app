const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Router } = require("express");
const { adminModel, courseModel } = require("../db");
const { adminAuth } = require("../middleware/adminauth");
const adminRouter = Router();

adminRouter.post("/signup", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

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
});

adminRouter.post("/signin", async function(req, res) {
    const email = req.body.email;
    const password = req.body.password;

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
});

adminRouter.post("/course", adminAuth, async function(req, res) {
    const title = req.body.title;
    const description = req.body.description;
    const price = req.body.price;
    const imageURL = req.body.imageURL;

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
