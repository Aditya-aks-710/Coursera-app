const { Router } = require("express");
const { User, Admin, Course, Purchase } = require("../db");
const courseRouter = Router();

courseRouter.post("/purchase", function (req, res) {
    
});

courseRouter.get("/preview", function(req, res) {

});

module.exports = {
    courseRouter: courseRouter
}