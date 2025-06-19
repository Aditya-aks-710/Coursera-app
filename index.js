require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose"); 
const app = express();
app.use(express.json());

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
// const { userModel, adminModel, courseModel, purchaseModel } = require("./db");

app.use("/api/v1/user", userRouter);
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/admin", adminRouter);

async function main() {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        app.listen(process.env.PORT);
        console.log(`listening at port ${process.env.PORT}`);
    } catch(err) {
        console.log(err);
    }
}

main();