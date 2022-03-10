// FrankenLaunchpad Split MK1 WP : 2022-03-09
//
// Novation Launchpad script variant by Warren.Postma@gmail.com
// Heavily modified script for live guitar looping.
// Intended to be used with a specially configured template
// bitwig project.
//
// API Level 10 
//
// Script of Theseus: This script has been through uncountable
// hands, but is mostly based on some early bitwig 1.x era stuff
// shipped by Bitwig.
//
// Use the default scripts or the DrivenByMoss scripts if you want
// more features.  Many features from the standard Bitwig script
// are actually removed.
//
// Main GRID mode is a split of clip view plus bottom half of  the
// grid area is for playing midi notes, or midi CC notes, or for
// various "looper pedal" type functions that might be useful for
// live looping with keys or guitars or vocals. 
//
// The top four rows of the grid start out accessing scene 1-4.
// The MIXER button plus page left and page right shift this from 
// 2-6 and then from 4-8.  By trying to go too far left when at scene 1-4
// you can quickly get to scene 4-8 without going through the other
// middle state.
//
//
// TODO:
//
// *GUITAR LOOPER LOGIC:
//  - Ability to set up a project that will keep the live guitar
//    always playing through a non-looped audio track that is
//    monitoring the guitar input, except when we want it ducked.
//  - Ability to seamlessly multi track loop 1 to 8 different tracks
//    all mapped to one audio input and manage which tracks are 
//    monitoring, so only ONE is ever monitoring.
//  - Clip delete and re-record. 
//  - Undo/Redo actions from launchpad buttons.
//   
// MORE MUSICAL METRONOME:
//  - Ability to trigger a track playback that is off the visible
//    launchpad grid that exists only as a tempo reference, but is
//    more musical than the built in metronome. It could contain
//    a shaker sound, or an acoustic drum "tchak".
//
// *MUSICAL STOP:
//   When jamming and you hit play/stop it's very musically unsatisfying
//   just to stop suddenly.
//   - Programmable fade out time (shown as a launchpad button light)
//   - 1 second fade out, 4 second fade out, 8 second fade out.
//   
// *LAYERED INSTRUMENTS CROSS FADE:
//    Using a layer container to cross fade between one or both
//    instruments inside the instrument layer.
//    (Same clip keeps playing but the levels 
//      in the instrument change)
//  
// *TRACK TO TRACK CROSS FADE:
//    Cross fade where you stop one track after the other one has
//    started and faded in.  Fade out controls the master volume
//    and must restore it to its original value when track play
//    has stopped.
//
// If this script is being maintained newer versions will be at
// https://github.com/wpostma/LaunchpadScriptV3 

// you can't change things currently limited to 8 without 
// rewriting a large amount of this script due to its
// assumption that there are 8 scenes and that the launchpad 
// grid is always 8 by 8.

