const express = require("express")
const app = express();
const mongoose = require("mongoose")
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs')
const path = require('path');
app.use(express.urlencoded({ extended: true }));
const Articles = require("./models/myarticles")
var moment = require("moment");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

app.get("/", (req, res) => {
    // result ==> array of objects
    Articles.find()
        .then((result) => {
            res.render("index", { arr: result, moment: moment });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/user/add", (req, res) => {
    res.render("user/add");
});


app.post("/user/add", (req, res) => {
    Articles.create(req.body)
    .then(() => { res.redirect('/') })
    .catch((err) => { console.log(err) })
});


app.post("/user/update/:id", (req, res) => {
    console.log("Updating document with ID:", req.params.id);
    console.log("Request body:", req.body);
    
    Articles.updateOne({ _id: req.params.id }, req.body)
    .then(() => {
        console.log("Document updated successfully");
        res.redirect("/");
    }).catch((err) => {
        console.log(err);
    });
});

app.get("/user/update/:id", (req, res) => {
    Articles.findById(req.params.id)
    .then((result) => {
        res.render("user/update", { obj: result, moment: moment });
    })
    .catch((err) => {
        console.log(err);
    });
});

app.get("/user/view/:id", (req, res) => {
    const ID_USER = req.params.id;
    Articles.findById(ID_USER).then((result)=>{
        res.render("user/view" , {arr : result , moment : moment});
    }).catch((err)=>{
        console.log(err);
    })
});

app.delete('/user/delete/:id', (req , res)=>{
    Articles.deleteOne({ _id: req.params.id }).then((result) => {
        res.redirect("/");
    });
})

// connect to database

mongoose
    .connect("mongodb://localhost/articles")
    .then(() => {
        app.listen(port, () => {
            console.log(`http://localhost:${port}/`);
        });
    })
    .catch((err) => {
        console.log(err);
    })