
/*
*  MIXER PAGE
*
*  This is stolen from the mixer page idea novation coded for FL Studio's launchpad controller mode.
* 
* */





mixerPage = new Page();

//var mixerPage = mixerPage; // nope.

MixMode = {
	TrackVolFader:0,
	DeviceMode:1,
	CCMode : 2,
	TrackPanFader:3
}

MixerModes = [MixMode.CCMode,MixMode.DeviceMode,MixMode.TrackFader];


mixerPage.mixerAlignedGrid = true;
mixerPage.canScrollTracksUp = false;
mixerPage.canScrollTracksDown = false;
mixerPage.canScrollScenesUp = false;
mixerPage.canScrollScenesDown = false;
mixerPage.title = "Fader/Mix Mode"; 
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
mixerPage.mixerAnimate = [];
mixerPage.pollingRate = 30;
mixerPage.mixerButtonLevel = [];
mixerPage.SubMode = MixMode.TrackVolFader; // faders control track volumes output CCs
//mixerPage.MixerPageModeColor = [Colour.YELLOW,Colour.ORANGE,Colour.RED,Colour.GREEN_FULL] ;


mixerPage.ccAnimation = true; // timed writes

//println("<<<<<<>>>> "+mixerPage.SubMode);

mixerPage.resetMixerVisualLevel = function()
{
	for(var i= 0; i<20; i++)
	{
		mixerPage.mixerCCValues[i] = 0; //0-127,  row 7 means zero, row 0 means CC max value (127)
		mixerPage.mixerButtonLevel[i] = 7; //0-7  (7=lowest row lit)
		mixerPage.mixerAnimate[i] = -1; // animation not active when < 0, any other value is an active animation value, even 0.

		//println("mixerPage.mixerCCValues["+i+"] "+mixerPage.mixerCCValues[i]);
	}
}

mixerPage.resetMixerVisualLevel();


function scale(n) {
	x = n/127;
	if (x<0)
		x = 0;
	if (x>1)
		x =1;

	return x;

}

mixerPage.writeMixerValue = function(channel,index,mixValue) {
	if (mixValue==undefined){
		println("writeMixerValue:undefined mixValue");
		return;
	}
	if (ccIndex==undefined){
		println("writeMixerValue:undefined ccIndex");
		return;
	}
	if (mixerPage.SubMode == MixMode.CCMode) {
		
		//println("write value");
		ccIndex = 108+index;
		noteInput.sendRawMidiEvent(CC_MSG+channel, /*data1*/ccIndex, /*data2*/mixValue );
	}
	else if (mixerPage.SubMode==MixMode.DeviceMode) {
		// write to quick controls.
		//remoteControls or userControl.

		//userControls.getControl(index).value().set(scaledMixValue);
		scaledMixValue = scale(mixValue)
		remoteControls.getParameter(index).value().set(scaledMixValue);
		println("CONTROL#"+index+": "+scaledMixValue);
		
	} 
	else if (mixerPage.SubMode==MixMode.TrackVolFader){

		var track = trackBank.getTrack(index);
		scaledMixValue = scale(mixValue)
		track.getVolume().set(scaledMixValue);
		println("TRACK VOL#"+index+": "+scaledMixValue);
	}
	
}
mixerPage.polledFunction = function()
{
	/*
		if (!mixerPage.ccAnimation) {
		mixerPage.mixerCCValues[mixerIndex] = mixValue;
    
	} else {
		mixerPage.mixerAnimate[mixerIndex] = mixValue;
    
	}
	*/

  if (!mixerPage.ccAnimation) 
  	return;
	
  var channel = 0; // probably don't need to set this >0
  for (i=0;i<8;i++) {
	  if (mixerPage.mixerAnimate[i] >= 0) {
		//println("anim mixer index "+i);
		ccIndex = 108+i;
		//println("mixerPage.mixerCCValues["+i+"] "+mixerPage.mixerCCValues[i]);
		//println("mixerPage.mixerAnimate["+i+"] "+mixerPage.mixerAnimate[i]);

		delta = mixerPage.mixerAnimate[i]-mixerPage.mixerCCValues[i];
		if (delta>8) {
			delta=8;
		} else if (delta<-8) 
		{
			delta=-8;
		}
		//println("delta",delta);
		mixValue = mixerPage.mixerCCValues[i]+delta;
		mixerPage.mixerCCValues[i]=mixValue;
		//println("animate ",mixValue)
		if (mixValue<0)
			mixValue = 0;
		if (mixValue>127)
			mixValue = 127;
		
		mixerPage.writeMixerValue(channel, i, mixValue ); // animated mixer write


		if (mixerPage.mixerCCValues[i]==mixerPage.mixerAnimate[i]) {
			mixerPage.mixerAnimate[i] = -1;
			//println("animation completed");
		}


	  }
  }

};




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


mixerPage.mixerLEDSOff = function() 
{
   
     for (var c=0;c<8;c++)
     {  
        for (var r=0;r<8;r++) 
        {
        
            setCellLED(c,r, Colour.OFF );
        }
    }
}


