var express = require('express');
var cors = require('cors');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();
var multer = require('multer');
var uuid = require('uuid/v4');
var validator = require('validator');
var path = require('path');
const helmet = require("helmet");


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public');
    },
    filename: function (req, file, cb) {
        cb(null, uuid() + file.originalname);
    }
});
var upload = multer({ storage: storage });

app.use(cors());
app.use(helmet({
    frameguard: false
}));
app.use(bodyParser.json({ limit: '100mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))
app.use(express.static('public'));


var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Eiss2020!',
    database : 'eiss'
});



connection.connect();


app.get('/news3', (req, res) => {
    connection.query("select * from news order by id desc limit 3", (error, result) => {
        res.json(result);
    });
});

app.get('/news', (req, res) => {
    connection.query("select * from news order by id desc", (error, result) => {
        res.json(result);
    });
});


app.get('/news/:id', (req, res) => {
    connection.query("select * from news where id=?", [req.params.id], (error, results) => {
        if (error) {
            res.status(404);
            res.send("Not found");
        }
        res.json(results);
    });
});

app.post('/news/update', upload.single('file'), (req, res) => {
    var insBody = "";
    var arr = [];
    if (req.file) {
        insBody = "update news set title=?, text=?, main_photo=? where id=?";
        arr = [req.body.title, req.body.text, req.file.filename, req.body.id];
    }
    else if (req.body.videoLink) {
        insBody = "update news set title=?, text=?, video_link=? where id=?";
        arr = [req.body.title, req.body.text, req.body.videoLink, req.body.id];
    }
    else {
        insBody = "update news set title=?, text=? where id=?";
        arr = [req.body.title, req.body.text, req.body.id];
    }
    connection.query(insBody, arr, (error, result) => {
        if (error) {
            res.status(403);
            res.send();
        }
        res.status(200);
        res.send();
    });
});

app.post('/newsvideo', upload.single('file'), (req, res) => {
    var insBody = "insert into news(title,text,video_link,main_photo,date) VALUES (?,?,?,?, ?)";
    connection.query(insBody, [req.body.title, req.body.text, req.body.video_link, req.file.filename, new Date().toISOString().slice(0, 10)], (error, result) => {
        if (error) {
            console.log(error.message);
            res.status(401);
            res.send("Произошла ошибка!");
        }
        else {
            res.status(200);
            console.log(new Date().toISOString().slice(0, 10));
            res.send("Добавлено!");
        }
    });
});

app.post('/news', upload.single('file'), (req, res) => {

    var insBody = "insert into news(title,text,main_photo,date) VALUES (?,?,?,?)";
    connection.query(insBody, [req.body.title, req.body.text, req.file.filename, new Date().toISOString().slice(0, 10)], (error, result) => {
        if (error) {
            console.log(error.message);
            res.status(401);
            res.send("Произошла ошибка!");
        }
        else {
            res.status(200);
            console.log(new Date().toISOString().slice(0, 10));
            res.send("Добавлено!");
        }
    });
});
app.post('/news/delete', (req, res) => {
    connection.query("delete from news where id=?", [req.body.info.id], (error, result) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log(result);
            fs.unlink('./public/' + req.body.info.main_photo, (err) => {
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});
app.get('/slider', (req, res) => {
    connection.query('select * from slider', (error, results) => {
        if (error) {
            console.log(error);
        }
        else {
            res.send(results);
        }
    });
});
app.post("/slider", upload.single('file'), (req, res) => {
    connection.query('insert into slider(image_path) values(?)', [req.file.filename], (err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.status(200);
            res.send("Successfully inserted");
        }
    });
});
app.post('/slider/update', upload.single('file'), (req, res) => {
    var insBody = "";
    var arr = [];
    if (req.file) {
        insBody = "update slider set image_path=? where slider_id=?";
        arr = [req.file.filename, req.body.id];
    }
    else {
        res.send("добавьте фото!")
    }
    connection.query(insBody, arr, (error, result) => {
        if (error) {
            console.log(error);

            res.status(403);
            res.send();
        }
        res.status(200);
        res.send();
    });
});
app.post("/slider/delete", (req, res) => {
    console.log(req.body.info);

    connection.query('delete from slider where slider_id=?', [req.body.info.slider_id], (err) => {
        if (err) {
            console.log(err);
        }
        else {
            fs.unlink('./public/' + req.body.info.image_path, (err) => {
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});
app.get("/voprsy", (req, res) => {
    connection.query("select * from questions order by id desc", (error, result) => {
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});
app.post('/voprsy', (req, res) => {
    if (validator.isEmpty(req.body.name) || !validator.isEmail(req.body.email) || validator.isEmpty(req.body.phone_number) || validator.isEmpty(req.body.message)) {
        throw new Error("pusto!!!");

    }
    else {
        connection.query("insert into questions(name,email,phone_number,message) values(?,?,?,?)",
            [req.body.name, req.body.email, req.body.phone_number, req.body.message]
            , (error, result) => {
                if (error) {
                    console.log(error);
                }
                else {
                    res.status(200);
                    res.send("inserted");
                }
            });
    }
});

app.post('/voprsy/delete', (req, res) => {
    connection.query("delete from questions where id=?",
        [req.body.id]
        , (error, result) => {
            if (error) {
                console.log(error);
            }
            else {
                res.status(200);
                res.send("Deleted");
            }
        });
});
app.get("/files", (req, res) => {
    connection.query("select * from files order by file_id desc", (error, result) => {
        if (error) {
            console.log(error);
        }
        res.send(result);
    });
});
app.post('/files', upload.single('file'), (req, res) => {
    var insBody = "insert into files(file_path) values(?)";
    connection.query(insBody, [req.file.filename], (error, result) => {
        if (error) {
            console.log(error);

            res.status(403);
            res.send("Error");
        }
        res.status(200);
        res.send("Good");
    });
});
app.post('/files/delete:file_id', (req, res) => {
    connection.query("delete from files where file_id=?", [req.params.file_id], (error, result) => {
        if (error) {
            res.status(404);
            res.send();
        }
        else {
            fs.unlink('./public/' + req.body.info.filename, (err) => {
                if (err) {
                    console.log(err);
                }
                res.status(200);
                res.send("Successfully deleted");
            });
        }
    });
});

//** Document requests /documents */

app.get('/documents/:doc_type_id', (req, res) => {
    try {
        //let query = "SELECT document.id, document.document_title, document.document_file_name, document.document_binary, document_type.doc_type_name, document_type.id FROM document, document_type WHERE document.document_type_id = document_type.id AND document_type.id = ?";
        let query = "SELECT document.id, document.document_title, document.document_file_name, document_type.doc_type_name FROM document, document_type WHERE document.document_type_id = document_type.id AND document_type.id = ?"
        let paramArray = [req.params.doc_type_id];
        connection.query(query, paramArray, (error, result) => {
            if (error) {
                console.error(error);
                res.status(500);
                res.send(error);
            }
            res.status(200);
            res.send(result);
        })
    }
    catch (Exception) {
        res.status(500).send(Exception);
    }
})

app.get('/documents/download/:doc_id', (req, res) => {
    try {
        let query = "SELECT document.document_file_name ,document.document_binary FROM document WHERE document.id = ?";
        let paramArray = [req.params.doc_id];
        connection.query(query, paramArray, (error, result) => {
            if (error || result.length === 0 || !result[0]) {
                console.error(error);
                res.status(500);
                res.send("Файл не найден!", error);
            }
            let blob = result[0].document_binary; //Column that contains the blob content
            console.log(blob);
            let filename = result[0].document_file_name;
            let absPath = path.join(__dirname, '/public/', filename);
            let relPath = path.join('./public', filename); // path relative to server root

            fs.writeFile(relPath, Buffer.from(new Uint8Array(blob)), (err) => {
                if (err) {
                    console.erro(err);
                }
                res.download(absPath, (err) => {
                    if (err) {
                        console.error(err);
                    }
                    fs.unlink(relPath, (err) => {
                        if (err) {
                            console.error(err);
                        }
                        console.log('FILE [' + filename + '] REMOVED!');
                    });
                });
            });
        });
    }
    catch (Exception) {
        res.status(500).send(Exception);
    }
})

app.put('/documents', (req, res) => {
    try {
        let prepared_query = "INSERT INTO document (document_title, document_type_id, document_file_name, document_binary) VALUES (?)";
        let query_values = [
            req.body.documentData.document_title,
            req.body.documentData.document_type_id,
            req.body.documentData.document_file_name,
            Buffer.from(req.body.documentData.document_binary.split("base64,")[1], "base64")
        ];
        connection.query(prepared_query, [query_values], (error, result) => {
            if (error) {
                console.error(error);
                res.status(403);
                res.send("Ошибка при загрузке нового документа!");
            }
            res.status(200);
            res.send("Успешно добавлен документ.");
        });
    }
    catch (Exception) {
        console.error(Exception);
        res.status(500).send(Exception);
    }
})

app.post('/documents', (req, res) => {
    try {
        let prepared_query = "";
        let query_values = [];
        if (req.body.documentData.document_binary) {
            prepared_query = "UPDATE document SET document_title = ?, document_file_name = ?, document_binary = ? WHERE id = ?";
            query_values = [
                req.body.documentData.document_title,
                req.body.documentData.document_file_name,
                Buffer.from(req.body.documentData.document_binary.split("base64,")[1], "base64"),
                req.body.documentData.document_id
            ]
        }
        else {
            prepared_query = "UPDATE document SET document_title = ?, document_file_name = ? WHERE id = ?";
            query_values = [
                req.body.documentData.document_title,
                req.body.documentData.document_file_name,
                req.body.documentData.document_id
            ]
        }

        connection.query(prepared_query, query_values, (error, result) => {
            if (error) {
                console.error(error);
                res.status(403);
                res.send("Ошибка при изменении документа!");
            }
            res.status(200);
            res.send("Успешно изменен документ.");
        });
    }
    catch (Exception) {
        console.error(Exception);
        res.status(500).send(Exception);
    }
})

app.delete('/documents/:doc_id', (req, res) => {
    try {
        let prepared_query = "DELETE FROM document WHERE document.id = ?";
        let paramArray = [req.params.doc_id];
        connection.query(prepared_query, paramArray, (error, result) => {
            if (error) {
                console.log(err);
                res.status(403);
                res.send("Документ не найден!", error);
            }
            res.status(200);
            res.send("Успешно удален документ!");
        })
    }
    catch (Exception) {
        console.error(Exception);
        res.status(500).send(Exception);
    }
})

app.get('/documents/types', (req, res) => {
    try {
        connection.query("SELECT * FROM document_type", (error, result) => {
            if (error) {
                console.error(error);
                res.status(500);
                res.send(error);
            }
            res.status(200);
            res.send(result);
        })
    }
    catch (Exception) {
        res.status(500).send(Exception);
    }
})

app.listen(5000, 'localhost', (err) => {
    if (err) {
        console.log(err);
    }
    else {
        console.log("Listening port 5000");
    }
});
