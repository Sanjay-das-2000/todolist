const express = require("express")
const bodyparser = require("body-parser")
const { application } = require("express")
const mongoose = require("mongoose")

mongoose.connect("mongodb+srv://admin-sanjay:x1t2x02u5a@cluster0.ih4vz.mongodb.net/todolistDB")

const itemSchema = {
    name: String
}

const Item = mongoose.model("Item", itemSchema)

const item1 = new Item({
    name: "movie"
})

const item2 = new Item({
    name: "walk"
})

const item3 = new Item({
    name: "party"
})

const itemarray = [item1, item2, item3]

const listSchema = {
    name: String,
    topics: [itemSchema]
}

const List = mongoose.model("List",listSchema)



const app = express()

app.set('view engine', 'ejs')                            //use ejs as view engine 
app.use(bodyparser.urlencoded({extended: "true"}))
app.use(express.static("public"))                       //use static folder in the pc 

app.get("/", function(req,res){
    Item.find({}, function(err,founditems){
        if(founditems.length === 0){
            Item.insertMany(itemarray, function(err){
                if(err){
                    console.log("Error occured!")
                } 
                else{
                    console.log("Items added successfully")
                }
            })
        res.redirect("/")
        }
        else{
            res.render("list", {listtitle: "today", newlistitems: founditems})                  
        }
    })
                                                                            
} )

app.get("/:topic",function(req,res){
    const topicname = req.params.topic

    List.findOne({name: topicname}, function(err,founditem){
        if(err){
            console.log("Error occured!")
        }
        else{
            if(founditem){
                res.render("list", {listtitle: founditem.name, newlistitems: founditem.topics})
            }
            else{
                const list = new List({
                    name: topicname,
                    topics: itemarray
                })

                list.save()
                res.redirect("/"+topicname)
            }
        }

    })

})

app.post("/", function(req,res){    
    const itemname = req.body.event
    const listname = req.body.list

    const item = new Item({
        name: itemname
    })

    if(listname === "today"){
        item.save()
        res.redirect("/")
    }
    else{
        List.findOne({name: listname}, function(err,founditem){
            founditem.topics.push(item)
            founditem.save()
            res.redirect("/"+listname)
        })
    }


})

app.post("/delete", function(req,res){
    const itemid = req.body.checkbox
    const listname = req.body.listname

    if(listname === "today"){
        Item.findByIdAndRemove(itemid, function(err){
            if(err){
                console.log("Error occured!")
            } 
            else{
                console.log("Items deleted successfully")
                res.redirect("/")
    
            }
        })
    }
    else{
        List.findOneAndUpdate({name: listname},{$pull:{topics:{_id:itemid}}}, function(err){
            if(err){
                console.log("Error occured!")
            } 
            else{
                console.log("Items deleted successfully")
                res.redirect("/"+listname)
            }
        })
    }



})


app.listen(3000, function(){
    console.log("Server is running on port 3000")
})