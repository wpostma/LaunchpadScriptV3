// LAUNCHPADWP : 2023-03-23
//
// 2023-03-23 RESTORED ARROW KEYS TO SCROLLING UP AND DOWN AMONG SCENES.
//
// Novation Launchpad script variant by Warren.Postma@gmail.com
// Heavily modified script for live KEYS AND GUITAR PLAYING.
//
// API Level 10 
//
//
//   Originally this was an 8 scenes (ROWS) x 8 track clip (COLUMNS) launcher grid.
//
//   Warren's version adds a splittable layout option.
//   When split the top half is a clip launcher grid for four tracks, designed for the clip launcher/mixer layout 
//   where the tracks are vertical and scenes are horizontal:
//             [TRACK1]  [TRACK2]  [TRACK3]
//    [SCENE1]  ....      ....       ....
//    [SCENE2]  ....      ....       ....
//
//   When the split feature is activated, the bottom half is a keyboard note or midi CC transmitter.
//
//   The UP/Down arrow MOVES THE SCENE BANK (YELLOW SQUARES) UP AND DOWN
//   THE LEFT/RIGHT ARROW MOVES THE TRACK WHICH IS ACTIVE WHICH IS PARTICULARLY USEFUL FOR LIVE PLAYING ON BITWIG 
//   USER1 = PLAY/STOP
//
//   SESSION = [META]  FOR KEY COMBINATIONS  
//   USER2   = [MODE]  FOR KEY COMBINATIONS
//   MIXER   = [SHIFT] FOR KEY COMBINATIONS
//
//
// TODO:
//
//  * Delete (clear) clip content
//  * double clip content
//  * overdub 
//
// If this script is being maintained newer versions will be at
// https://github.com/wpostma/LaunchpadScriptV3 
//

var trace= 0; //  type trace=1 in the controller script console to enable most debug messages
var view_shift=0; // 0,1,2,3,4 when cursor_down is pressed.
var activeNotes = null;
var playing=0;
var userVarPans = 8; // DO NOT CHANGE
var userVelNote = false; // false recommended, true NOT recommended.
var MUSICAL_STOP_STATE = 0;
var MasterTrackVolume = 1.0;
 


// New velocity setup, has a set number for low and high, and you use the two middle buttons to index the rest of the velocities.velocity setup is in Launchpad_Step_Sequencer.js
var velocities2 = [];
for	(index = 127; index > -1; index--)
{
    velocities2[velocities2.length] = index;  // javascript, genius or shit. you decide.
}

// Start the API
loadAPI(10);

// This stuff is all about defining the script and getting it to autodetect and attach the script to the controller
host.defineController("Novation", "Launchpad Split MK1 WP", "1.0", "e6a21650-92f0-11ea-ab12-0800200c9a66");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Launchpad"], ["Launchpad"]);

host.addDeviceNameBasedDiscoveryPair(["Launchpad S"], ["Launchpad S"]);
host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini"], ["Launchpad Mini"]);
for(var i=1; i<20; i++)
{
   var name = i.toString() + "- Launchpad";
   host.addDeviceNameBasedDiscoveryPair([name], [name]);
//   host.addDeviceNameBasedDiscoveryPair(["Launchpad MIDI " + i.toString()], ["Launchpad MIDI " + i.toString()]);
//   host.addDeviceNameBasedDiscoveryPair(["Launchpad S " + i.toString()], ["Launchpad S " + i.toString()]);
//   host.addDeviceNameBasedDiscoveryPair(["Launchpad S MIDI " + i.toString()], ["Launchpad S MIDI " + i.toString()]);
//   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini " + i.toString()], ["Launchpad Mini " + i.toString()]);
//   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini MIDI " + i.toString()], ["Launchpad Mini MIDI " + i.toString()]);
}

