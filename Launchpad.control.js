// Launchpad Split MK1 WP : 2022-03-04
//
// Novation Launchpad script variant by Warren.Postma@gmail.com
// Early rework at API Level 10.
//
//
//  This script has been through probably 500 different peoples hands and has been largely hacked to death.
//
// Main GRID mode is a split of clip view plus half the area is for playing midi notes.
//
// If this script is being maintained newer versions will be at
// https://github.com/wpostma/LaunchpadScriptV3 


var trace=0;
var view_shift=0; // 0,1,2,3,4 when cursor_down is pressed.

// USER SETTINGS

//don't change this
var userVarPans = 8;

// Playing of pad on velocity change is turned off, setting this to true will turn it on
var userVelNote = false;

// New velocity setup, has a set number for low and high, and you use the two middle buttons to index the rest of the velocities.velocity setup is in Launchpad_Step_Sequencer.js
var velocities2 = [];
for	(index = 127; index > -1; index--)
{
    velocities2[velocities2.length] = index;
}

// Start the API
loadAPI(10);

// This stuff is all about defining the script and getting it to autodetect and attach the script to the controller
host.defineController("Novation", "Launchpad Split MK1 WP", "1.0", "e6a21650-92f0-11ea-ab12-0800200c9a66");
host.defineMidiPorts(1, 1);

function showPopupNotification( amsg) {
   println('::> '+amsg);
   host.showPopupNotification( amsg);
}
  
var activeNotes = null;
var playing=0;




// Special section for Linux users
if(host.platformIsLinux())
{
	for(var i=1; i<16; i++)
	{
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad S " + + i.toString() + " MIDI 1"], ["Launchpad S " + + i.toString() + " MIDI 1"]);
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini " + + i.toString() + " MIDI 1"], ["Launchpad Mini " + + i.toString() + " MIDI 1"]);
	}
}

// TempMode is a variable used for the Temporary views used in ClipLauncher mode.
var TempMode =
{
   OFF:-1,
   VOLUME:0,
   PAN:1,
   SEND_A:2,
   SEND_B:3,
   TRACK:4,
   SCENE:5,
   USER1:6,
   USER2:7,
   USER3:8
};

// loads up the other files needed
load("launchpad_constants.js"); // contains CCs, Colour values and other variables used across the scripts
load("launchpad_page.js"); // defines the page type which is used for the different pages on the Launchpad
load("launchpad_notemap.js"); // works out all the notemaps, the scales and drawing of the black and white keys
load("launchpad_grid.js"); // draws the main clip launcher and other pages such as volume, pan, sends, and user controls
load("launchpad_keys.js"); // draws the keys as set in launchpad_notemap and places them across the pads
load("launchpad_step_sequencer.js"); // everything to do with the step sequencer

// activePage is the page displayed on the Launchpad, the function changes the page and displays popups
var activePage = null;

var transport = null;
var offset = null;
var quant = null;

function sendMidiOut(status,data1,data2) {
   println("sendMidi "+status+" "+data1+" "+data2);
   host.getMidiOutPort(0).sendMidi(status,data1,data2);
}

function setActivePage(page)
{
   if (trace>0) {
      println("setActivePage "+page)
   }
   var isInit = activePage == null;
    

    

   if (page != activePage)
   {
      activePage = page;
      if (!isInit)
      {
         showPopupNotification(":::"+page.title);
      }

      updateNoteTranlationTable();
      updateVelocityTranslationTable();

      // Update indications in the app
      for(var p=0; p<8; p++)
      {
         var track = trackBank.getTrack(p);
         track.getClipLauncher().setIndication(activePage == gridPage);
      }
   }
}

// This sets the order of the buttons on the track control temporary mode
var TrackModeColumn =
{
   STOP:0,
   SELECT:1,
   ARM:2,
   SOLO:3,
   MUTE:4,
   RETURN_TO_ARRANGEMENT:7
};


var TEMPMODE = -1;

var IS_GRID_PRESSED = false;
//var IS_EDIT_PRESSED = false;
var IS_KEYS_PRESSED = false;
//var IS_RECORD_PRESSED = false;
var IS_SHIFT_PRESSED = false;