var trace=0; //  type trace=1 in the controller script console to enable most debug messages
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
if(host.platformIsLinux())
{
	for(var i=1; i<16; i++)
	{
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad S " + + i.toString() + " MIDI 1"], ["Launchpad S " + + i.toString() + " MIDI 1"]);
	   host.addDeviceNameBasedDiscoveryPair(["Launchpad Mini " + + i.toString() + " MIDI 1"], ["Launchpad Mini " + + i.toString() + " MIDI 1"]);
	}
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

var hasContent = initArray(0, 64);
var isPlaying = initArray(0, 64);
var isRecording = initArray(0, 64); // recording states.
var isQueued = initArray(0, 64);
var isStopQueued = initArray(0, 64);
var noteInput = null;

var isSetPressed = false;

function getPlaying(row,column) {
   return isPlaying[column + 8*row];
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
      varToStore[scene*8 + track] = value;
   }
}
function getGridObserverFunc2(track, varToStore)
{
   return function(scene, value)
   {
      if (trace>0){
      println("scene:"+scene+" track:"+track+" play:"+value);
      }
      varToStore[scene*8 + track] = value;
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
   
   for (var t = 0;t<NUM_TRACKS;t++) {
      var track = trackBank.getChannel(t);
      trackEquality[t] = cursorTrack.createEqualsValue(track);
   
   }
  

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
   
   


   // Picks up the controllable knobs, buttons which have been set via "Learn Controller Assignment". There are 24 set here because there are 3 pages of user controls with 8 assignable controls on each
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
  host.scheduleTask(polledFunction,  200);

  if (MUSICAL_STOP_STATE>0) { 
       println("Musical stop... ");
       MUSICAL_STOP_STATE = MUSICAL_STOP_STATE+1; 
       vol =  MasterTrackVolume - ( 0.05*MUSICAL_STOP_STATE);
        if (vol <0 ) { 
            vol = 0; 
         }
       setMasterVol(vol);
        
  }

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
{  if (trace>0) {
   println("resetDevice");
  } 
   sendMidi(0xB0, 0, 0);

   for(var i=0; i<80; i++)
   {
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

// cycle through modes in backward order
function previousMode() {
   //println("previousMOde");
   if (activePage == gridPage) {
      setActivePage(keysPage);
      showPopupNotification("Keys Mode");
   } else if (activePage==keysPage) {
      setActivePage(seqPage);
      showPopupNotification("Sequencer Mode");

   }
   else {
      setActivePage(gridPage);
      showPopupNotification("Grid/Keys Split Mode");
   } 
   activePage.updateOutputState();


   //  flushLEDs();

}

// cycle through modes in forward order
function nextMode() {
   //println("nextMode");
   if (activePage==seqPage) {
      setActivePage(keysPage);
      showPopupNotification("Keys Mode");
   } else if (activePage == gridPage ) {
      setActivePage(seqPage);
      showPopupNotification("Sequencer Mode");

   }
   else {
      setActivePage(gridPage);
      showPopupNotification("Grid/Keys Split Mode");
   } 
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
         case TopButton.CURSOR_UP:
            if (isPressed)
            {  
               if (IS_SHIFT_PRESSED && playing) {
                  println("shift+play: musical stop");
                  MUSICAL_STOP_STATE = 1;
                  MasterTrackVolume = getMasterVol();

                  return;
               }
               println("play="+playing);
               if (playing != 0) 
               {	
                  transport.stop();
                  showPopupNotification("Stop");
                 
               }
               else
               {  
                  
                  if (IS_SHIFT_PRESSED) {
                     println("Rewind.");
                     transport.rewind();
                  };
                  showPopupNotification("Play");
                  transport.play();
                  masterTrack.mute().set(false);

               }
            }
            else
            {  if (MUSICAL_STOP_STATE>0) {
                  transport.stop();
                  RewindAndStopAllClips();
                  host.scheduleTask(clearMusicalStopState,  2000);
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
              showPopupNotification("sub mode "+view_shift);
            }
            else
            {
               //view_shift=0;
            }
            break;

         case TopButton.CURSOR_LEFT:
            if (IS_SHIFT_PRESSED) {
               activePage.CursorLeft(isPressed);
            }
            else 
            if (isPressed) {
               isSetPressed ? previousMode() : cursorTrack.selectPrevious();
            }
            break;

         case TopButton.CURSOR_RIGHT:
         
            if (IS_SHIFT_PRESSED) {
               activePage.CursorRight(isPressed);
            }
            else 
            if (isPressed) {
               isSetPressed ? nextMode() : cursorTrack.selectNext();
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
            println(" midi GRID note  row = " + row + "col = " + column)
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
   for(var i=0; i<80; i++)
   {
      pendingLEDs[i] = Colour.OFF;
   }
}

function flush()
{
    activePage.updateOutputState(); // // set LED state vars


   flushLEDs();
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
   //println( " pendingLEDs @"+column+", "+row+" = "+colour);

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

   if (trace>1) {
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

   
   if (trace>1) {
      println("flushLEDs active. changedCount "+changedCount);
   };
   
   // if there is a lot of LEDs, use an optimized mode
   // (which looks to me like it sends all in one MIDI message
   //TVbene changed to prevent optimised mode
   if (changedCount > 100)
   {
      if (trace>1) {
         println("flushLEDs optimized. "+changedCount);
      };
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
