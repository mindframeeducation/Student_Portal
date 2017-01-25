var mongoose = require("mongoose");
var ClassList = require("./models/classList");

var classes = [
    "Python",
    "Java",
    "Robotics", 
    "Engineering", 
    "Science",
    "Digital Arts",
    "Game Design",
    "Game Design & Digital Arts",
    "Robotics & Engineering",
    "Jr. Robotics & Engineering",
    "Math & Digital Literacy",
    "Mobile App Development"
];

function seedClass(){
    ClassList.remove({}, function(err){
        if (err){
            console.log("Error clearing class list database");
        }
        ClassList.create({name: "All", emails: []}, function(err, classList){
            if (err){
                console.log("There is an error creating class list");
            } else {
                classes.forEach(function(eachClass){
                    classList.allClasses.push(eachClass);
                });
                classList.save();
            }
            console.log("The class list is: " + classList.allClasses);
        });
    });
}

module.exports = seedClass;