// Declare arrays which are used to store information received from Bitwig about what is going on to display on pads
var volume = initArray(0, 8);
var pan = initArray(0, 8);
var mute = initArray(0, 8);
var solo = initArray(0, 8);
var arm = initArray(0, 8);
var isMatrixStopped = initArray(0, 8);
var isSelected = initArray(0, 8);
var isQueuedForStop = initArray(0, 8);
var trackExists = initArray(0, 8);
var sendA = initArray(0, 8);
var sendB = initArray(0, 8);
var vuMeter = initArray(0, 8);
var masterVuMeter = 0;
var isDrumMachine = false;

var userValue = initArray(0, 24);

var hasContent = initArray(0, 64);
var isPlaying = initArray(0, 64);
var isRecording = initArray(0, 64); // recording states.
var isQueued = initArray(0, 64);
var isStopQueued = initArray(0, 64);
var noteInput = null;

var isSetPressed = false;

// Observer functions to store receive information into the above arrays
function getTrackObserverFunc(track, varToStore)
{
   return function(value)
   {
      varToStore[track] = value;
   }
}

//TVbene added support for more than 8 tracks
function getGridObserverFunc( track, varToStore)
{
   return function(scene, value)
   {
      var i=0;
      if (track < 8) {
          i = scene*8 + track;
       } 
       else {  i =track + 24;
       };
       
       varToStore[i] = value;

   }
}

var noteOn = initArray(false, 128);
WRITEOVR = false;

var sceneBank = null;

