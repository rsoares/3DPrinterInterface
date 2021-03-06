// 3D Printer Interface
// Command line application to stream .gcode files directly to printer just by using ./modules/core.js module
//
// demos:
// 1- send gcode data to printer from file using command line ARGUMENTS
// $ node appcmd.js ./bin/gcode/demo.gcode
//
// 2- send gcode data to printer from STDIN pipe (file content stream using cat)
// $ cat ./bin/gcode/demo.gcode | node appcmd.js
//
// 3- send gcode data to printer from STDIN - manual insert GCODE on the console  + ENTER (interactive/manual control)
// $ node appcmd.js
// (enter commands): 
// M104 S200\n
// G28\n
// G90\n
// G21\n
// G92\n
// M82\n
// G1 Z0.200 F7800.000\n
//------------------------------------------------------------------

var fs = require('fs'),
	path = process.argv[2],
	readableStream,
	core = require('./modules/core.js');

//------------------------------------------------------------------
// objects initialization/configuration
//------------------------------------------------------------------
core.setCbAfterOpenPrinter(main);

// try interface without real 3d printer by using /dev/null
core.setConfigPrinter({serialport: "/dev/null", baudrate: 115200});
//core.setConfigPrinter({serialport: "/dev/tty.usbmodem621", baudrate: 115200});

// or (with 3d printer hardware) - alternative init method with args
//core.initializePrinter({serialport: "/dev/tty.usbmodem621", baudrate: 115200});

core.initializePrinter();

//------------------------------------------------------------------
// main
//------------------------------------------------------------------

function main () {
	console.log("Launching Main();");
	
	// check if .gcode file is inserted via command line arguments
	if (path !==undefined ) {
		readableStream = fs.createReadStream(path, {'bufferSize': 1 * 256});
		readableStream.setEncoding('utf8');
		readableStream.pipe(core.inputStreamPrinter);
		core.outputStreamPrinter.pipe(process.stdout);
	}
	else {
		console.log("Get stream from STDIN pipe...");
		// http://docs.nodejitsu.com/articles/advanced/streams/how-to-use-stream-pipe

		process.stdin.setEncoding('utf8');
		process.stdin.pipe(core.inputStreamPrinter, { end: false });
		core.outputStreamPrinter.pipe(process.stdout);
	}
}