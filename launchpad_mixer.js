
/*
*  MIXER PAGE
*
*  This is stolen from the mixer page idea novation coded for FL Studio's launchpad controller mode.
* 
* */






mixerPage = new Page();

mixerPage.mixerAlignedGrid = true;
mixerPage.canScrollTracksUp = false;
mixerPage.canScrollTracksDown = false;
mixerPage.canScrollScenesUp = false;
mixerPage.canScrollScenesDown = false;
mixerPage.title = "Faders Mode"; 
mixerPage.notify = mixerPage.title+"  (user1 toggle mixer/device knobs)";
mixerPage.currentVelocity = 127;
mixerPage.split = false;
mixerPage.mixer_shift=0; //0,4,8,12
mixerPage.canCycle = false; // pages : cycle when reach end? 
mixerPage.maxrow = 8;
mixerPage.maxcol = 8;
mixerPage.rowDown= -1;
mixerPage.columnDown= -1;
mixerPage.mixerCCValues = [];
mixerPage.mixerButtonLevel = [];

for(var i=1; i<20; i++)
{
    mixerPage.mixerCCValues[i] = 0; //0-127
    mixerPage.mixerButtonLevel[i] = 0; //0-7
}






mixerPage.nextPreset = function()
{  println("next preset");
	//cursorDevice.switchToNextPreset(); // use browser instead
	browser.selectNextFile();
};

mixerPage.previousPreset = function()
{   println("previous preset");
	//cursorDevice.switchToPreviousPreset(); // use browser instead
	browser.selectPreviousFile();
};
 
mixerPage.nextParameterPage = function()
{  println("next parameter page");
   remoteControls.selectNextPage(mixerPage.canCycle); // replaces CursorTrack.nextParameterPage() which is DEPRECATED but not documented as such.
};

mixerPage.previousParameterPage= function()
{   println("previous param page");
	remoteControls.selectPreviousPage(mixerPage.canCycle); // replaces CursorTrack.previousParameterPage() which is DEPRECATED but not documented as such.
};
 


mixerPage.previousDevice = function()
{
	cursorDevice.selectPrevious();
	
};

mixerPage.nextDevice = function()
{
	cursorDevice.selectNext();
};

mixerPage.CursorLeft = function(isPressed)
{
	if (isPressed) {
		mixerPage.mixer_shift = mixerPage.mixer_shift - 2;
		if (mixerPage.mixer_shift<0) {
			mixerPage.mixer_shift = 4;
		}
		
		showPopupNotification('Grid +'+mixerPage.mixer_shift);;
	}
}


mixerPage.CursorRight = function(isPressed)
{
	if (isPressed) {
		mixerPage.mixer_shift = mixerPage.mixer_shift +2;
		if (mixerPage.mixer_shift>4) {
			mixerPage.mixer_shift =0;
		}
		showPopupNotification('Grid +'+mixerPage.mixer_shift);
	}
	
}

mixerPage.ChangeVelocity = function()
{
	mixerPage.currentVelocity = mixerPage.currentVelocity + 40;
	if  (mixerPage.currentVelocity>=128 ) {
		mixerPage.currentVelocity = 40;
	}
	if (mixerPage.currentVelocity>=119) {
		mixerPage.currentVelocity = 127;
	}
	showPopupNotification("Velocity "+mixerPage.currentVelocity);
}


mixerPage.mixerLEDSetup= function(colourA,colourB) 
{
   
     for (var c=0;c<8;c++)
     {  var colour = (c % 2 ? colourA:colourB );
        for (var r=0;r<8;r++) 
        {
        
            setCellLED(c,r, colour );
        }
    }
}


mixerPage.updateMixer = function () 
{
     // draw bars
  
    mixerPage.mixerLEDSetup( Colour.YELLOW_LOW,Colour.GREEN_LOW );

    for (c=0;c<8;c++) {
        var mixerIndex = c+mixerPage.mixer_shift;
        var hotColour = c%2 ? Colour.YELLOW_FULL: Colour.GREEN_FULL;
        setCellLED(c, /*row=*/mixerPage.mixerButtonLevel[mixerIndex], hotColour );
    }

}

