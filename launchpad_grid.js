
/*
*  GRID PAGE
*
*  Originally this was an 8 scene x 8 track clip launcher grid.
*
*  Warren's version, top half is a clip launcher grid for four tracks.
*  Bottom half is a keyboard note or midi CC transmitter.
*  The Down arrow changes which bank of keys or midi CC notes are sent.
*  The color of the bottom half of the page was red when Warren took over this copy of this script.
*  Eventually Warren wants to make the bottom half very dynamically colored.
*
* 
* */






gridPage = new Page();

gridPage.mixerAlignedGrid = true;
gridPage.canScrollTracksUp = false;
gridPage.canScrollTracksDown = false;
gridPage.canScrollScenesUp = false;
gridPage.canScrollScenesDown = false;
gridPage.title = "Clip Launcher";
gridPage.currentVelocity = 127;
gridPage.split = true
gridPage.grid_shift=0; //0,4,8,12




ARMED=false;


gridPage.CursorLeft = function(isPressed)
{
	if (isPressed) {
		gridPage.grid_shift = gridPage.grid_shift -4;
		if (gridPage.grid_shift<0) {
			gridPage.grid_shift = 12;
		}
		showPopupNotification('Grid '+gridPage.grid_shift);
	}
}


gridPage.CursorRight = function(isPressed)
{
	if (isPressed) {
		gridPage.grid_shift = gridPage.grid_shift +4;
		if (gridPage.grid_shift>12) {
			gridPage.grid_shift =0;
		}
		showPopupNotification('Grid '+gridPage.grid_shift);
	}
	
}

