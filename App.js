import express from "express"
import bcrypt from "bcrypt"
import cors from "cors"
import cookieSession from "cookie-session"
import bodyParser from "body-parser"
import Router from "express"
import mongoose from "mongoose"
import passport from "passport"
import passportLocal from "passport-local"
import passportLocalMongoose from "passport-local-mongoose"
import session from "express-session"

const app = express()
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())
mongoose.connect("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true })


const userSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    password: String,
    number: Number,
})
const User = mongoose.model("User", userSchema)


app.get("/", (req, res) => {
    res.render("landing.ejs",{user:req.session.user})
})

app.get("/login", (req, res) => {
    res.render("login.ejs",{user:req.session.user})
})

app.get("/register", (req, res) => {
    res.render("register.ejs",{user:req.session.user})
})

app.get("/parcel", (req, res) => {
    res.render("parcel.ejs",{   user:req.session.user})
})

app.get("/grocery", (req, res) => {
    res.render("grocery.ejs",{user:req.session.user})
})

app.get("/medicine", (req, res) => {
    res.render("medicine.ejs",{user:req.session.user})
})

app.get('/logout', (req, res) => {
    // Clear the user session
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/');
    });
});

app.post("/register", (req, res) => {
    User.findOne({ email: req.body.email })
        .then(async user => {
            if (user) {
                // If the user already exists, send an alert and redirect
                res.send('<script>alert("User Already Exists");</script>');
                res.redirect("/register");
            } else {
                // If the user does not exist, create a new user
                const hashedPassword = await bcrypt.hash(req.body.password, 10);
                const newUser = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.username,
                    email: req.body.email,
                    password: hashedPassword,
                    number: req.body.mobile,
                });
                // Save the new user and redirect to the homepage
                newUser.save()
                    .then(result => {
                        console.log(result);
                        res.render("landing.ejs",{user:req.session.user,name:req.session.user.name.charAt(0)});
                    })
                    .catch(err => {
                        console.error(err.message);
                        res.status(500).send("Error saving the user.");
                    });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({
                message: 'User registration failed',
                status: false,
            });
        });
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.send('<script>alert("User not found");</script>');
        }

        // Check if the password is correct using bcrypt.compare
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // Set the user session and redirect to the homepage
            req.session.user = user;
            return res.render("landing.ejs",{user:req.session.user,name:req.session.user.name.charAt(0)});
        } else {
            return res.send('<script>alert("Incorrect password");</script>');
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send("Error finding user.");
    }
});

app.listen(3000, () => {
    console.log("yes")
})