// The init function gets called when initializing by Bitwig
function init()
{
   // setup MIDI in
   host.getMidiInPort(0).setMidiCallback(onMidi);

   sceneBank = host.createSceneBank(4);

   noteInput = host.getMidiInPort(0).createNoteInput("Launchpad", "80????", "90????");
   noteInput.setShouldConsumeEvents(false);

   // Create a transport and application control section
   transport = host.createTransport();
   transport.isPlaying().markInterested();
   application = host.createApplication();
   transport.addIsPlayingObserver (function(pPlaying) {
      playing = pPlaying;
      // if(playing) {
      //     playButton.turnOn();
      // } else {
      //     playButton.turnOff();
      // }
   });
   transport.addLauncherOverdubObserver(function(state){
        WRITEOVR=state;
   });
   

//TVbene: variables for post record delay and default clip launch quantization
	transport.getClipLauncherPostRecordingTimeOffset().markInterested();
	transport.defaultLaunchQuantization().markInterested();
	quant = transport.defaultLaunchQuantization();
	offset = transport.getClipLauncherPostRecordingTimeOffset();


   
   // a Trackbank is the tracks, sends and scenes being controlled, these arguments are set to 8,2,8 in the launchpad_constants.js file changing them will change the size of the grid displayed on the Bitwig Clip Launcher
   trackBank = host.createMainTrackBank(NUM_TRACKS, NUM_SENDS, NUM_SCENES)
 //  var t9 = trackBank.scrollToTrack (9);

   // This scrolls through the controllable tracks and clips and picks up the info from Bitwig to later display/control, it stores them in the arrays declared above
   for(var t=0; t<NUM_TRACKS; t++)
   {
      var track = trackBank.getChannel(t);

      track.getVolume().addValueObserver(8, getTrackObserverFunc(t, volume));
      track.getPan().addValueObserver(userVarPans, getTrackObserverFunc(t, pan));
      track.getSend(0).addValueObserver(8, getTrackObserverFunc(t, sendA));
      track.getSend(1).addValueObserver(8, getTrackObserverFunc(t, sendB));    
      track.getMute().addValueObserver(getTrackObserverFunc(t, mute));
      track.getSolo().addValueObserver(getTrackObserverFunc(t, solo));
      track.getArm().addValueObserver(getTrackObserverFunc(t, arm));
      track.getIsMatrixStopped().addValueObserver(getTrackObserverFunc(t, isMatrixStopped));
      track.exists().addValueObserver(getTrackObserverFunc(t, trackExists));
      track.addVuMeterObserver(7, -1, true, getTrackObserverFunc(t, vuMeter));
      track.addIsSelectedObserver(getTrackObserverFunc(t, isSelected));
      track.addIsQueuedForStopObserver(getTrackObserverFunc(t, isQueuedForStop));
       
      var clipLauncher = track.getClipLauncherSlots();

		clipLauncher.addHasContentObserver(getGridObserverFunc(t, hasContent));


      clipLauncher.addIsPlayingObserver(getGridObserverFunc(t, isPlaying));
      clipLauncher.addIsRecordingObserver(getGridObserverFunc(t, isRecording));
      clipLauncher.addIsQueuedObserver(getGridObserverFunc(t, isQueued));
      clipLauncher.addIsStopQueuedObserver(getGridObserverFunc(t, isStopQueued)); 
      clipLauncher.addIsSelectedObserver(getGridObserverFunc(t, isSelected));      //TVbene
      //var primaryDevice = track.getDeviceChain.hasDrumPads(isDrumMachine);
       //println(isDrumMachine);
	  
      
   }

   // These next 4 pick up whether the Clip Launcher can be moved
   trackBank.addCanScrollTracksUpObserver(function(canScroll)
   {
      gridPage.canScrollTracksUp = canScroll;
   });

   trackBank.addCanScrollTracksDownObserver(function(canScroll)
   {
      gridPage.canScrollTracksDown = canScroll;
   });

   trackBank.addCanScrollScenesUpObserver(function(canScroll)
   {
      gridPage.canScrollScenesUp = canScroll;
   });

   trackBank.addCanScrollScenesDownObserver(function(canScroll)
   {
      gridPage.canScrollScenesDown = canScroll;
   });
   
   // Cursor track allow selection of a track
   cursorTrack = host.createArrangerCursorTrack(0, 0);
   cursorTrack.addNoteObserver(seqPage.onNotePlay);

   // cursorTrack.playingNotes().addValueObserver(function(notes) {
   //    activeNotes = notes;
   // });

   deviceBank = cursorTrack.createDeviceBank(1);
   //primaryDevice = deviceBank.getDevice(1);
   //println(primaryDevice);
    //isDrumMachine = primaryDevice.addNameObserver(10, "noDevice", blah);

   // Picks up the Master Track from Bitwig for use displaying the VuMeter
   masterTrack = host.createMasterTrack(0);
   masterTrack.addVuMeterObserver(8, -1, true, function(level)
   {
      masterVuMeter = level;
   });

   // Picks up the controllable knobs, buttons which have been set via "Learn Controller Assignment". There are 24 set here because there are 3 pages of user controls with 8 assignable controls on each
   userControls = host.createUserControls(24);

   for(var u=0; u<24; u++)
   {
      var control = userControls.getControl(u);

      control.addValueObserver(8, getTrackObserverFunc(u, userValue));
      control.setLabel("U" + (u+1));
   }


   // Call resetdevice which clears all the lights
   resetDevice();
   setGridMappingMode();
   setActivePage(gridPage);

   updateNoteTranlationTable();
   updateVelocityTranslationTable();
   // Calls the function just below which displays the funky Bitwig logo, which ends the initialization stage 

   println("init complete. on grid page. type trace=1 to output trace info.")

   host.scheduleTask(polledFunction,  100);
}

function polledFunction() {
  flushLEDs();
 // println("polling");
 //println( "isRecording[0]="+isRecording[0] );
 
  host.scheduleTask(polledFunction,  500);
}

 

// Function called on exit of the script
function exit()
{
   resetDevice();
}

// Reset all lights by sending MIDI and sets all values in the pendingLEDs array to 0
function resetDevice()
{
   println("resetDevice");

   sendMidi(0xB0, 0, 0);

   for(var i=0; i<80; i++)
   {
      pendingLEDs[i] = 0;
   }
  // flushLEDs();
}

// I'm not sure what these functions do
// enableAutoFlashing and setGridMappingMode are called during initialization.
// setDutyCycle is called by the animateLogo function, They are likely something to do with light display



function setGridMappingMode()
{
   sendMidi(0xB0, 0, 1);
}

