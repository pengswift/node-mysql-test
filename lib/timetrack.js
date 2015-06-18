var qs = require('querystring');

//发送html
exports.sendHtml = function(res, html) {
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(html));
    res.end(html);
};

//解析html post请求
exports.parseReceivedData = function(req, cb) {
    var body = '';
    req.setEncoding('utf8');
    req.on('data', function(chunk){ body += chunk });
    req.on('end', function() {
        var data = qs.parse(body);
        cb(data);
    });
};

//渲染简单表格
exports.actionForm = function(id, path, label) {
    var html = '<form method="POST" action="' + path + '">' +
        '<input type="hidden" name="id" value="' + id + '">' +
        '<input type="submit" value="' + label + '" />' +
        '</form>';
    return html;
};

//添加数据
exports.add = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {   //解析post请求
        db.query(
            "INSERT INTO work (hours, date, description) " + 
            " VALUES (?, ?, ?)",   //insert sql
            [work.hours, work.date, work.description],  //数据
            function(err) {
                if (err) throw err;
                exports.show(db, res);                  //显示数据
            }
        );
    });
};

//删除数据 
exports.delete = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {
        db.query(
            "DELETE FROM work WHERE id=?",
            [work.id],
            function(err) {
                if (err) throw err;
                exports.show(db, res);               //显示界面
            }
        );
    });
};

//更新数据 
exports.archive = function(db, req, res) {
    exports.parseReceivedData(req, function(work) {
        db.query(
            "UPDATE work SET archived=1 WHERE id=?",
            [work.id],
            function(err) {
                if(err) throw err;
                exports.show(db, res);
            }
        );
    });
};

//显示数据
exports.show = function(db, res, showArchived) {
    //查找
    var query = "SELECT * FROM work " + 
        "WHERE archived=? " +
        "ORDER BY date DESC";

    var archiveValue = (showArchived) ? 1 : 0;
    db.query(
      query,
      [archiveValue],
      function(err, rows){
          if(err) throw err;
          //没有归档，显示归档href
          var html = (showArchived)
            ? ''
            : '<a href="/archived">Archived Work</a><br/>';
          //将结果格式化成表格
          html += exports.workHitlistHtml(rows);
          //form表单
          html += exports.workFormHtml();
          //发送数据
          exports.sendHtml(res, html);
      }
    );
};

exports.showArchived = function(db, res) {
    exports.show(db, res, true); //只显示归档工作记录
};

exports.workHitlistHtml = function(rows) {
    var html = '<table>';
    for(var i in rows) {
        html += '<tr>';
        html += '<td>' + rows[i].date + '</td>';
        html += '<td>' + rows[i].hours + '</td>';
        html += '<td>' + rows[i].description + '</td>';

        if (!rows[i].archived) {
            html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
        }
        html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
        html += '</tr>';
    }
    html += '<table>';
    return html;
};

exports.workFormHtml = function() {
    var html = '<form method="POST" action="/">' +
        '<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
        '<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
        '<p>Description:<br/>' +
        '<textarea name="description"></textarea></p>' +
        '<input type="submit" value="Add" />' +
        '</form>';
    return html;
};

exports.workArchiveForm = function(id) {
    return exports.actionForm(id, '/archive', 'Archive');
};

exports.workDeleteForm = function(id) {
    return exports.actionForm(id,'/delete', 'Delete');
};
