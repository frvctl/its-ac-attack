var compress=require("./compress");
var util=require("util");
var fs=require("fs");

// Read in our test file
var data = fs.readFileSync("filetest.js", "binary");
util.puts("Got : "+data.length);

// Set output file
var fd = fs.openSync("filetest.js.gz", 'w', 0644);
util.puts("Openned file");

// Create gzip stream
var gzip=new compress.Gzip;
gzip.init();

// Pump data to be compressed
gzdata=gzip.deflate(data, "binary");  // Do this as many times as required
util.puts("Compressed size : "+gzdata.length);
var pos = fs.writeSync(fd, gzdata, 0, "binary");

// Get the last bit
gzlast=gzip.end();
util.puts("Last bit : "+gzlast.length);
fs.writeSync(fd, gzlast, pos, "binary");
fs.closeSync(fd);
util.puts("File closed");

// See if we can uncompress it ok
var gunzip=new compress.Gunzip;
gunzip.init();
var testdata = fs.readFileSync("filetest.js.gz", "binary");
util.puts("Test opened : "+testdata.length);
util.puts(gunzip.inflate(testdata, "binary").length);
gunzip.end();






