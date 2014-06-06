//get necessary modules
var http = require('http'),
    path = require('path'),
    fs = require('fs'),
    qs = require('querystring'),

    //Keep these values in sync with client's
    possibleThrows = ['rock', 'paper', 'scissors'],
    formName = 'throw';
 
//create the server
http.createServer(handleRequest).listen(3000);
console.log('Server running at http://127.0.0.1:3000/');
console.log('Prepare for merciless baattleeegwuaaarrghgh!!!');

/**
 * Handles the client's rock/paper/scissors POST
 * otherwise serves initial index.html
 *
 * @req request information from the client
 * @res result object that connects with the client
 */
function handleRequest(req, res) {
    if(req.method=='POST') {
        handleThrow(req, res);
    }
    else {
        serveFile('index.html', res);
    }
};

/**
 * @return The folder in which this project's static files reside
 */
function getLocalFolder() {
    return __dirname + '/public/';
}

/**
 * Serves an existing file within the local folder
 * 
 * @param  fileName name of the file to serve
 * @param  res      result object that connects with the client
 */
function serveFile(fileName, res) {
    var filePath = getLocalFolder() + fileName;

    //read the file, run the anonymous function
    fs.readFile(filePath, function(err, contents) {
        if(!err) {
            res.end(contents);
        } else {
            //for our own troubleshooting
            console.dir(err);
        };
    });
}

/**
 * Generate's the server's throw, generates a new HTML result page,
 * and serves the new page to the client
 *
 * @req request information from the client
 * @res result object that connects with the client
 */
function handleThrow(req, res) {
    var body = '',
        userThrow,
        serverThrowNum = (Math.floor(Math.random() * 3)),
        serverThrow = possibleThrows[serverThrowNum],
        resultPage;

    req.on('data', function (data) {
        body += data;
        if (body.length > 1e6) {
            req.connection.destroy();
        } else {
            userThrow = qs.parse(body)[formName];
            console.log(userThrow);
            
            //write the HTTP header
            res.writeHead(200, {'Content-Type': 'text/html'});

            //generate and serve the result page
            resultPage = generateResultPage(userThrow, serverThrow);
            res.write(resultPage);
            res.end();
        }
    });
}

/**
 * Constructs a new HTML page which displays the results of
 * the rock/paper/scissors game between user and server
 * 
 * @param  userThrow    the move played by the user 
 * @param  serverThrow  the move played by the server
 * @return a new HTML page
 */
function generateResultPage(userThrow, serverThrow) {
    var tieLoseWin = 0, //-1 lose, 0 tie, 1 win
        headerList = ['Tie!', 'You Lose!', 'You Win!'],
        explanationList = [
            'heroically neutralizes',
            'is demolished by the awesome power of',
            'mercilessly smites'
        ],
        header,
        explanation,
        html;

    //Determine tie/Loss/Win situation
    if(userThrow === 'rock') {
        if(serverThrow === 'paper') {
            tieLoseWin = 1;
        } else if(serverThrow === 'scissors') {
            tieLoseWin = 2;
        }
    }
    else if(userThrow === 'paper') {
        if(serverThrow === 'scissors') {
            tieLoseWin = 1;
        } else if(serverThrow === 'rock') {
            tieLoseWin = 2;
        }
    } else { //userThrow === 'scissors'
        if(serverThrow === 'rock') {
            tieLoseWin = 1;
        } else if(serverThrow === 'paper') {
            tieLoseWin = 2;
        }
    }

    //Construct the response page
    header = headerList[tieLoseWin];
    explanation = explanationList[tieLoseWin];

    html = '<h1>' + header + '</h1>';
    html += '<p>Your <b>' + userThrow + '</b> ' + explanation +
                ' your opponent\'s <b>' + serverThrow + '</b></p>';
    html += '<form action="http://localhost:3000" target="_self" method="get">'
    html += '<input type="submit" value="Reset">'
    html += '</form>'

    return html;
}