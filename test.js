// nodejs test code.
// 
// Using NodeJS as a parser to syntax check and check for basic typos in base controller
// script.  Run test.cmd or type node test.js to run this tester.
//
// have to define any globals as this tester does not accumulate any namespace pollution as it
// runs, the bitwig javascript engine defines load() as something which pollutes the global
// namespace.  So we define globals explicitly here.
//
// Do not try to use the global keyword in Bitwig APIs, Bitwig apis are not  NodeJS.
// 



const util = require('util');

function println(msg) {
    console.log(msg);
}

var load_level = 0;

function load(afile) {
    load_level++;
    println("BEGIN load "+afile);
    n = require("./"+afile);
    load_level--;

    println("END load "+afile);
    
    println(" >>> "+util.inspect(n, {showHidden: false, depth: null, colors: true}));
    println("-- ");
    println(" ");

}

global.Page = function Page() {
    this.canScrollLeft = false;
    this.canScrollRight = false;
    this.canScrollUp = false;
    this.canScrollDown = false;
};

// load pages first if we want to check they aren't missing curly brackets or have extra curly brackets or parens.
println("--------------------------");
println("page checks begin");

load('launchpad_mixer.js');
load('launchpad_grid.js');
load('launchpad_keys.js');

println("page checks complete");
println("--------------------------");

println(" ");
println("master script checks begin ");

/*
function load(afile)
{

var fs = require('fs');
eval(fs.readFileSync(afile)+'');

}*/

global.velocities2 = [];
for	(index = 127; index > -1; index--)
{
    global.velocities2[velocities2.length] = index;  // javascript, genius or shit. you decide.
}

function initArray(n,m) {
    return [[],[]];
}

function loadAPI(level) {
    println("loadAPI "+level)
}

global.loadAPI = loadAPI;
global.load = load;
global.host = {
    defineController: function(a,b,c,d) {},
    defineMidiPorts:function(a,b) {},
    addDeviceNameBasedDiscoveryPair(a) {},
    test(a) {}


 };
global.initArray = initArray;

global.Page = function Page() {
    this.canScrollLeft = false;
    this.canScrollRight = false;
    this.canScrollUp = false;
    this.canScrollDown = false;
};
global.LED_COUNT = 0;



load('Launchpad.control.js');

println("Scan complete. ");

