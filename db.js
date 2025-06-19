const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;


const User = new Schema({
    email: {type: String, unique: true},
    password: String,
    name: String
});

const Admin = new Schema({
    email: {type: String, unique: true},
    password: String,
    name: String
});

const Course = new Schema({
    title: String,
    description: String,
    price: Number,
    imageURL: String,
    creatorId: {type: ObjectId, ref: 'admins'}
});

const Purchase = new Schema({
    userId: {type: ObjectId, ref: 'users'},
    creatorId: {type: ObjectId, ref: 'admins'},
    courseId: {type: ObjectId, ref: 'courses'}
});

const userModel = mongoose.model("users", User);
const adminModel = mongoose.model("admins", Admin);
const courseModel = mongoose.model("courses", Course);
const purchaseModel = mongoose.model("purchases", Purchase);

module.exports = {
    userModel, adminModel, courseModel, purchaseModel
}