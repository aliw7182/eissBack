var express=require('express');
var cors=require('cors');
var mysql= require('mysql');
var bodyParser=require('body-parser');
var fs=require('fs');
var app=express();
var multer=require('multer');
var uuid=require('uuid/v4');
var validator = require('validator');


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
app.use(bodyParser.json({limit: '100mb', extended: true}))
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}))
app.use(express.static('public'));


var connection=mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Eiss2020!',
    database : 'energy'
});



connection.connect();


app.get('/news3',(req,res)=>{
    connection.query("select * from news order by id desc limit 3",(error,result)=>{
        res.json(result);
    });
});

app.get('/news',(req,res)=>{
    connection.query("select * from news order by id desc",(error,result)=>{
        res.json(result);
    });
});


app.get('/news/:id',(req,res)=>{
    connection.query("select * from news where id=?",[req.params.id],(error,results)=>{
        if (error) {
            res.status(404);
            res.send("Not found");
        }
        res.json(results);
    });
});

app.post('/news/update',upload.single('file'),(req,res)=>{
    var insBody="";
    var arr=[];
    if (req.file) {
        insBody="update news set title=?, text=?, main_photo=? where id=?";
        arr=[req.body.title,req.body.text,req.file.filename,req.body.id];
    }
    else{
        insBody="update news set title=?, text=? where id=?";
        arr=[req.body.title,req.body.text,req.body.id];
    }
    connection.query(insBody,arr,(error,result)=>{
        if (error) {
            res.status(403);
            res.send();
        }
        res.status(200);
        res.send();
    });
});
app.post('/news',upload.single('file'),(req,res)=>{
    
     var insBody ="insert into news(title,text,main_photo,date) VALUES (?,?,?,?)";
     connection.query(insBody,[req.body.title,req.body.text,req.file.filename,new Date().toISOString().slice(0, 10)],(error,result)=>{
         if (error) {
                console.log(error.message);
                res.status(401);
                res.send("Произошла ошибка!");
        }
        else{
                res.status(200);
                console.log(new Date().toISOString().slice(0, 10));
                res.send("Добавлено!");
            }
        });
});
app.post('/news/delete',(req,res)=>{
    connection.query("delete from news where id=?",[req.body.info.id],(error,result)=>{
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
    connection.query('insert into slider(image_path) values(?)',[req.file.filename],(err)=>{
        if (err) {
            console.log(err);
        }
        else{
            res.status(200);
            res.send("Successfully inserted");  
        }
    });
});
app.post('/slider/update',upload.single('file'),(req,res)=>{
    var insBody="";
    var arr=[];
    if (req.file) {
        insBody="update slider set image_path=? where slider_id=?";
        arr=[req.file.filename,req.body.id];
    }
    else{
        res.send("добавьте фото!")
    }
    connection.query(insBody,arr,(error,result)=>{
        if (error) {
            console.log(error);
            
            res.status(403);
            res.send();
        }
        res.status(200);
        res.send();
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
app.get("/voprsy",(req,res)=>{
    connection.query("select * from questions order by id desc",(error,result)=>{
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});
app.post('/voprsy',(req,res)=>{
     if (validator.isEmpty(req.body.name)||!validator.isEmail(req.body.email)||validator.isEmpty(req.body.phone_number)||validator.isEmpty(req.body.message)) {
        throw new Error("pusto!!!");

        }
    else{
    connection.query("insert into questions(name,email,phone_number,message) values(?,?,?,?)",
        [req.body.name,req.body.email,req.body.phone_number,req.body.message]
        ,(error,result)=>{
            if(error){
                console.log(error);
            }
            else{
                res.status(200);
                res.send("inserted");
            }
        });
}
});

app.post('/voprsy/delete',(req,res)=>{
    connection.query("delete from questions where id=?",
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
app.get("/files",(req,res)=>{
    connection.query("select * from files order by file_id desc",(error,result)=>{
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});
app.post('/files',upload.single('file'),(req,res)=>{
    var insBody="insert into files(file_path) values(?)";
    connection.query(insBody,[req.file.filename],(error,result)=>{
        if (error) {
            console.log(error);
            
            res.status(403);
            res.send("Error");
        }
        res.status(200);
        res.send("Good");
    });
});
app.post('/files/delete:file_id',(req,res)=>{
    connection.query("delete from files where file_id=?",[req.params.file_id],(error,result)=>{
        if (error) {
            res.status(404);
            res.send();
        }
        else{
            fs.unlink('./public/'+req.body.info.filename,(err)=>{
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});

app.listen(5000,'localhost',(err)=>{
    if (err) {
        console.log(err);
    }
    else{
        console.log("Listening port 5000");
    }
});
