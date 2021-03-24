require("dotenv").config();
const mongoClient = require("mongodb", { useUnifiedTopology: true })
  .MongoClient;

const express = require("express");
const app = express();
const host = "0.0.0.0";
const port = process.env.PORT || 3000;
// const url = "mongodb://127.0.0.1:27017";
const url = process.env.dburl;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Home-Page");
});

/*student ................................................................ */

app.post("/add-student", async (req, res) => {
  const student = {
    name: req.body.name,
    mentor: "",
  };
  try {
    let clientInfo = await mongoClient.connect(url);
    let db = await clientInfo.db("myFirstDatabase");
    let data = await db.collection("students").insertOne(student);
    res.status(200).json({ message: "Student added" });
    clientInfo.close();
  } catch (error) {
    console.error(error);
  }
});

/*mentor ................................................................ */

app.post("/add-mentor", async (req, res) => {
  const mentor = {
    name: req.body.name,
    students: [],
  };
  try {
    let clientInfo1 = await mongoClient.connect(url);
    let db1 = await clientInfo1.db("myFirstDatabase");
    let data1 = await db1.collection("mentors").insertOne(mentor);
    res.status(200).json({ message: "Mentor added" });
    clientInfo1.close();
  } catch (error) {
    console.error(error);
  }
});

/*logic ................................................................ */

app.put("/assign-mentor/:name", async (req, res) => {
  const studentName = req.params.name;
  const mentorName = req.body.mentor;
  try {
    let clientInfo2 = await mongoClient.connect(url);
    let db2 = await clientInfo2.db("myFirstDatabase");
    let data2 = await db2.collection("students").findOne({ name: studentName });
    if (data2) {
      let data3 = await db2.collection("mentors").findOne({ name: mentorName });
      if (data3) {
        await db2
          .collection("students")
          .findOneAndUpdate(
            { name: studentName },
            { $set: { mentor: mentorName } }
          );
        await db2
          .collection("mentors")
          .findOneAndUpdate(
            { name: mentorName },
            { $push: { students: studentName } }
          );
        res.status(200).send("Mentor Assigned");
      } else res.status(400).send("Invalid Mentor");
    } else res.status(400).send("Invalid Student");
    clientInfo2.close();
  } catch (error) {
    console.error(error);
  }
});

/* display...................................................................................... */

app.get("/student-list/:name", async (req, res) => {
  let mentorName = req.params.name;
  try {
    let clientInfo3 = await mongoClient.connect(url);
    let db3 = await clientInfo3.db("myFirstDatabase");
    let data3 = await db3.collection("mentors").findOne({ name: mentorName });
    res.status(200).json(data3.students);
  } catch (error) {
    console.error(error);
  }
});
app.listen(port, host, function () {
  console.log("Server started.......");
});