gridPage.ChangeVelocity = function()
{
	gridPage.currentVelocity = gridPage.currentVelocity + 40;
	if  (gridPage.currentVelocity>=128 ) {
		gridPage.currentVelocity = 40;
	}
	if (gridPage.currentVelocity>=119) {
		gridPage.currentVelocity = 127;
	}
	showPopupNotification("Velocity "+gridPage.currentVelocity);
}
// TVbene updates the mode buttons on the top
gridPage.updateOutputState = function()
{
   clear();

   this.updateGrid();
   var cls1 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.RED_FLASHING,Colour.YELLOW_FULL]); 
   var cls2 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.YELLOW_FLASHING,Colour.YELLOW_FULL]);  
   // Set the top LEDs while in Clip Launcher
   setTopLED(5, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 9 ? (ARMED?cls1[0]:cls1[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 9 is for the delete clip mode
   setTopLED(6, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 10 ? (ARMED?cls2[0]:cls2[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 10 is for the select clip mode
   setTopLED(7, IS_SHIFT_PRESSED ? Colour.AMBER_FULL : Colour.GREEN_LOW);
};

gridPage.onSession = function(isPressed)
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

gridPage.SetQuantNext = function()
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
	
	gridPage.updateGrid();
	flushLEDs();
	

}

// SIDE BUTTONS:
//   TVbene: side buttons select post record delay and launch quantization
gridPage.onSceneButton = function(row, isPressed)
{
   if (isPressed)
   {
	   if (row<=3) {
		sceneBank.getScene(row).launch();
	   }
	   else
     switch(row)
      {   
         case MixerButton.TRK_ON: 
			gridPage.ChangeVelocity();
            break;

         case MixerButton.SOLO:
			//quant.set("1/2");
            break;

         case MixerButton.ARM:
			//quant.set("1/4");
			gridPage.SetQuantNext();
			//host.scheduleTask(gridPage.SetQuantNext,  100);
			break;

      }
   }
};




//TVbene: Topbuttons 6, 7 now working without shift

gridPage.onUser1 = function(isPressed)
{
   println("grid user1 : press "+isPressed);
   
}

gridPage.onUser2 = function(isPressed)
{
	println("user2 : arm function 10");

    if (isPressed)
    {
		ARMED = 10;
    }
}

// This detects when the Mixer button is pressed and changes the orientation identifier mixerAlignedGrid and displays the text popup
gridPage.onShift = function(isPressed)
{
   
    if(ARMED > 0)
    {
    ARMED = 0;
    return;
    }

}




REFROW=false;
ROWARM=false;

var BASE_NOTE = 36; // C2=36
var NOTE_PAGE_SIZE = 24;

gridPage.doGridNoteOrCCButton = function(row,column,pressed)
{
	var rowInvert = 3 - (row-4);
	var baseNoteNo = BASE_NOTE+(NOTE_PAGE_SIZE*view_shift);
	var channel = 0;
	
	if (rowInvert<0 ) {
		rowInvert = 0;
	}
	var noteIndex = baseNoteNo+ ((rowInvert)*8)+column;

	if (noteIndex<0) {
		noteIndex = 0;
	};
	
	if (noteIndex<=108)
	{
		//println("doGridNoteOrCCButton A");
	    if (noteIndex==108)  {
			noteIndex = 36;
		} else if (noteIndex==107)  {
			noteIndex = 0;
		};

		if (noteIndex>=0) {
			if (pressed) {
					
				if (trace>0) {
					println("gridPage: MIDI NOTE "+noteIndex+" for controls page "+view_shift);
				}
				
				noteInput.sendRawMidiEvent(NOTE_ON+channel, noteIndex, gridPage.currentVelocity );
			}
			else {	
				noteInput.sendRawMidiEvent(NOTE_OFF+channel, noteIndex, 0);
			};
			}
	}
	else
	{
	  // println("doGridNoteOrCCButton B");
	
		//noteIndex = 108;
		ccIndex = noteIndex-88;
		if (trace>0) {
		println("Midi CC "+ccIndex);
		}
		noteInput.sendRawMidiEvent(CC_MSG+channel, /*data1*/ccIndex, /*data2*/pressed ? 127 : 0 );
        noteIndex = -1;
	};


};


gridPage.onGridButton = function(row, column, pressed)
{
	// Warren adapted to split into a 4 track, 8 scene clip launcher with 4 rows of 8 midi cc and note buttons

	if ((row < 4)||(!gridPage.split)) 
	{
		var track = column;
		var scene =  row+gridPage.grid_shift;
	
	
			
		var t = trackBank.getTrack(track);
		var l = t.getClipLauncherSlots();
			

		if (pressed) {
				if(isPlaying[column+8*scene] > 0)
				{	
					if (!IS_SHIFT_PRESSED) {
						println("stop track "+(track+1) +" clip "+(scene+1));				
						l.stop();
					}

				}
				else
				{   println("launch track "+(track+1)+" clip "+(scene+1));
					l.launch(scene);
				}
		}

	}
	else if ((row >= 4)&&(gridPage.split)) 
	{
		gridPage.doGridNoteOrCCButton(row,column,pressed);
		

	}


};

// updates the grid and VUmeters
gridPage.updateGrid = function()
{

   for(var r=0; r<8; r++)
   {
      this.updateTrackValue(r); // one column of grid
   }

   this.updateSideButtons();
   
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
gridPage.updateSideButtons  = function()
{
  //println("updateSideButtons");
  	var val = null;
	var offsetFormatted = offset.getFormatted();
	var quantValue = quant.get();

			



	// last three scene LEDs are for various status flags
	if (IS_SHIFT_PRESSED ) {
		for(var j=4; j<8; j++)
			{
			
			setSceneLEDColor(j, Colour.AMBER_FULL);
			}
	}
	else {
		for(var j=0; j<4; j++)
		{
			scenePlaying = playing && getClipsPlaying(j);
		   if ((scenePlaying) && (timerState==0)) {
			setSceneLEDColor(j,  Colour.OFF );
		   } else {
			setSceneLEDColor(j, scenePlaying ? Colour.GREEN_FULL : Colour.GREEN_LOW );
		   }
		 
		}

		setSceneLEDColor(4, Colour.YELLOW_LOW);
		setSceneLEDColor(5, Colour.YELLOW_FULL);
		setSceneLEDColor(6, Colour.RED_LOW);
		setSceneLEDColor(6, Colour.GREEN_LOW);
		
	
	}
	

	
   
};



gridPage.updateTrackValue = function(track)
{
	active = trackBank.getChannel(track).isActivated().get();
	selected = active && trackEquality[track].get();
	//println("selected "+selected);
	
	tplay = transport.isPlaying().get();

	//println("active "+active);

	//if (activePage != gridPage) return;
//	println("updateTrackValue "+track);
	// this section draws the pads for the main clip launcher
	for(var scene=0; scene<8; scene++)
	{
		var i = track + scene*8;
//TVbene: Colour of armed tracks/clips
		var col = Colour.OFF;
	
		 a = Colour.RED_LOW;
		 b = Colour.RED_FULL;
		 if (view_shift==1)  {
			 a = Colour.GREEN_LOW;
			 b = Colour.GREEN_FULL;
		 } else  if (view_shift==2)  {
			a = Colour.AMBER_FULL;
			b = Colour.YELLOW_LOW;
		} else  if (view_shift==3)  {
			a = Colour.OFF;
			b = Colour.YELLOW_LOW;
		}

		if (scene==4){
           col = (track>=4) ? a : b;
		}
		else if (scene==5) {
			col = (track>=4) ? b : a;
		} 
		else if (scene==6) {
			col = (track>=4) ? a : b;
		} 
		else if (scene==7) {
			col = (track>=4) ? b : a;
			// quantization shown as a green thing.
			q = quant.get();
			if  ((track==0)&&(q=="1/4")) {
			  col = Colour.GREEN_LOW;	
			}	
			else if  ((track==1)&&(q=="1/2")) {
				col = Colour.GREEN_LOW;	
			}	
			else if  ((track==2)&&(q=="1")) {
				col = Colour.GREEN_LOW;	
			}	
			else if  ((track==3)&&(q=="2")) {
				col = Colour.GREEN_LOW;	
			}	
			else if  ((track==4)&&(q=="4")) {
				col = Colour.GREEN_LOW;	
			}
			
			  
		} 
			 
		var fullval = mute[track] ? 1 : 3;
		
		if (scene<4)
		{
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
				 col = Colour.YELLOW_FULL;
			 } 
			 else if ( active ) {
			 col = Colour.YELLOW_LOW;
			 } 
			 else {
				col = Colour.OFF; // disabled
			 }
		 }
		}


		 setCellLED(track, scene, col);

	}
	
};
