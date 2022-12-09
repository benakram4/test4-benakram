// require mongoose and setup the Schema
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var User; // to be defined on new connection (see initialize)
const URL = "mongodb+srv://mongoose:mongoose16@weba6.nnj8k3q.mongodb.net/?retryWrites=true&w=majority";
// require bcrypt for password hashing
const bcrypt = require('bcrypt');

//make a user schema with email and password
var userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

exports.startDB = () => {
    return new Promise( (resolve, reject) => {
        const db = mongoose.createConnection(URL,  {useNewUrlParser: true, useUnifiedTopology: true}, function (err) {
            if (err) {
                console.log(`\nError connecting to MongoDB Atlas: ${err}\n`);
                reject(err);
            } 
            else {
                console.log(`\nConnected to MongoDB Atlas\n`);
                User = db.model("final_users", userSchema);
                resolve();
            }
        });
    });
}

//register a new user
exports.register = function (userData) {
    return new Promise ( (resolve, reject) => {
        if(userData.password == null || userData.password.trim() == ""
            || userData.email == null || userData.email.trim() == ""){
            reject("Error: email or password cannot be empty.");
        }
        else{
            bcrypt.hash(userData.password, 10)
            .then((hash)=>{
                userData.password = hash;
                let newUser = new User(userData);
                newUser.save()
                .then(() => {
                    console.log(`\nUser ${userData.email} registered\n`);
                    resolve();
                })
                .catch((err) => {
                    if (err.code == 11000) {
                        console.log(`\nUser ${userData.email} already exists\n`);
                        reject(`Error: ${userData.email} already exists`);
                    }
                    else {
                        console.log(`\nError registering user: ${err}\n`);
                        reject("Error: cannot create the user: " + err);
                    }
                });
            })
            .catch((err) => {
                reject("There was an error encrypting the password: " + err);
            });
        }
    });
}

//check if user exists
exports.signIn = function (userData) {
    return new Promise(function (resolve, reject) {
        User.findOne({ email: userData.email })
            .exec()
            .then((foundUser) => {
                if (!foundUser) {
                    console.log(`\nUser not found for email: ` + userData.email + `\n`);
                    reject("Cannot find the user: " + userData.email);
                }
                else {
                    bcrypt.compare(userData.password, foundUser.password).then((res) => {
                        if (res === true) {
                            console.log(`\nUser found for email: ` + userData.email + `\n`)
                            resolve(foundUser);
                        }
                        else {
                            console.log(`\n“Incorrect password for user ` + userData.email + ` but password does not match\n`)
                            reject("Incorrect password for user" + userData.email);
                        }
                    });
                }
            }
            )
            .catch((err) => {
                console.log(`\nError finding user: ` + err + `\n`);
                reject("Error finding user: " + err);
            });
    });
}



