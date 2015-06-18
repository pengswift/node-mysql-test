var http = require('http');
var work = require('./lib/timetrack');
var mysql = require('mysql');

//db信息
var db = mysql.createConnection({
    host:     '127.0.0.1',
    user:     'root',
    password: '',
    database: 'timetrack'
});

var server = http.createServer(function(req, res) {
    switch(req.method) {
        case 'POST':
            switch(req.url) {
                case '/':
                    //添加
                    work.add(db, req, res);
                    break;
                case '/archive':
                    //归档
                    work.archive(db, req, res);
                    break;
                case '/delete':
                    //删除
                    work.delete(db, req, res);
                    break;
            }
            break;
        case 'GET': 
            switch(req.url) {
                case '/':
                    //显示所有
                    work.show(db, res);
                    break;
                case '/archived':
                    //显示已更新的
                    work.showArchived(db, res);
            }
            break;
    }    
});

// work(id, hours, date, archived, description)
db.query(
   "CREATE TABLE IF NOT EXISTS work ("
   + "id INT(10) NOT NULL AUTO_INCREMENT, "
   + "hours DECIMAL(5,2) DEFAULT 0, "
   + "date DATE, "
   + "archived INT(1) DEFAULT 0, "
   + "description LONGTEXT, "
   + "PRIMARY KEY(id))",
   function(err) {
     if (err) throw err;
     console.log('Server started...');
     server.listen(10000);
   }
);