function updateNoteTranlationTable()
{
   //println("updateNoteTranlationTable");
   var table = initArray(-1, 128);

   for(var i=0; i<128; i++)
   {
      var y = i >> 4;
      var x = i & 0xF;

      if (x < 8 && activePage.shouldKeyBeUsedForNoteInport(x, y))
      {
         table[i] = activeNoteMap.cellToKey(x, y);
      }
   }

   noteInput.setKeyTranslationTable(table);
}

function updateVelocityTranslationTable()
{
   var table = initArray(seqPage.velocity, 128);
   table[0] = 0;

   noteInput.setVelocityTranslationTable(table);
}
function sendRawMidi(status,data1,data2)
{
   noteInput.sendRawMidiEvent(status,data1,data2);
}


// This is the main function which runs whenever a MIDI signal is sent
// You can uncomment the printMIDI below to see the MIDI signals within Bitwigs Controller script console

function onMidi(status, data1, data2)
{
   if (trace>0){
	printMidi(status, data1, data2);
   }
   if (MIDIChannel(status) != 0) return;

   if (isChannelController(status))
   {
      if (trace>0){
       println("onMidi ischannelcontroller: data1="+data1+" data2="+data2);
      }

      // isPressed checks whether MIDI signal is above 0 in value declaring that button is being pressed
      var isPressed = data2 > 0;

	  // This section changes the page within the script displayed on the device
	  // data1 is the CC, the CC values are defined within the launchpad_contants script and range from 104 to 111 for the topbuttons
      switch(data1)
      {
         case TopButton.CURSOR_UP:
            if (isPressed)
            {  
               println("play="+playing);
               if (playing != 0) 
               {	
                  transport.stop();
                  showPopupNotification("Stop");
               }
               else
               {  showPopupNotification("Play");
                  transport.play();

               }
            }
            break;
         case TopButton.CURSOR_DOWN:
            if (isPressed)
            {  
              // VIEW
              
              view_shift = view_shift +1;
              if(view_shift>3) {
                 view_shift=0;
              }
              println("view_shift "+view_shift);
            }
            else
            {
               //view_shift=0;
            }
            break;

         case TopButton.CURSOR_LEFT:
            if (isSetPressed)  {
               println("isSetPressed-left");
         }   
         //trackBank.scrollChannelsPageUp()
         //trackBank.scrollChannelsPageDown()
         // 
         // 
            if (isPressed) {
               isSetPressed ? deviceBank.scrollUp() : cursorTrack.selectPrevious();
            }
            break;

         case TopButton.CURSOR_RIGHT:
            if (isSetPressed)  {
                  println("isSetPressed-right");
            }   
            if (isPressed) {
               isSetPressed ? deviceBank.scrollDown() : cursorTrack.selectNext();
            }
            break;
	
         case TopButton.SESSION:
            
            isSetPressed  = isPressed;
            println("isSetPressed="+isSetPressed)
            break;

         case TopButton.USER1:
           
                println("user1");
         
                activePage.onUser1(isPressed);
                if(IS_KEYS_PRESSED)
                {
                    IS_KEYS_PRESSED=false;
                }

            break;

         case TopButton.USER2:
            activePage.onUser2(isPressed);

            break;

         case TopButton.MIXER:
            activePage.onShift(isPressed);
                if (isPressed)
                {
                    IS_SHIFT_PRESSED = true;
                }
                else
                {
                    if(IS_SHIFT_PRESSED)
                    {
                        IS_SHIFT_PRESSED=false;
                    }
                }
            break;
      }
   }

   if (isNoteOn(status) || isNoteOff(status, data2))
   {
      var row = data1 >> 4;
      var column = data1 & 0xF;
         
      if (trace>0) {
      println(" button : row = " + row + "col = " + column)
      }
	  
         
      if (column < 8)
      {
         activePage.onGridButton(row, column, data2 > 0);
      }
      else
      {
         activePage.onSceneButton(row, data2 > 0);
      }
   }
}

// Clears all the lights
function clear()
{
   for(var i=0; i<80; i++)
   {
      pendingLEDs[i] = Colour.OFF;
   }
}

