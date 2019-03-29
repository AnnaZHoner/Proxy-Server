"use strict";
// ######### IMPORTS   #############
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const http = require("http");
const https = require("https");
const WebSocket = require("ws");
const url = require("url");
const fs = require("fs");
// ######### CONSTS #############
const options = {
    key: fs.readFileSync('./src/key.pem'),
    cert: fs.readFileSync('./src/cert.pem')
};
const app = express();
const server = http.createServer(); //http as opposed to 
const sserver = https.createServer(options); //https
const wss = new WebSocket.Server({ server });
// ######### LETS #############
let black_list = JSON.parse(fs.readFileSync('./src/black_list.json', 'utf8')); //read fs for blist
let wBytes = 0, wTime = 0, wFiles = 0, tBytes = 0;
let cBytes = 0, cTime = 0, cFiles = 0;
let bkey = '';
let mng = "The Proxy has no records yet";
let hData;
let hHeader;
let hStatus;
let tstart = Date.now(), tend = Date.now();
let cache = {};
let blocked = {};
let consoleLog = new Array;
// ######### HTTP PROXY ########
server.on("request", (request, response) => {
    request.pause();
    let showurl = true;
    black_list.forEach((v) => {
        if (request.url.includes(v)) { //will stall page from loading
            bkey = v;
            showurl = false;
            return false;
        }
    });
    if (showurl) {
        if (typeof cache[request.url] != "undefined") { //set up cache in case of new site
            consoleLog.push("Cached page : " + request.url);
            response.writeHeader(cache[request.url].Status, cache[request.url].Header); //write cache header
            response.write(cache[request.url].Body);
            cFiles += 1;
            cTime += Number(cache[request.url].Time);
            cBytes += Number(cache[request.url].Bytes);
            consoleLog.push("Saved Bandwidth : " + cache[request.url].Bytes);
            consoleLog.push("Saved Time : " + cache[request.url].Time);
            request.pipe(response);
            request.resume();
        }
        else {
            tstart = Date.now();
            var options = url.parse(request.url);
            var connector = http.request(options, function (serverResponse) {
                serverResponse.pause();
                response.writeHeader(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(response);
                hStatus = serverResponse.statusCode;
                hHeader = serverResponse.headers;
                serverResponse.resume();
                hData = '';
                serverResponse.on('data', chunk => {
                    hData += chunk;
                });
                serverResponse.on('end', () => {
                    wFiles += 1;
                    consoleLog.push('request : ' + request.url);
                    if (typeof serverResponse.headers['content-length'] == "undefined") { //
                        wBytes = wBytes + 0;
                        tBytes = 0;
                        consoleLog.push("Bytes not declared");
                    }
                    else {
                        tBytes = Number(serverResponse.headers['content-length']);
                        consoleLog.push("Bytes: " + tBytes);
                        wBytes = wBytes + tBytes;
                        consoleLog.push(" Total Bytes so far : " + wBytes);
                    }
                    tend = Date.now();
                    consoleLog.push("Millisec: " + (tend - tstart));
                    wTime = wTime + (tend - tstart);
                    cache[request.url] = { Body: hData, Header: hHeader, Status: hStatus, Bytes: tBytes, Time: (tend - tstart) };
                    consoleLog.push(" Total Time so far : " + wTime);
                    consoleLog.push(" Total Files so far : " + wFiles);
                });
            });
            request.pipe(connector);
            request.resume();
        }
    }
    else { //block that boyo
        if (typeof blocked[request.url] == "undefined") {
            blocked[request.url] = { Freq: 1 };
        }
        else {
            blocked[request.url] = { Freq: blocked[request.url].Freq + 1 };
        }
        consoleLog.push(request.url + ' was blocked as it is containing the keyword ' + bkey);
        app.get('/', (req, res) => res.send(request.url + ' was blocked as it is containing the keyword ' + bkey));
        request.resume();
    }
    // ######### PAGE FORMATTING ########
    mng = "<html><body><form action='blacklist' method='post'><input type='submit'>";
    mng += "<table><tr><td><strong>Retrieved from Web</strong><div>Total bytes : " + wBytes + "</div>";
    mng += "<div>Total milliseconds : " + wTime + "</div><div>Total Files : " + wFiles + "</div></td>";
    mng += "<td><strong>Savings by using Cache</strong><div>Total bytes : " + cBytes + "</div>";
    mng += "<div>Total milliseconds : " + cTime + "</div><div>Total Files : " + cFiles + "</div>";
    mng += "</td></tr>";
    mng += "<tr><td><strong>Blacklist</strong><br><textarea id='bl' rows='6' cols='50'>";
    black_list.forEach((v) => {
        mng += v + "\n";
    });
    mng += "</textarea></td>";
    mng += "<td><strong>Cached Files</strong><br><textarea id='cf' rows='6' cols='50'>";
    for (let key in cache) {
        mng += key + "\n";
    }
    mng += "</textarea></td></tr>";
    mng += "<tr><td><strong>Messages</strong><br><textarea id='msg' rows='6' cols='50'>";
    for (let entry of consoleLog) {
        mng += entry + "\n";
    }
    mng += "</textarea></td>";
    mng += "<td><strong>Blocked Files</strong><br><textarea id='blocked' rows='6' cols='50'>";
    for (let key in blocked) {
        mng += key + " , Accessed " + Number(blocked[key].Freq) + " times\n";
        consoleLog.push("Client attempted to access " + key);
    }
    mng += "</textarea></td></tr></table></form></body><html>";
});
// ######### HTTPS PROXY ########
sserver.on("request", (request, response) => {
    consoleLog.push("   #########   SSL ######### ");
    request.pause();
    let showurl = true;
    black_list.forEach((v) => {
        if (request.url.includes(v)) {
            bkey = v;
            showurl = false;
            return false;
        }
    });
    if (showurl) {
        if (typeof cache[request.url] != "undefined") {
            consoleLog.push("Cached page : " + request.url);
            response.writeHeader(cache[request.url].Status, cache[request.url].Header);
            response.write(cache[request.url].Body);
            cFiles += 1;
            cTime += Number(cache[request.url].Time);
            cBytes += Number(cache[request.url].Bytes);
            consoleLog.push("Saved Bandwidth : " + cache[request.url].Bytes);
            consoleLog.push("Saved Time : " + cache[request.url].Time);
            request.pipe(response);
            request.resume();
        }
        else {
            tstart = Date.now();
            var options = url.parse(request.url);
            var connector = https.request(options, function (serverResponse) {
                serverResponse.pause();
                response.writeHeader(serverResponse.statusCode, serverResponse.headers);
                serverResponse.pipe(response);
                hStatus = serverResponse.statusCode;
                hHeader = serverResponse.headers;
                serverResponse.resume();
                hData = '';
                serverResponse.on('data', chunk => {
                    hData += chunk;
                });
                serverResponse.on('end', () => {
                    wFiles += 1;
                    consoleLog.push('request : ' + request.url);
                    if (typeof serverResponse.headers['content-length'] == "undefined") {
                        wBytes = wBytes + 0;
                        tBytes = 0;
                        consoleLog.push("Bytes not declared");
                    }
                    else {
                        tBytes = Number(serverResponse.headers['content-length']);
                        consoleLog.push("Bytes: " + tBytes);
                        wBytes = wBytes + tBytes;
                        consoleLog.push(" Total Bytes so far : " + wBytes);
                    }
                    tend = Date.now();
                    consoleLog.push("Millisec: " + (tend - tstart));
                    wTime = wTime + (tend - tstart);
                    cache[request.url] = { Body: hData, Header: hHeader, Status: hStatus, Bytes: tBytes, Time: (tend - tstart) };
                    consoleLog.push(" Total Time so far : " + wTime);
                    consoleLog.push(" Total Files so far : " + wFiles);
                });
            });
            request.pipe(connector);
            request.resume();
        }
    }
    else {
        if (typeof blocked[request.url] == "undefined") {
            blocked[request.url] = { Freq: 1 };
        }
        else {
            blocked[request.url] = { Freq: blocked[request.url].Freq + 1 };
        }
        consoleLog.push(request.url + ' was blocked as it is containing the keyword ' + bkey);
        app.get('/', (req, res) => res.send(request.url + ' was blocked as it is containing the keyword ' + bkey));
        request.resume();
    }
    // ######### PAGE FORMATTING ########    
    mng = "<html><body><form action='blacklist' method='post'><input type='submit'>";
    mng += "<table><tr><td><strong>Retrieved from Web</strong><div>Total bytes : " + wBytes + "</div>";
    mng += "<div>Total milliseconds : " + wTime + "</div><div>Total Files : " + wFiles + "</div></td>";
    mng += "<td><strong>Savings by using Cache</strong><div>Total bytes : " + cBytes + "</div>";
    mng += "<div>Total milliseconds : " + cTime + "</div><div>Total Files : " + cFiles + "</div>";
    mng += "</td></tr>";
    mng += "<tr><td><strong>Blacklist</strong><br><textarea id='bl' rows='6' cols='50'>";
    black_list.forEach((v) => {
        mng += v + "\n";
    });
    mng += "</textarea></td>";
    mng += "<td><strong>Cached Files</strong><br><textarea id='cf' rows='6' cols='50'>";
    for (let key in cache) {
        mng += key + "\n";
    }
    mng += "</textarea></td></tr>";
    mng += "<tr><td><strong>Messages</strong><br><textarea id='msg' rows='6' cols='50'>";
    for (let entry of consoleLog) {
        mng += entry + "\n";
    }
    mng += "</textarea></td>";
    mng += "<td><strong>Blocked Files</strong><br><textarea id='blocked' rows='6' cols='50'>";
    for (let key in blocked) {
        mng += key + " , Accessed " + Number(blocked[key].Freq) + " times\n";
    }
    mng += "</textarea></td></tr></table></form></body><html>";
});
// ######### WEBSOCKET PROXY ########
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        if (message != bkey) {
            var tstart = Date.now();
            ws.send(`Requested URL -> ${message}`);
            consoleLog.push("Bytes: " + message.length);
            wBytes = wBytes + message.length;
            wFiles += 1;
            var tend = Date.now();
            consoleLog.push("Millisec: " + (tend - tstart));
            wTime = wTime + tend - tstart;
            consoleLog.push(`Requested URL -> ${message}`);
        }
        else {
            var data = "The URL " + message + " was blocked";
            consoleLog.push(data);
            consoleLog.push(`Blocked URL -> ${message}`);
        }
    });
    ws.send('Hi there, I am a WebSocket server');
});
// ######### LISTENER ########
app.get('/Proxy', function (req, res) {
    res.send(mng);
});
app.post('/', function (req, res) {
    console.log(res);
});
server.listen(4000, () => {
    console.log(`Server started on port 4000!`);
});
sserver.listen(4443, () => {
    console.log(`SSL Server started on port 4443!`);
});
app.listen(3000, () => {
    console.log(`Proxy Monitoring at localhost:3000/Proxy!`);
});
console.log("Proxy has started");
//# sourceMappingURL=server.js.map