mixerPage.updateOutputState = function()
{
   clear();

   this.updateMixer();


   setTopLED(0,  clipActive ? Colour.GREEN_FULL : Colour.OFF );

   switch(view_shift) {
	   case 0:
		   	c = Colour.GREEN_FULL; break;
		case 1:
			c = Colour.GREEN_LOW; break;
		case 2:
			c = Colour.YELLOW_LOW; break;
		default:
			c = Colour.RED_LOW;
   }
	setTopLED(1,  c );
   
   setTopLED(5, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 9 ? (ARMED?cls1[0]:cls1[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 9 is for the delete clip mode
   setTopLED(6, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 10 ? (ARMED?cls2[0]:cls2[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 10 is for the select clip mode
   setTopLED(7, IS_SHIFT_PRESSED ? Colour.AMBER_FULL : Colour.GREEN_LOW);
};

mixerPage.onSession = function(isPressed)
{   
    
    if(TEMPMODE == TempMode.OFF && !IS_GRID_PRESSED)
    {
        if(IS_SHIFT_PRESSED)
            {
            application.undo();
            host.showPopupNotification("Undo");
            return;
            }
        else
        {
        this.mixerAlignedGrid = !this.mixerAlignedGrid;
          
	          if(this.mixerAlignedGrid)
              {
              application.setPerspective('MIX');
		      }
	          if(this.mixerAlignedGrid == false)
              {
	          application.setPerspective('ARRANGE');
		      }
          
              host.showPopupNotification("Orientation: " + (this.mixerAlignedGrid ? "Mix" : "Arranger"));
        }

    }
}

function doqset(q)
{
	showPopupNotification("Loop Quantize: "+q);
	quant.set(q);
}

mixerPage.SetQuantNext = function()
{
	q = quant.get();
	//println("quant="+q);

	if (q == "1/4" ) {
		doqset("1/2");
	}
	else if (q== "1/2") {
		doqset("1");
	}
	else if (q== "1") {
		doqset("2");
	}
	else if (q== "2") {
		doqset("4");
	}
	else if (q== "4") {
		doqset("1/4");
	}
	else {
		doqset("1/4");
	}
	
	mixerPage.updateMixer();
	flushLEDs();
	

}

mixerPage.cursorDeviceReplace = function()
{
	if (cursorDevice.exists().get()) {
		cursorDevice.browseToReplaceDevice();
	} else {
		cursorDevice.browseToInsertAtStartOfChain();
	}
}

// side buttons press. (scene,  vol,pan,etc)
mixerPage.onSceneButton = function(row, isPressed)
{
   
};






mixerPage.onUser1 = function(isPressed)
{
	
   
}

mixerPage.onUser2 = function(isPressed)
{
	
}

mixerPage.onShift = function(isPressed)
{
   
   

}





var BASE_NOTE = 36; // C2=36
var NOTE_PAGE_SIZE = 24;
var MIXER_VALUES= [0,12,25,35,45,65,105,127]; // as midi CC

mixerPage.doCCButton = function(row,column,pressed)
{
	var rowInvert = 7-row; 
	var mixerIndex =  column + mixerPage.mixer_shift;
    
	if (pressed) {
		mixerPage.rowDown=row;
		mixerPage.columnDown=column;
        
	} else {
		mixerPage.rowDown=-1;
		mixerPage.columnDown=-1;

	}
    mixerPage.lastMixer = mixerIndex;
    mixvalue = MIXER_VALUES[rowInvert];
    
    mixerPage.lastMixerValue = row;

    mixerPage.mixerCCValues[mixerIndex] = mixvalue;
    mixerPage.mixerButtonLevel[mixerIndex] = row; // so we know which one to light up.
    
    
    
    println("mixer "+mixerIndex+" value "+mixvalue );

	if (mixerPage.ccMode)
	{
	    println("MIDI CC SEND FOR MIXER");
        
		//noteIndex = 108;
		ccIndex = noteIndex-88;
		if (trace>0) {
		println("Midi CC "+ccIndex);
		}
		noteInput.sendRawMidiEvent(CC_MSG+channel, /*data1*/ccIndex, /*data2*/pressed ? 127 : 0 );
        noteIndex = -1;
	};


};

// send midi ccs or control device knobs.
mixerPage.onGridButton = function(row, column, pressed)
{
	
    mixerPage.doCCButton(row,column,pressed);




};



// sets the colours for the VUmeters
// calls the mixColour function within the launchpad_constants.js script
function vuLevelColor(level)
{
   switch (level)
   {
      case 1:
         return mixColour(0, 1, false);

      case 2:
         return mixColour(0, 2, false);

      case 3:
         return mixColour(0, 3, false);

      case 4:
         return mixColour(2, 3, false);

      case 5:
         return mixColour(3, 3, false);

      case 6:
         return mixColour(3, 2, false);

      case 7:
         return mixColour(3, 0, false);
   }

   return Colour.OFF;
}


function getClipsPlaying(scene) {
	n = false;
	for (track = 0; track < NUM_TRACKS;track++) {	
		if (isPlaying[track + (scene*8)]) {
			n = true;
			break;
		}
	}
	return n;
}

// updates side buttons but no longer actually updates the vu meter.
// first four buttons are play stop and last four are command buttons.
mixerPage.updateSideButtons  = function()
{
  //println("updateSideButtons");
  	var val = null;
	var offsetFormatted = offset.getFormatted();
	var quantValue = quant.get();

	var alt = Colour.GREEN_LOW;



	// last three scene LEDs are for various status flags
	if (IS_SHIFT_PRESSED ) {
		for(var j=0; j< mixerPage.maxrow; j++)
			{
			
			setSceneLEDColor(j, Colour.YELLOW_LOW);
			}
	
		if (mixerPage.split)
		for(var j=4; j<8; j++)
			{
			
			setSceneLEDColor(j, Colour.AMBER_FULL);
			}
	}
	else {
		for(var j=0; j<mixerPage.maxrow; j++)
		{
			scenePlaying = playing && ( j+mixerPage.mixer_shift == mixerPage.scene_active );
		   if ((scenePlaying) && (timerState==0)) {
			setSceneLEDColor(j,  Colour.OFF );
		   } 
		   else 
		   {
				
			     if (( mixerPage.mixer_shift==2)&&(j==1)) {
					 alt = Colour.YELLOW_LOW;
				 } else if (( mixerPage.mixer_shift==4)&&(j==3)) {
					alt = Colour.YELLOW_LOW;
				}
				else
					alt = Colour.GREEN_LOW;
			    setSceneLEDColor(j, scenePlaying ? Colour.GREEN_FULL : alt );
		   }
		 
		}

		if (!mixerPage.split) {
		 setSceneLEDColor(4, Colour.YELLOW_LOW);
		 setSceneLEDColor(5, Colour.YELLOW_FULL);
		 setSceneLEDColor(6, Colour.RED_LOW);
		 setSceneLEDColor(6, Colour.GREEN_LOW);
		}
		
	
	}
	

	
   
};



// track = column
mixerPage.updateTrackValue = function(track)
{
	track_offset = track;

	active = trackBank.getChannel(track_offset).isActivated().get();
	selected = active && trackEquality[track_offset].get();
	//println("selected "+selected);
	
	tplay = transport.isPlaying().get();

	//
	randcol=-1;
	if (Math.random()>0.9)
		randcol = 2+Math.floor(Math.random()*6);

	//println("active "+active);

	// scenes are ROWS in the launchpad in this script. 
	for(var scene=0; scene<mixerPage.maxrow; scene++)
	{
		var i = track_offset + ((scene+mixerPage.mixer_shift) *8);

		var col = Colour.ORANGE;
		var fullval = mute[track_offset] ? 1 : 3;
	
		 if (hasContent[i] > 0)
		 { 
			if ((isQueued[i] > 0)&&(tplay))
			{ // about to play
				if ( (timerState < 2 ) ||  !transport.isPlaying()  )  {
				col = Colour.GREEN_FULL;
			   } else if (timerState==1) {
				   col = Colour.YELLOW_FULL;
			   };	
			}
			else if ((isRecording[i] > 0)&&tplay)
			{
				 // what about about to record?
				if (timerState==0 ) {
			     col = Colour.RED_FULL;
				} else if (timerState==1) {
					col = Colour.RED_LOW ;
				};
			}
			else if ((isStopQueued[i] > 0)&&tplay)
			{ // about to stop
				if (timerState==0 ) {
					col = Colour.YELLOW_FULL;
				   } else if (timerState==1) {
					   col = Colour.RED_LOW ;
				   };	
			}
			else if (isPlaying[i] > 0)
			{
			
				if  ((timerState < 2 )||(!tplay))  {
					col = Colour.GREEN_FULL;
				   } else  {
					
											
					   col = Colour.GREEN_LOW; 
					
				   };	
			}
			else
			{
			   col = Colour.GREEN_LOW; 
			}
		 }
		 else
		 {
			 

			 // not selected track : yellow.
			 if (selected) {
				 col = Colour.YELLOW_LOW;
			 } 
			 else if ( active ) {
				 col = Colour.OFF;
				 if (tplay&&(randcol==track)) {
				 		col=Colour.ORANGE;
						 
				}

			 } 
			 else {
				col = Colour.RED_LOW; // disabled
			 }
			 //if (col =12) {
			 // println("track "+track+" scene "+scene+ " "+Math.random());
			 //}
		 }
		


		 setCellLED(track, scene, col);

	}
	
};
