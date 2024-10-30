const express = require("express")
const app = express();
const mongoose = require("mongoose")
const port = process.env.PORT || 3000;
app.set('view engine', 'ejs')
const path = require('path');
app.use(express.urlencoded({ extended: true }));
const Articles = require("./models/myarticles")
const AuthUser = require("./models/authUser")
var moment = require("moment");
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
var jwt = require("jsonwebtoken");
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, "torrent", (err) => {
            if (err) { res.redirect("/login"); } else { next(); }
        });
    } else {
        res.redirect("/login");
    }
};

const checkIfUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, "torrent", async (err, decoded) => {
            if (err) {
                res.locals.user = null;
                next();
            } else {
                const currentUser = await AuthUser.findById(decoded.id);
                res.locals.user = currentUser;
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
};
app.get("*", checkIfUser);

app.get("/signout", (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
});

app.get("/home", requireAuth, (req, res) => {
    // result ==> array of objects
    Articles.find()
        .then((result) => {
            res.render("index", { arr: result, moment: moment });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/", (req, res) => {
    res.render("before");
});

app.get("/user/add", requireAuth, (req, res) => {
    res.render("user/add");
});

app.get("/login", (req, res) => {
    res.render("authUser/login");
});

app.get("/signup", (req, res) => {
    res.render("authUser/signup");
});

app.post("/signup", async (req, res) => {
    try {
        const result = await AuthUser.create(req.body);
        console.log(result);
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }
});


app.post("/login", async (req, res) => {
    const loginUser = await AuthUser.findOne({ email: req.body.email });
    console.log(loginUser);

    if (loginUser == null) {
        console.log("this email not found in DATABASE");
    } else {
        const match = await bcrypt.compare(req.body.password, loginUser.password);
        if (match) { // true
            console.log("correct email & password");
            var token = jwt.sign({ id: loginUser._id }, "torrent");
            res.cookie("jwt", token, { httpOnly: true, maxAge: 2592000000 });
            res.redirect("/home")
        } else {
            console.log("wrong password");
        }
    }
});


app.get("/forget_password", (req, res) => {
    res.render("authUser/forget_password");
});


app.post("/user/add", (req, res) => {
    Articles.create(req.body)
        .then(() => { res.redirect('/home') })
        .catch((err) => { console.log(err) })
});


app.post("/user/update/:id", (req, res) => {
    console.log("Updating document with ID:", req.params.id);
    console.log("Request body:", req.body);

    Articles.updateOne({ _id: req.params.id }, req.body)
        .then(() => {
            console.log("Document updated successfully");
            res.redirect("/home");
        }).catch((err) => {
            console.log(err);
        });
});

app.get("/user/update/:id", requireAuth, (req, res) => {
    Articles.findById(req.params.id)
        .then((result) => {
            res.render("user/update", { obj: result, moment: moment });
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/user/view/:id", requireAuth, (req, res) => {
    const ID_USER = req.params.id;
    Articles.findById(ID_USER).then((result) => {
        res.render("user/view", { arr: result, moment: moment });
    }).catch((err) => {
        console.log(err);
    })
});

app.delete('/user/delete/:id', requireAuth, (req, res) => {
    Articles.deleteOne({ _id: req.params.id }).then((result) => {
        res.redirect("/home");
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