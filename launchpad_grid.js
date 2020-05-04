
/*
*  GRID PAGE
*
* */



gridPage = new Page();

gridPage.mixerAlignedGrid = true;
gridPage.canScrollTracksUp = false;
gridPage.canScrollTracksDown = false;
gridPage.canScrollScenesUp = false;
gridPage.canScrollScenesDown = false;
gridPage.title = "Clip Launcher";


ARMED=false;


// Updates the scroll buttons
gridPage.updateOutputState = function()
{
   clear();

   this.canScrollUp = this.mixerAlignedGrid ? this.canScrollScenesUp : this.canScrollTracksUp;
   this.canScrollDown = this.mixerAlignedGrid ? this.canScrollScenesDown : this.canScrollTracksDown;
   this.canScrollLeft = !this.mixerAlignedGrid ? this.canScrollScenesUp : this.canScrollTracksUp;
   this.canScrollRight = !this.mixerAlignedGrid ? this.canScrollScenesDown : this.canScrollTracksDown;
    
   this.updateScrollButtons();
   this.updateGrid();
   var cls1 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.RED_FLASHING,Colour.YELLOW_FULL]); 
   var cls2 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.YELLOW_FLASHING,Colour.YELLOW_FULL]);  
   // Set the top LEDs while in Clip Launcher
   setTopLED(4, IS_SHIFT_PRESSED ? Colour.RED_FULL : Colour.RED_FULL);
   setTopLED(5, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 9 ? (ARMED?cls1[0]:cls1[1]):Colour.OFF)); //TVbene: ARMED == 9 is for the delete clip mode
   setTopLED(6, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 10 ? (ARMED?cls2[0]:cls2[1]):Colour.OFF)); //TVbene: ARMED == 10 is for the select clip mode
   setTopLED(7, Colour.AMBER_FULL);
   //trackBank.scrollToChannel(9); TVbene: For additional instances of this script so that they control different tracks
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
//TVbene: Topbuttons 6, 7 now working without shift

gridPage.onUser1 = function(isPressed)
{
  if (isPressed)
    {
		ARMED = 9;
    }
}

gridPage.onUser2 = function(isPressed)
{
    if (isPressed)
    {
		ARMED = 10;
    }
}

// This detects when the Mixer button is pressed and changes the orientation identifier mixerAlignedGrid and displays the text popup
gridPage.onShift = function(isPressed)
{
    if (mixerButtonToggle == true)
    {
    //add in FINE adjustments for mixer buttons
    }
    
    if(ARMED > 0 && armedToggle == false)
    {
    armedToggle = true;
    return;
    }
    
    if(ARMED > 0 && armedToggle == true)
    {
    armedToggle = false;
    ARMED = 0;
    mixerButtonToggle = false;
    return;
    }
}



// These following 4 functions control the scrolling arrow buttons allowing move around
gridPage.onLeft = function(isPressed)
{
   if (isPressed)
   {
        if (IS_SHIFT_PRESSED)
        {
         if (this.mixerAlignedGrid) trackBank.scrollTracksPageUp();
         else trackBank.scrollScenesPageUp();
        }
        else
        {
        if (this.mixerAlignedGrid) trackBank.scrollTracksUp();
        else trackBank.scrollScenesUp();
        }
   }
};

gridPage.onRight = function(isPressed)
{
   if (isPressed)
   {
        if (IS_SHIFT_PRESSED)
        {
         if (this.mixerAlignedGrid) trackBank.scrollTracksPageDown();
         else trackBank.scrollScenesPageDown();
        }
        else
        {
        if (this.mixerAlignedGrid) trackBank.scrollTracksDown();
        else trackBank.scrollScenesDown();
        }
   }
};

gridPage.onUp = function(isPressed)
{
   if (isPressed)
   {
      if (IS_SHIFT_PRESSED)
      {
      if (this.mixerAlignedGrid) trackBank.scrollScenesPageUp();
      else trackBank.scrollTracksPageUp();
      }
      else
      {
      if (this.mixerAlignedGrid) trackBank.scrollScenesUp();
      else trackBank.scrollTracksUp();
      }
   }
};

gridPage.onDown = function(isPressed)
{
   if (isPressed)
   {
      if (IS_SHIFT_PRESSED)
      {
         if (this.mixerAlignedGrid) trackBank.scrollScenesPageDown();
         else trackBank.scrollTracksPageDown();
      }
      else
      {
      if (this.mixerAlignedGrid) trackBank.scrollScenesDown();
      else trackBank.scrollTracksDown();
	  }
   }
};
REFROW=false;
ROWARM=false;

gridPage.onStepPlay = function(step)
{
   gridPage.firstStep = !step;
};

gridPage.onGridButton = function(row, column, pressed)
{

	var track = this.mixerAlignedGrid ? column : row;
	var scene = this.mixerAlignedGrid ? row : column;
	var t = trackBank.getTrack(track);
	var l = t.getClipLauncherSlots();
        

	if(ARMED)
	{
	//application.focusPanelAbove(); I believe this was causing the tracks to get cut and pasted
	if(ARMED === 9)
		{
			if(hasContent[track+8*scene]>0)
			{
			l.deleteClip(scene);
			host.showPopupNotification("deleted");
			}
		}
	if(ARMED === 10)
		{
			l.select(scene);
			host.showPopupNotification("selected");
		}

	}

	else
		{	
			if(isPlaying[track+8*scene] > 0)
			{	
				l.stop();
			}
			else
			{
				l.launch(scene);
			}
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
   var val = vuMeter[track];
   var colour = Colour.OFF;
   
   if(ARMED)
   {
       if (ARMED == 9)
       {
           colour = Colour.RED_FLASHING;
       }
       else if(ARMED == 10)
       {
           colour = Colour.YELLOW_FLASHING;
       }
       else if(track <= ARMED-1)
       {
            colour = Colour.ORANGE;
       }
   }
   else
   {
       if (this.mixerAlignedGrid)
       {
           var i = 7 - track;
           colour = masterVuMeter > i ? vuLevelColor(Math.max(1, i)) : Colour.OFF;
       }
       else
       {
           colour = vuLevelColor(masterVuMeter);
       }

          
   }
   setRightLED(track, colour);
};



gridPage.updateTrackValue = function(track)
{
   if (activePage != gridPage) return;
	// this section draws the pads for the main clip launcher

	for(var scene=0; scene<8; scene++)
	{
		var i = track + scene*8;
//TVbene: Colour of armed tracks/clips
		var col = arm[track] ? Colour.GREEN_LOW : Colour.OFF;
		 
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

         setCellLED(this.mixerAlignedGrid ? track : scene, this.mixerAlignedGrid ? scene : track, col)

   }
};
