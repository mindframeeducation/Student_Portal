var mongoose = require('mongoose');
var EmailList = require('./models/emailList');

var emails = [
    "cynthdelgado@gmail.com",
    "susman24_99@yahoo.com",
    "dtnishikawa@gmail.com",
    "kbarnes@smartneighborhood.net",
    "setabdahc@yahoo.com",
    "samantha.carrier@glassmile.net",
    "gloria_jiang@yahoo.com",
    "shanila.danish@gmail.com",
    "matt.dinep@gmail.com",
    "susan_b_ellis@hotmail.com",
    "espinalec22@gmail.com",
    "lancealee@hotmail.com",
    "edwin.lee.jr@outlook.com",
    "amattei8@gmail.com",
    "aehild@gmail.com",
    "ruchi_juneja81@yahoo.com",
    "suneetha.kalluru@gmail.com",
    "novymichele@gmail.com",
    "kestnera2011@gamil.com",
    "peter@vonkuebler.com",
    "jlawler5vt@yahoo.com",
    "reid.leatzow@gmail.com",
    "ling0710@yahoo.com",
    "rkjerlujan@gmail.com",
    "eileen.luterzo@gmail.com",
    "smadduluri@gmail.com",
    "manjunath.huchanna@gmail.com",
    "cmcgeehan@hotmail.com",
    "chrsmckeon@yahoo.com",
    "amayomoore@gmail.com",
    "judy33@gmail.com",
    "bbean11@aol.com",
    "ejoliveira2005@gmail.com",
    "jrparrotte56@aol.com",
    "motuul@yahoo.com",
    "krisnarich@gmail.com",
    "jenhammer7607@gmail.com",
    "hemalathal@yahoo.com",
    "swetha1810@gmail.com",
    "mssexto@gmail.com",
    "dwanas@gmail.com",
    "Scalione@comcast.net",
    "yunfeihao@yahoo.com",
    "ryan.w.snead@gmail.com",
    "sharon.wilson269@gmail.com",
    "teamthompson0701@gmail.com",
    "trujillo.alena@gmail.com",
    "shefali_tyagi@yahoo.com",
    "choudary0863@yahoo.com",
    "urickfamily@hotmail.com",
    "ypalomo8@gmail.com",
    "Danawelti@gmail.com",
    "charlenekwilliams@yahoo.com",
    "carolinewizeman@gmail.com",
    "blacklist2412@gmail.com",
    "thinhdcao@outlook.com",
    "wojtkielo@hotmail.com",
    "bgirdher@gmail.com",
];

function seedEmail(){
    EmailList.remove({}, function(err){
        if (err){
            console.log("Error clearing email list database");
        }
        EmailList.create({name: "All", emails: []}, function(err, list){
            if (err){
                console.log("Error creating email list");
            } else {
                emails.forEach(function(email){
                    list.emails.push(email);
                });
                list.save();
            }
            console.log("The email list is: " + list.emails);
        });
        console.log("All emails added to database");
    });
}
module.exports = seedEmail;