function showPopupNotification( amsg) {
   println('::> '+amsg);
   host.showPopupNotification( amsg);
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
load("LaunchpadWP_constants.js"); // contains CCs, Colour values and other variables used across the scripts
load("LaunchpadWP_page.js"); // defines the page type which is used for the different pages on the Launchpad
load("LaunchpadWP_notemap.js"); // works out all the notemaps, the scales and drawing of the black and white keys
load("LaunchpadWP_grid.js"); // draws the main clip launcher and other pages such as volume, pan, sends, and user controls
load("LaunchpadWP_keys.js"); // draws the keys as set in launchpad_notemap and places them across the pads
load("LaunchpadWP_mixer.js"); // CC faders you can map to anything, or faders mapped to tracks.
load("LaunchpadWP_step_sequencer.js"); // everything to do with the step sequencer

//var mixerPage = {};



var pageModes = [ gridPage, keysPage,seqPage,mixerPage, false ];
gridPage.pageIndex = 0;
keysPage.pageIndex = 1;
seqPage.pageIndex = 2;
mixerPage.pageIndex = 3;
var pageCount = 4;

// cycle through modes in backward order
function previousMode() {
   activePageIndex = activePage.pageIndex-1;
   if (activePageIndex<0) {
      activePageIndex = pageCount-1;
   }

   activePage =  pageModes[activePageIndex];
   println(activePage.title);

   setActivePage(activePage);
   showPopupNotification(activePage.notify);
   activePage.updateOutputState();
  //  flushLEDs();
}


// cycle through modes in forward order
function nextMode()  {
 activePageIndex = activePage.pageIndex+1;
 if (activePageIndex >= pageCount) {
   activePageIndex = 0;
}

activePage =  pageModes[activePageIndex];
println(activePage.title);

setActivePage(activePage);
showPopupNotification(activePage.notify);
activePage.updateOutputState();
//  flushLEDs();
}


// activePage is the page displayed on the Launchpad, the function changes the page and displays popups
var activePage = null;

var transport = null;
var offset = null;
var quant = null;

function sendMidiOut(status,data1,data2) {
   if (data1==undefined) {
      println("data1 undefined");
      return;
   }
   if (data2==undefined) {
      println("data2 undefined");
   }
   println("sendMidi "+status+" "+data1+" "+data2);
   host.getMidiOutPort(0).sendMidi(status,data1,data2);
}

// set one of the primary modes active.
// note that many of the top row buttons are always controlled
// in the main script (this file).
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

      // if (activePage === seqPage)
      // {
      //    activeNoteMap = pianoNoteMap; 
      //    updateNoteTranlationTable();  
      // }
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

var timerState = 0;

var TEMPMODE = -1;

var IS_GRID_PRESSED = false;
//var IS_EDIT_PRESSED = false;
var IS_KEYS_PRESSED = false;
//var IS_RECORD_PRESSED = false;
var IS_SHIFT_PRESSED = false; // mapped to mixer key (top row of round buttons, rightmost/8th key)

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

var hasContent = initArray(0, 512);
var isPlaying = initArray(0, 512);
var isRecording = initArray(0, 512); // recording states.
var isQueued = initArray(0, 512);
var isStopQueued = initArray(0, 512);
var noteInput = null;

var IS_META_PRESSED = false; // TOP BUTTON SESSION button down? META function (META and SHIFT are both combination keys)
var IS_MODE_PRESSED  = false; // TOP BUTTON user2 pressed down.  A command/mode combination key.

var OBSERVER_MULT=64;

function getPlaying(row,column) {
      if ( (column>=OBSERVER_MULT) || (column<0) ) {
         return 0;
      }
      else 
         return isPlaying[column + OBSERVER_MULT*row];
}

// Observer functions to store receive information into the above arrays
function getTrackObserverFunc(track, varToStore)
{
   return function(value)
   {
      varToStore[track] = value;
   }
}

function getGridObserverFunc(track, varToStore)
{
   return function(scene, value)
   {
      varToStore[scene*OBSERVER_MULT + track] = value;
   }
}
function getGridObserverFunc2(track, varToStore)
{
   return function(scene, value)
   {
      if (trace>0){
      println("scene:"+scene+" track:"+track+" play:"+value);
      }
      varToStore[scene*OBSERVER_MULT + track] = value;
   }
}

var noteOn = initArray(false, 128);
WRITEOVR = false;

var sceneBank = null;

var trackEquality = [];

function getMasterVol() {
   return masterTrack.volume().value().get();
}
function setMasterVol(v) {
      if (v<0) {
         v = 0;
      }
      if(v >1.0) {
         v= 1.0;
      }
   println("setMasterVol "+v);

   masterTrack.volume().value().set(v);
}
   
function createSpecialTrack(pluginName) {
   application.createInstrumentTrack(0);
   
   host.scheduleTask( function() {
       trackBank.scrollToChannel(0);
       c = RGB_COLORS[Math.floor(Math.random()*RGB_COLORS.length)]
       trackBank.getChannel(0).color().set(c[0], c[1], c[2])
       trackBank.getChannel(0).browseToInsertAtStartOfChain();
       application.arrowKeyDown();
       host.scheduleTask( function() {
           for (var i=0; i<cursorResultBank.getSize(); i++) {
               item = cursorResultBank.getItem(i)
               item.isSelected().set(true);
               name = item.name().getValue();
               println( "Sel " + i + " -> " +item.name().getValue());
               if (name == pluginName) break;
           }
           browser.commit();
           t = trackBank.getChannel(0);
           t.selectInMixer(); 

       }, 300); 
   }, 100);

}

selectedName = [""]

function getSelectedNameObserver() {
   return function( name ) {
       println( "selected name: "+name );
       selectedName[0] = name
   }
}

// The init function gets called when initializing by Bitwig
function init()
{
   // setup MIDI in
   host.getMidiInPort(0).setMidiCallback(onMidi);

   sceneBank = host.createSceneBank(NUM_SCENES);
   


   noteInput = host.getMidiInPort(0).createNoteInput("Launchpad", "80????", "90????");
   noteInput.setShouldConsumeEvents(false);

   // Create a transport and application control section
   transport = host.createTransport();
   transport.isPlaying().markInterested();
   application = host.createApplication();
   transport.addIsPlayingObserver (function(pPlaying) {
      playing = pPlaying;
     // println("playing "+playing);
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

      trackBank.getChannel(t).isActivated().markInterested();

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


      clipLauncher.addIsPlayingObserver(getGridObserverFunc2(t, isPlaying));
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
   cursorDevice = cursorTrack.createCursorDevice(); //primaryDevice
   cursorDevice.exists().markInterested(); 
   cursorDevice.getChannel().getSolo().markInterested(); 
   cursorDevice.getChannel().getMute().markInterested(); 
   remoteControls = cursorDevice.createCursorRemoteControlsPage(8);

   browser  = host.createPopupBrowser();
   resultColumn = browser.resultsColumn();
   cursorResult = resultColumn.createCursorItem();
   cursorResult.addValueObserver(100, "", getSelectedNameObserver() );
   cursorResultBank = resultColumn.createItemBank(1000);

   
   for (var t = 0;t<NUM_TRACKS;t++) {
      var track = trackBank.getChannel(t);
      trackEquality[t] = cursorTrack.createEqualsValue(track);
   
   }
   cursorDeviceBrowser = cursorDevice.createDeviceBrowser(4,4);//columns,results


  

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

   masterTrack.volume().value().markInterested();
   
   


   // Picks up the controllable knobs, buttons which have been set via "Learn Controller Assignment".
   // There are 24 set here because there are 3 pages of user controls with 8 assignable controls on each
   userControls = host.createUserControls(24);

   for(var u=0; u<24; u++)
   {
      var control = userControls.getControl(u);

      control.addValueObserver(8, getTrackObserverFunc(u, userValue));
      control.setLabel("U" + (u+1));
   }


   cursorClip = host.createCursorClip(SEQ_BUFFER_STEPS, 128);

   cursorClip.addStepDataObserver(seqPage.onStepExists);
   cursorClip.addPlayingStepObserver(seqPage.onStepPlay);
   cursorClip.scrollToKey(0);
   
   cursorClipGrid = host.createCursorClip(SEQ_BUFFER_STEPS, 128);
   cursorClipGrid.addPlayingStepObserver(gridPage.onStepPlay); 

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
  timerState = timerState + 1;
  if (timerState > 3 ) {
     timerState = 0;
  }
  host.scheduleTask(polledFunction,  activePage.pollingRate);

  if (MUSICAL_STOP_STATE>0) { 
       println("Musical stop... ");
       MUSICAL_STOP_STATE = MUSICAL_STOP_STATE+1; 
       vol =  MasterTrackVolume - ( 0.05*MUSICAL_STOP_STATE);
        if (vol <0 ) { 
            vol = 0; 
         }
       setMasterVol(vol);
        
  }

  activePage.updateOutputState();
  
  activePage.polledFunction();


}

function clearMusicalStopState() {
   println("clearMusicalStopState");
   MUSICAL_STOP_STATE = 0;
   setMasterVol(MasterTrackVolume);
   masterTrack.mute().set(true);
}



// Function called on exit of the script
function exit()
{
   resetDevice();
}

// Reset all lights by sending MIDI and sets all values in the pendingLEDs array to 0
function resetDevice()
{  
  //if (trace>0) {
   println("resetDevice");
  //} 
   sendMidi(0xB0, 0, 0);

   for(var i=0; i<LED_COUNT; i++)
   {
      activeLEDs[i] = -1;
      pendingLEDs[i] = 0;
   }

   for(var i=0; i<64; i++)
   {
      isPlaying[i] = 0;
   }
  // flushLEDs();
}

// I'm not sure what these functions do
// enableAutoFlashing and setGridMappingMode are called during initialization.
// setDutyCycle is called by the animateLogo function,
// They are likely something to do with the bitwig logo.


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


function RewindAndStopAllClips() {
   if (IS_SHIFT_PRESSED) {
      println("Rewind.");
      transport.rewind();
      println("Stop all clips.");
        for (track=0; track<NUM_TRACKS;track++) {
         var t = trackBank.getTrack(track);
         var l = t.getClipLauncherSlots();
         l.stop();
      }
      
   }

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
            // TOP BUTTON CURSOR UP: Repurposed to play and stop
            //  IS_META_PRESSED: scroll scene bank up
         case TopButton.CURSOR_UP:
               activePage.onScrollUp(isPressed);
               break;

          
            break;

         // TOP BUTTON CURSOR DOWN (MODE)
         // IS_META_PRESSED: scroll scene bank down
         case TopButton.CURSOR_DOWN:
            activePage.onScrollDown(isPressed);
            break;
         
  
         case TopButton.CURSOR_LEFT:
            if (IS_SHIFT_PRESSED) {
               activePage.CursorLeft(isPressed);
            }
            else 
            if (isPressed) {
               IS_META_PRESSED ? previousMode() : cursorTrack.selectPrevious();
            }
            break;

         case TopButton.CURSOR_RIGHT:
         
            if (IS_SHIFT_PRESSED) {
               activePage.CursorRight(isPressed);
            }
            else 
            if (isPressed) {
               IS_META_PRESSED ? nextMode() : cursorTrack.selectNext();
            }
            break;
	
         case TopButton.SESSION:
            
            IS_META_PRESSED  = isPressed;
            if (IS_META_PRESSED)
            { 
               println("[META] Pressed");
            } 
            else
            { 
               println("[META] Release");
            }

            break;

         case TopButton.USER1:
           
                println("[USER1] isPressed="+isPressed);
         
                activePage.onUser1(isPressed);
                if(IS_KEYS_PRESSED)
                {
                    IS_KEYS_PRESSED=false;
                }

            break;

         case TopButton.USER2:
            println("[USER2] isPressed="+isPressed);
            activePage.onUser2(isPressed);

            break;

         case TopButton.MIXER:
            println("[MIXER] isPressed="+isPressed);
            activePage.onShift(isPressed);
                if (isPressed)
                { if (trace>0) {
                   println("shift ON");
                  }

                    IS_SHIFT_PRESSED = true;
                }
                else
                {
                    if(IS_SHIFT_PRESSED)
                    {  if (trace>0) {
                     println("shift OFF");
                    }
  
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
         
         
      if (column < 8)
      {

         if (trace>0) {
            println(  activePage.title + ":   onGridButton row = " + row + "col = " + column)
            }
           
         activePage.onGridButton(row, column, data2 > 0);
      }
      else
      {
         
         if (trace>0) {
            println(" midi SCENE button #" + row )
            }
         
         activePage.onSceneButton(row, data2 > 0);
      }
   }
}

// Clears all the lights
function clear()
{
   for(var i=0; i<LED_COUNT; i++)
   {
      pendingLEDs[i] = Colour.OFF;
   }
}

function flush()
{
  //  activePage.updateOutputState(); // // set LED state vars


   flushLEDs();
}



// Sends the Top LED lights to the pendingLEDs array. LED top have a value of 72 to 80
function setTopLED(index, colour)
{
   if (colour==undefined)
   {
      println("setTopLED invalid colour");
      colour = Colour.OFF;
   }

   pendingLEDs[LED.TOP + index] = colour;
}

// Sends the right LED lights to the pendingLEDs array. LED scene have a value of 64 to 72
function setSceneLEDColor(index, colour)
{
   if (colour==undefined)
   {
      println("setSceneLEDColor invalid colour");
      return;
   }
   
   pendingLEDs[LED.SCENE + index] = colour;
}


// Sends the main pads to the pendingLEDs array. LED scene have a value of 0 to 63
function setCellLED(column, row, colour)
{
   var key = row * 8 + column; // not OBSERVER_MULT
   if (trace>=4) {
   println("setCellLED " + column + " " + row );
   }

   if (colour>=0) {
      previousLEDs[key] = pendingLEDs[key];
      pendingLEDs[key] = colour;
   }
   else {
      pendingLEDs[key] = previousLEDs[key];
      
   }
   
   if (trace >= 5) {
      println( " pendingLEDs @"+column+", "+row+" = "+colour);
   }
}

function setCellLED2(track, colour)
{
   var key = track;

   pendingLEDs[key] = colour;
   if (trace>=2) {
      println("setCellLED2 track "+track);
   }
}
/** Cache for LEDs needing to be updated, which is used so we can determine if we want to send the LEDs using the
 * optimized approach or not, and to send only the LEDs that has changed.
 */
 
 // arrays of 80 buttons, the main 64 pads and the 8 at the top and 8 at side. Pending is used for lights to be sent, active contains the lights already on

var pendingLEDs = new Array(LED_COUNT);
var activeLEDs = new Array(LED_COUNT);
var previousLEDs = new Array(LED_COUNT);

// This function compares the LEDs in pending to those in active and if there is a difference it will send them via MIDI message
// If there is more than 30 lights changed it sends the MIDI in a single message ("optimized mode") rather than individually
function flushLEDs()
{

   if (trace>3) {
      println("flushLEDs called");
   };

	// changedCount contains number of lights changed
   var changedCount = 0;

   // count the number of LEDs that are going to be changed by comparing pendingLEDs to activeLEDs array
   for(var i=0; i<80; i++)
   {
      if (pendingLEDs[i] != activeLEDs[i]) changedCount++;
   }

   // exit function if there are none to be changed
   if (changedCount == 0) return;

   
   if (trace>3) {
      println("flushLEDs active. changedCount "+changedCount);
   };
   
  
   
      for(var i = 0; i<LED_COUNT; i++)
      {
         if (pendingLEDs[i] != activeLEDs[i])
         {
            activeLEDs[i] = pendingLEDs[i];

            var colour = activeLEDs[i];

            if (colour==undefined)
            {
               println("undefined LED color.");
               colour = Colour.OFF;
            };

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
