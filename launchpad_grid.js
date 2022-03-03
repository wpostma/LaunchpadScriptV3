
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
* */



gridPage = new Page();

gridPage.mixerAlignedGrid = true;
gridPage.canScrollTracksUp = false;
gridPage.canScrollTracksDown = false;
gridPage.canScrollScenesUp = false;
gridPage.canScrollScenesDown = false;
gridPage.title = "Clip Launcher";


ARMED=false;

// if (MIDIChannel(status) && data1 >= 36 && data1 <= 51)
//    {
//       padInput.sendRawMidiEvent(status, data1 + (padOctave*16), data2);
//    }


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
   setTopLED(7, Colour.AMBER_FULL);
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
// SIDE BUTTONS:
//   TVbene: side buttons select post record delay and launch quantization
gridPage.onSceneButton = function(row, isPressed)
{
   if (isPressed)
   {
        switch(row)
      {       
         case MixerButton.VOLUME:
			offset.set(4);
			break;

         case MixerButton.PAN:
            offset.set(8);
            break;

         case MixerButton.SEND_A:
            offset.set(16);
            break;

         case MixerButton.SEND_B:
            offset.set(32);
            break;

         case MixerButton.TRK_ON:
			quant.set("1");
            break;

         case MixerButton.SOLO:
			quant.set("1/2");
            break;

         case MixerButton.ARM:
			quant.set("1/4");
            break;
      }
   }
};




//TVbene: Topbuttons 6, 7 now working without shift

gridPage.onUser1 = function(isPressed)
{
  println("user1 : arm function 9");

  if (isPressed)
    {
		ARMED = 9;
    }
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

gridPage.doGridNoteOrCCButton = function(row,column,pressed)
{
	var rowInvert = 3 - (row-4);
	var baseNoteNo = 24+(24*view_shift);
	var channel = 0;
	if (rowInvert<0 ) {
		rowInvert = 0;
	}
	var noteIndex = baseNoteNo+ ((rowInvert)*8)+column;

	if (trace>0) {
	  println("gridPage: lookup midi note or CC index "+noteIndex+" for controls page "+view_shift);
	}
	if (pressed) {
		noteInput.sendRawMidiEvent(NOTE_ON+channel, noteIndex, 127 );
	}
	else {	
		noteInput.sendRawMidiEvent(NOTE_OFF+channel, noteIndex, 0);
	};
};


gridPage.onGridButton = function(row, column, pressed)
{
	// Warren adapted to split into a 4 track, 8 scene clip launcher with 4 rows of 8 midi cc and note buttons

	if (row < 4) 
	{
		var track = column;
		var scene =  row;
	
		if (pressed && (trace>0) ) { 
			//println("gridPage.onGridButton row="+row+" col="+column);
			println("gridPage track ==> "+track);
			println("gridPage scene ==> "+scene);
			
		}

		
	var t = trackBank.getTrack(track);
	var l = t.getClipLauncherSlots();
        

	// if(ARMED)
	// {
	// //application.focusPanelAbove(); I believe this was causing the tracks to get cut and pasted
	// if(ARMED === 9)
	// 	{
	// 		{
	// 		l.deleteClip(scene);
	// 		host.showPopupNotification("deleted");
	// 		}
	// 	}
		
	// if(ARMED === 10)
	// 	{
	// 		l.select(scene);
	// 		host.showPopupNotification("selected");
	// 	}

	// }

	// else
	// 	{	
			if(isPlaying[column+8*row] > 0)
			{	println("stop clip");
				l.stop();
			}
			else
			{   println("launch clip");
				l.launch(scene);
			}
	//	}

	}
	else if (row >= 4) 
	{
		gridPage.doGridNoteOrCCButton(row,column,pressed);
		

	}


};

// updates the grid and VUmeters
gridPage.updateGrid = function()
{
   for(var t=0; t<8; t++)
   {
      this.updateTrackValue(t);
      this.updateVuMeter(t);
   }
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

// even though this section is called updateVumeter, it also setups the colours of all side buttons when they are pressed
gridPage.updateVuMeter = function(track)
{
	var val = null;
	var offsetFormatted = offset.getFormatted();
	var quantValue = quant.get();
    for(var i=0; i<4; i++)
	{
		var colour = Colour.GREEN_LOW;
		val = i
		if(i == 0 && offsetFormatted == "001:00:00:00")
		{
			colour = Colour.GREEN_FULL
		}
		else if(i == 1 && offsetFormatted == "002:00:00:00")
		{
			colour = Colour.GREEN_FULL
		}
		else if(i == 2 && offsetFormatted == "004:00:00:00")
		{
			colour = Colour.GREEN_FULL
		}		
		else if(i == 3 && offsetFormatted == "008:00:00:00")
		{
			colour = Colour.GREEN_FULL
		}	
	   setpostrecordLED(val, colour);
	}
	for(var j=5; j<8; j++)
	{
		var colour = Colour.RED_LOW;
		q = j
		if(j == 5 && quantValue == "1")
		{
			colour = Colour.RED_FULL
		}
		else if(j == 6 && quantValue == "1/2")
		{
			colour = Colour.RED_FULL
		}
		else if(j == 7 && quantValue == "1/4")
		{
			colour = Colour.RED_FULL
		}		

	   setquantizeLED(q, colour);
	}

   
};



gridPage.updateTrackValue = function(track)
{
	if (activePage != gridPage) return;
	// this section draws the pads for the main clip launcher
	for(var scene=0; scene<8; scene++)
	{
		var i = track + scene*8;
//TVbene: Colour of armed tracks/clips
		var col = scene < 4 ? Colour.GREEN_LOW : Colour.RED_LOW;
	 
		var fullval = mute[track] ? 1 : 3;
		
		// TVbene: added Yellow flashing while in select clip mode 
		if(ARMED === 10 && isSelected[i] > 0)
		{
			col = Colour.YELLOW_FLASHING;
		} 
		else if (hasContent[i] > 0)
		{
			if (isQueued[i] > 0)
			{
			   col = Colour.GREEN_FLASHING;
			}
			else if (isRecording[i] > 0)
			{
			   col = Colour.RED_FULL;
			}
			else if (isStopQueued[i] > 0)
			{
				col = Colour.RED_FLASHING
			}
			else if (isPlaying[i] > 0)
			{
			   col = Colour.GREEN_FULL;
			}
			else
			{
			   col = Colour.AMBER_FULL;
			}
		}

		 setCellLED(track, scene, col)
	}
	
};
