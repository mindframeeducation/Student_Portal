# README #

## Mindframe Education Students' Portal ##

### Quick summary ###

* A simple application that allows parents to track their child/children's progress 

### Version ###

* Currently at version 1.0.0. Current features are:
    * Separate sign up routes for instructors and parents
    * Password change and reset
    * Restricted registration: only emails that are stored in the backend system can register
    * Parents can only see the notes and progress for their child/children
    * 3 access control levels:
         + Public: User only has read access to contents that they are assigned to by admin    
         + User: User has full read access and restricted write access: he can add content and edit contents that he created
         + Admin: User has full read and write access
    * Create new: entry, blog, student
    * Edit: entry, blog, student
    * Delete: entry, blog

### How do I get set up? ###
* Clone the repository using:

```
#!git

git clone origin git@bitbucket.org:mindframeeducation/studentportal.git

```
* To test run this app:
  * Clone the repository to your workspace
  * Install and configure MongoDB. If you are using cloud9, you can follow the instructions here: [how to set up MongoDB](https://community.c9.io/t/setting-up-mongodb/1717)
  * Have 2 terminal tabs opened
  * In the first terminal tab (where you have your MongoDB setup), run: 
```
#!git

./mongod
```
  * In the second terminal (where your cloned directory is), run:

```
#!git
export ENV_VAR="mongodb://localhost/blogData"

node app.js
```
  * You should be up and running. If you see an error saying "There is an error connecting to the database", check the previous steps on how to configure your MongoDB database

### Contribution guidelines ###
To develop a new feature, please follow the following procedure:


### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact