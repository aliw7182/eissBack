var express=require('express');
var cors=require('cors');
var mysql= require('mysql');
var bodyParser=require('body-parser');
var fs=require('fs');
var app=express();
var multer=require('multer');
var uuid=require('uuid/v4');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public');
    },
    filename: function (req, file, cb) {
      cb(null, uuid()+file.originalname);
    }
  });
  var upload=multer({storage:storage});

app.use(cors());
app.use(bodyParser.json({limit: '10mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}))
app.use(express.static('public'));


var connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'bekzat',
    password : 'Kizilorda-2000',
    database : 'subaru'
});

connection.connect();

app.get('/special_offers3',(req,res)=>{
    connection.query("select * from special_offers order by id desc limit 3",(error,result)=>{
        res.json(result);
    });
});

app.get('/special_offers',(req,res)=>{
    connection.query("select * from special_offers order by id desc",(error,result)=>{
        res.json(result);
    });
});


app.get('/special_offers/:id',(req,res)=>{
    connection.query("select * from special_offers where id=?",[req.params.id],(error,results)=>{
        if (error) {
            res.status(404);
            res.send("Not found");
        }
        res.json(results);
    });
});

app.post('/special_offers',upload.single('file'),(req,res)=>{
    
     var insBody ="insert into special_offers(title,text,main_photo,date) VALUES (?,?,?,?)";
     connection.query(insBody,[req.body.title,req.body.text,req.file.filename,new Date().toISOString().slice(0, 10)],(error,result)=>{
         if (error) {
                console.log(error.message);
                res.status(401);
                res.send("Произошла ошибка!");
        }
        else{
                res.status(200);
                res.send("Добавлено!");
            }
        });
});

app.post('/special_offers/delete',(req,res)=>{
    connection.query("delete from special_offers where id=?",[req.body.info.id],(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            console.log(result);
            fs.unlink('./public/'+req.body.info.main_photo,(err)=>{
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});

app.get('/slider',(req,res)=>{
   connection.query('select * from slider',(error,results)=>{
       if (error) {
           console.log(error);
       }
       else{
           res.send(results);
       }
   });
});

app.post("/slider",upload.single('file'),(req,res)=>{
    connection.query('insert into slider(image_path,link_path) values(?,?)',[req.file.filename,req.body.link_path],(err)=>{
        if (err) {
            console.log(err);
        }
        else{
            res.status(200);
            res.send("Successfully inserted");  
        }
    });
});

app.post("/slider/delete",(req,res)=>{
    console.log(req.body.info);
    
    connection.query('delete from slider where slider_id=?',[req.body.info.slider_id],(err)=>{
        if (err) {
            console.log(err);
        }
        else{
            fs.unlink('./public/'+req.body.info.image_path,(err)=>{
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});

app.get("/test_drive",(req,res)=>{
    connection.query("select * from test_drive  order by id desc",(error,result)=>{
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});

app.get("/check_subaru",(req,res)=>{
    connection.query("select * from check_subaru  order by id desc",(error,result)=>{
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});


app.get("/voprsy",(req,res)=>{
    connection.query("select * from voprsy order by id desc",(error,result)=>{
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});

app.post('/test_drive',(req,res)=>{
    connection.query("insert into test_drive(name,email,phone_number,car_model) values(?,?,?,?)",
        [req.body.name,req.body.email,req.body.phone_number,req.body.car_model]
        ,(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("Inserted");
        }
    }); 
});

app.post('/test_drive/delete',(req,res)=>{
    connection.query("delete from test_drive where id=?",[req.body.id],(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("Deleted");
        }
    });
});


app.post('/voprsy',(req,res)=>{
    connection.query("insert into voprsy(name,email,phone_number,message) values(?,?,?,?)",
        [req.body.name,req.body.email,req.body.phone_number,req.body.message]
        ,(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("Inserted");
        }
    }); 
});

app.post('/voprsy/delete',(req,res)=>{
    connection.query("delete from voprsy where id=?",
        [req.body.id]
        ,(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("Deleted");
        }
    }); 
});

app.post('/check_subaru',(req,res)=>{
    connection.query("insert into check_subaru(name,email,phone_number,vin) values(?,?,?,?)",
        [req.body.name,req.body.email,req.body.phone_number,req.body.vin]
        ,(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("Inserted");
        }
    }); 
});

app.post('/check_subaru/delete',(req,res)=>{
    connection.query("delete from check_subaru where id=?",
        [req.body.id]
        ,(error,result)=>{
        if (error) {
            console.log(error);
        }
        else{
            res.status(200);
            res.send("deleted");
        }
    }); 
});



app.listen(5000,(err)=>{
    if (err) {
        console.log(err);
    }
    else{
        console.log("Listening port 5000");
    }
});
