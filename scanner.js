#!/usr/bin/env node

var program = require('commander');

program
    .version('0.1.0')
    .description('Pi Net Barcode scanner HTTP/S POST Kitchtory Client')
    .option('-a, --address <hostname>', 'Required Hostname or IP of Kitchtory Server HTTP/S POST Endpoint')
    .option('-p, --port <port>', 'Optional port for HTTP/S POST Endpoint, if not 80 or 443')
    .option('-s, --ssl', 'SSL Switch, use if Kitchtory is behind an SSL proxy')
    .parse(process.argv);

if (!program.address) {

    program.help()

} else {

	var usbScanner = require('node-usb-barcode-scanner').usbScanner;
	var request = require('request');

	//initialize HID usb barcode scanner
    var scanner = new usbScanner();

    //parse program args to determine endpoint
    var port = program.port ? ":" + program.port : ""
    var endPoint = program.ssl ? "https://" + program.address + port + "/api/barcode" : "http://" + program.address + port + "/api/barcode"

    //wait for data events from scanner and post to kitchtory server
    scanner.on("data", function(code) {
        console.log("Sending barcode: " + code);
        request.post(
            endPoint, {
                json: {
                    barcode: code,
                    scanned: Date()
                }
            },
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                } else {
                	console.log(error)
                }
            }
        );

    });

}