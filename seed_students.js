var mongoose    = require("mongoose"),
    Student     = require("./models/student");

var student_data = [
    { name: { first: "Ashley",          last: "Shortnacy"},         grade: 3, entries: [] },
    { name: { first: "Xavier",          last: "Villalta"},          grade: 4, entries: [] },
    { name: { first: "Jahzara",         last: "Shabazz"},           grade: 3, entries: [] },
    { name: { first: "Maxwell",         last: "Moses"},             grade: 3, entries: [] },
    { name: { first: "Alexander",       last: "Silva"},             grade: 1, entries: [] },
    { name: { first: "Brandon",         last: "Silva"},             grade: 3, entries: [] },
    { name: { first: "Alex",            last: "Scherbina"},         grade: 4, entries: [] },
    { name: { first: "Samantha",        last: "Moore"},             grade: 4, entries: [] },
    { name: { first: "Naomi",           last: "Trujillo-Torress"},  grade: 3, entries: [] },
    { name: { first: "Daniel",          last: "Sexton"},            grade: 3, entries: [] },
    { name: { first: "Ian",             last: "Welti"},             grade: 3, entries: [] },
    { name: { first: "Anna",            last: "Welti"},             grade: 1, entries: [] },
    { name: { first: "Caden",           last: "Lesser"},            grade: 5, entries: [] },
    { name: { first: "Ava",             last: "Lesser"},            grade: 2, entries: [] },
    { name: { first: "Nathan",          last: "Wizeman"},           grade: 4, entries: [] },
    { name: { first: "Madison",         last: "Lawler"},            grade: 3, entries: [] },
    { name: { first: "Tristan",         last: "Luterzo"},           grade: 2, entries: [] },
    { name: { first: "Leonardo",        last: "Oliveira"},          grade: 4, entries: [] },
    { name: { first: "Gabriel",         last: "Dinep"},             grade: 4, entries: [] },
    { name: { first: "Marcus",          last: "Robinson"},          grade: 3, entries: [] },
    { name: { first: "Lily",            last: "Kuebler"},           grade: 4, entries: [] },
    { name: { first: "Emily",           last: "Lujan"},             grade: 5, entries: [] },
    { name: { first: "Ryan",            last: "Lujan"},             grade: 4, entries: [] },
    { name: { first: "Silas",           last: "Bates"},             grade: 3, entries: [] },
    { name: { first: "Naomi",           last: "Bates"},             grade: 1, entries: [] },
    { name: { first: "Alyce",           last: "Snead"},             grade: 4, entries: [] },
    { name: { first: "Jayanth",         last: "Kalluru"},           grade: 3, entries: [] },
    { name: { first: "Leila",           last: "Barkhordari"},       grade: 2, entries: [] },
    { name: { first: "Zack",            last: "Barnes"},            grade: 4, entries: [] },
    { name: { first: "Abdul",           last: "Mansoor"},           grade: 5, entries: [] },
    { name: { first: "Makaiyla",        last: "Thimothee"},         grade: 2, entries: [] },
    { name: { first: "Rishi",           last: "Madduluri"},         grade: 3, entries: [] },
    { name: { first: "Ainsley",         last: "Garthwaite-Lee"},    grade: 4, entries: [] },
    { name: { first: "Harman",          last: "Singh Kapoor"},      grade: 2, entries: [] },
    { name: { first: "Akshara",         last: "Sanapala"},          grade: 2, entries: [] },
    { name: { first: "Anjali",          last: "Sanapala"},          grade: 4, entries: [] },
    { name: { first: "Olivia",          last: "Scalione"},          grade: 3, entries: [] },
    { name: { first: "Aditya",          last: "Tyagi"},             grade: 5, entries: [] },
    { name: { first: "Sharat",          last: "Sakamuri"},          grade: 3, entries: [] },
    { name: { first: "Tristan",         last: "Alva"},              grade: 2, entries: [] },
    { name: { first: "Brendan",         last: "Alva"},              grade: 4, entries: [] },
    { name: { first: "Isabel",          last: "Leatzow"},           grade: 1, entries: [] },
    { name: { first: "Jackson",         last: "Ellis"},             grade: 4, entries: [] },
    { name: { first: "Alexander",       last: "Prah"},              grade: 5, entries: [] },
    { name: { first: "James (Chip)",    last: "Hallihan"},          grade: 4, entries: [] },
    { name: { first: "Autumm",          last: "Hild"},              grade: 3, entries: [] },
    { name: { first: "Nara",            last: "Poling"},            grade: 3, entries: [] },
    { name: { first: "Alexander",       last: "McKeon"},            grade: 5, entries: [] },
    { name: { first: "Twisha",          last: "Juneja"},            grade: 1, entries: [] },
    { name: { first: "Michener",        last: "Childs"},            grade: 2, entries: [] },
    { name: { first: "Daniel",          last: "Cheng"},             grade: 4, entries: [] },
    { name: { first: "Tristan",         last: "Thompson"},          grade: 2, entries: [] },
    { name: { first: "Taylor",          last: "Thompson"},          grade: 5, entries: [] },
    { name: { first: "Ilana",           last: "Kaspi"},             grade: 4, entries: [] },
    { name: { first: "Jacob",           last: "Kaspi"},             grade: 2, entries: [] },
    { name: { first: "Kaydynce",        last: "Roberts"},           grade: 4, entries: [] },
    { name: { first: "Abishek",         last: "Unnava"},            grade: 5, entries: [] },
    { name: { first: "Medha",           last: "Unnava"},            grade: 3, entries: [] },
    { name: { first: "Layla",           last: "Elosta"},            grade: 1, entries: [] },
    { name: { first: "Aiko",            last: "Nickerson"},         grade: 2, entries: [] },
    { name: { first: "Sanjana",         last: "Girdher"},           grade: 2, entries: [] },
    { name: { first: "Akshay",          last: "Girdher"},           grade: 2, entries: [] },
    { name: { first: "Gavin",           last: "Wojtkielo"},         grade: 2, entries: [] },
    { name: { first: "Nolan",           last: "Y. Leung"},          grade: 2, entries: [] },
    { name: { first: "Karen",           last: "Tun"},               grade: 4, entries: [] },
    { name: { first: "Sara",            last: "Tun"},               grade: 3, entries: [] },
    { name: { first: "Aarnav",          last: "Bujamella"},         grade: 2, entries: [] },
    { name: { first: "Harshitha",       last: "Manjunath"},         grade: 4, entries: [] },
    { name: { first: "Cara",            last: "McGeehan"},          grade: 4, entries: [] },
    { name: { first: "Ayan",            last: "Chohan"},            grade: 4, entries: [] },
    { name: { first: "Alexis",          last: "Wilcox"},            grade: 5, entries: [] },
    { name: { first: "Yianni",          last: "Balasis"},           grade: 2, entries: [] },
    { name: { first: "Tehya",           last: "Richardson"},        grade: 4, entries: [] },
    { name: { first: "Ze",              last: "Gao"},               grade: 2, entries: [] },
    { name: { first: "Amara",           last: "Poling"},            grade: 6, entries: [] },
    { name: { first: "Camila",          last: "Espinal"},           grade: 6, entries: [] },
    { name: { first: "William",         last: "Murck"},             grade: 7, entries: [] },
    { name: { first: "Xavier",          last: "Newbell"},           grade: 6, entries: [] },
    { name: { first: "Tyler",           last: "Thompson"},          grade: 8, entries: [] },
    { name: { first: "Bryan",           last: "Cheng"},             grade: 7, entries: [] },
    { name: { first: "Sumanth",         last: "Kalluru"},           grade: 6, entries: [] },
    { name: { first: "Thrisha",         last: "Sakamuri"},          grade: 6, entries: [] },
    { name: { first: "Griffin",         last: "Carrier"},           grade: 6, entries: [] },
    { name: { first: "Joykaran",        last: "Singh Kapoor"},      grade: 7, entries: [] },
    { name: { first: "Adrian",          last: "Timmons"},           grade: 7, entries: [] },
    { name: { first: "Mikhel",          last: "Dickason"},          grade: 9, entries: [] },
    { name: { first: "Siddha",          last: "Bombardekar"},       grade: 3, entries: [] },
    { name: { first: "Kyle",            last: "Hunter"},            grade: 0, entries: [] },
    { name: { first: "Zhanali",         last: "Imambekov"},         grade: 0, entries: [] },
    { name: { first: "Addie",           last: "Jones"},             grade: 0, entries: [] },
    { name: { first: "Anderson",        last: "Jones"},             grade: 0, entries: [] },
    { name: { first: "Haarika",         last: "Kalahsti"},          grade: 0, entries: [] },
    { name: { first: "Ryan",            last: "Pesak"},             grade: 0, entries: [] },
    { name: { first: "Sofia",           last: "Pola"},              grade: 0, entries: [] },
    { name: { first: "Shruthi",         last: "Solaiappan"},        grade: 0, entries: [] },
    { name: { first: "Bryan",           last: "Tang"},              grade: 0, entries: [] },
    { name: { first: "Idan",            last: "Travisky"},          grade: 0, entries: [] },
    { name: { first: "Vishal",          last: "Vinjamuri"},         grade: 0, entries: [] },
];

function seedDB(){
    Student.remove({},function(err){
        if (err){
            console.log("There is an error removing students");
        }
        console.log("Removed all students from DB");
        // Adding new students to the db
        student_data.forEach(function(student){
            Student.create(student, function(err,newStudent){
                if (err){
                    console.log("There is an error creating student");
                } else {
                    console.log("New student added!");
                    newStudent.save(); // Save to database
                }
            });
        });
    });
}
// send the seedDB function to whatever file that calls/requires it
module.exports = seedDB; 