function flush()
{
    activePage.updateOutputState();


 //  flushLEDs();
}



// Sends the Top LED lights to the pendingLEDs array. LED top have a value of 72 to 80
function setTopLED(index, colour)
{
   pendingLEDs[LED.TOP + index] = colour;
}

// Sends the right LED lights to the pendingLEDs array. LED scene have a value of 64 to 72
function setSceneLEDColor(index, colour)
{
   pendingLEDs[LED.SCENE + index] = colour;
}


// Sends the main pads to the pendingLEDs array. LED scene have a value of 0 to 63
function setCellLED(column, row, colour)
{
   var key = row * 8 + column;

   pendingLEDs[key] = colour;
}

function setCellLED2(track, colour)
{
   var key = track;

   pendingLEDs[key] = colour;
}
/** Cache for LEDs needing to be updated, which is used so we can determine if we want to send the LEDs using the
 * optimized approach or not, and to send only the LEDs that has changed.
 */
 
 // arrays of 80 buttons, the main 64 pads and the 8 at the top and 8 at side. Pending is used for lights to be sent, active contains the lights already on

var pendingLEDs = new Array(80);
var activeLEDs = new Array(80);

// This function compares the LEDs in pending to those in active and if there is a difference it will send them via MIDI message
// If there is more than 30 lights changed it sends the MIDI in a single message ("optimized mode") rather than individually
function flushLEDs()
{

	// changedCount contains number of lights changed
   var changedCount = 0;

   // count the number of LEDs that are going to be changed by comparing pendingLEDs to activeLEDs array
   for(var i=0; i<80; i++)
   {
      if (pendingLEDs[i] != activeLEDs[i]) changedCount++;
   }

   // exit function if there are none to be changed
   if (changedCount == 0) return;

   //uncommenting this displays a count of the number of LEDs to be changed
   //println("Repaint: " + changedCount + " LEDs");

   // if there is a lot of LEDs, use an optimized mode (which looks to me like it sends all in one MIDI message
   //TVbene changed to prevent optimised mode
   if (changedCount > 100)
   {
      // send using channel 3 optimized mode
      for(var i = 0; i<80; i+=2)
      {
         sendMidi(0x92, pendingLEDs[i], pendingLEDs[i+1]);
         activeLEDs[i] = pendingLEDs[i];
         activeLEDs[i+1] = pendingLEDs[i+1];
      }
      sendMidi(0xB0, 104 + 7, activeLEDs[79]); // send dummy message to leave optimized mode
   }
   // if not a lot of LEDs need changing send them in individual MIDI messages
   else
   {
      for(var i = 0; i<80; i++)
      {
         if (pendingLEDs[i] != activeLEDs[i])
         {
            activeLEDs[i] = pendingLEDs[i];

            var colour = activeLEDs[i];

            if (i < 64) // Main Grid
            {
               var column = i & 0x7;
               var row = i >> 3;
               sendMidi(0x90, row*16 + column, colour);
            }
            else if (i < 72)    // Right buttons
            {
               sendMidi(0x90, 8 + (i - 64) * 16, colour);
            }
            else    // Top buttons
            {
               sendMidi(0xB0, 104 + (i - 72), colour);
            }
         }
      }
   }
}

// This function is not called anywhere within the rest of the Launchpad script. textToPattern sounds like it may have been the start of displaying text on the Launchpad, or could be left from another script for another device.

/* Format text into a bit pattern that can be displayed on 4-pixels height */

function textToPattern(text)
{
   var result = [];

   for(var i=0; i<text.length; i++)
   {
      if (i != 0) result.push(0x0); // mandatory spacing

      switch (text.charAt(i))
      {
         case '0':
            result.push(0x6, 0x9, 0x6);
            break;

         case '1':
            result.push(0x4, 0xF);
            break;

         case '2':
            result.push(0x5, 0xB, 0x5);
            break;

         case '3':
            result.push(0x9, 0x9, 0x6);
            break;

         case '4':
            result.push(0xE, 0x3, 0x2);
            break;
      }
   }

   return result;
}