mixerPage.updateMixerLED = function () 
{
     // draw bars
  
    mixerPage.mixerLEDSOff();
	
    for (c=0;c<8;c++) {
        var mixerIndex = c+mixerPage.mixer_shift;
        var hotColour = c%2 ? Colour.YELLOW_FULL: Colour.GREEN_FULL;
        setCellLED(c, /*row=*/mixerPage.mixerButtonLevel[mixerIndex], hotColour );
		if (mixerPage.mixerButtonLevel[mixerIndex]<8) {
			for (var r=8;r>mixerPage.mixerButtonLevel[mixerIndex];r--) {
			  var barColour = c%2 ? Colour.YELLOW_FULL: Colour.GREEN_FULL;
			  setCellLED(c, r, barColour );
			}
        	  
		}
    }

}


// updateLED
mixerPage.updateOutputState = function()
{
   clear();

   this.updateMixerLED();


   setTopLED(0,   Colour.YELLOW_FULL); 
	setTopLED(1,  Colour.YELLOW_FULL);
	setTopLED(2,  Colour.YELLOW_FULL);
	setTopLED(3,  Colour.YELLOW_FULL);
	setTopLED(4,  Colour.OFF); //session
	
	//setTopLED(5, mixerPage.MixerPageModeColor[mixerPage.SubMode] );
	if (mixerPage.SubMode == MixMode.CCMode) {
		
		setTopLED(5, Colour.GREEN_FULL);
	}
	else if (mixerPage.SubMode==MixMode.DeviceMode) {
		setTopLED(5, Colour.ORANGE);
	} 
	else if (mixerPage.SubMode==MixMode.TrackVolFader){
		setTopLED(5, Colour.YELLOW_FULL);
	}

	

	setTopLED(6, Colour.OFF);
	setTopLED(7, Colour.OFF);
	

	for (i=0;i<7;i++)
		setSceneLEDColor(i,Colour.OFF);

  
};

mixerPage.onSession = function(isPressed)
{   
    
	IS_META_PRESSED  = isPressed;
	if (IS_META_PRESSED)
	{ 
	   println("[META] Pressed (keys)");
	} 
	else
	{ 
	   println("[META] Release (keys)");
	}
	/*
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

    }*/

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
	if (isPressed) {
		//mixerPage.ccMode = !mixerPage.ccMode;
		//println("mixerPage.ccMode="+mixerPage.ccMode);
		println("mixer state "+mixerPage.SubMode);
		mixerPage.SubMode = mixerPage.SubMode+1;
		println("mixer state "+mixerPage.SubMode);
		if (mixerPage.SubMode >= 3) {
			mixerPage.SubMode = 0;
		}
		if (mixerPage.SubMode==MixMode.CCMode){
			showPopupNotification('Fader/Mixer:CC Mode');
		} else if (mixerPage.SubMode==MixMode.DeviceMode){
			showPopupNotification('Fader/Mixer:Device Quick Controls Mode');
		} else {
			showPopupNotification('Fader/Mixer:Track Volume')
		}

		mixerPage.resetMixerVisualLevel();
		//mixerPage.updateOutputState();
	}
}

mixerPage.onUser2 = function(isPressed)
{
	
}

mixerPage.onShift = function(isPressed)
{
   
   

}





var BASE_NOTE = 36; // C2=36
var NOTE_PAGE_SIZE = 24;
var MIXER_VALUES= [0,16,33,63,80,96,116,127]; // as midi CC

mixerPage.doCCButton = function(row,column,pressed)
{
	var channel = 0; // probably don't need to set this >0
	var rowInvert = 7-row; 
	var mixerIndex =  column + mixerPage.mixer_shift;
    
	
    println("doCCButton "+row+" "+column+" "+pressed);
	
	if (pressed) {
		mixerPage.rowDown=row;
		mixerPage.columnDown=column;
        
	} else {
		mixerPage.rowDown=-1;
		mixerPage.columnDown=-1;

	}
    mixerPage.lastMixer = mixerIndex;
    var mixValue = MIXER_VALUES[rowInvert];
    
    mixerPage.lastMixerValue = row;


    mixerPage.mixerButtonLevel[mixerIndex] = row; // so we know which one to light up.
    
    println("mixerIndex"+mixerIndex+": value "+mixValue);
    
	
	 

	if (!mixerPage.ccAnimation) {
		mixerPage.writeMixerValue(channel, mixerIndex, /*data2*/mixValue ) // direct write, no animation
		mixerPage.mixerCCValues[mixerIndex] = mixValue;
	} else {
		println("mixerPage.mixerAnimate")
		mixerPage.mixerAnimate[mixerIndex] = mixValue;	
	}



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
		if (isPlaying[track + (scene * OBSERVER_MULT)]) {
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
		var i = track_offset + ((scene+mixerPage.mixer_shift) * OBSERVER_MULT);

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
