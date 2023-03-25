
/*
*  GRID PAGE
*
*  Originally this was an 8 sceneS (ROWS) x 8 track clip (COLUMNS) launcher grid.
*
*  Warren's version adds a splittable layout option.
*  When split the top half is a clip launcher grid for four tracks, designed for the clip launcher/mixer layout 
*  where the tracks are vertical and scenes are horizontal:
*
*            [TRACK1]  [TRACK2]  [TRACK3]
*   [SCENE1]  ....      ....       ....
*   [SCENE2]  ....      ....       ....
*
*  When the split feature is activated, the bottom half is a keyboard note or midi CC transmitter.
*
*  The UP/Down arrow MOVES THE SCENE BANK (YELLOW SQUARES) UP AND DOWN
*  THE LEFT/RIGHT ARROW MOVES THE TRACK WHICH IS ACTIVE WHICH IS PARTICULARLY USEFUL FOR LIVE PLAYING ON BITWIG 

*  USER1         = PLAY/STOP  
*  USER1+SESSION = SPLIT MODE ON/OFF
*  USER1+SHIFT   =
*  USER1+MODE    =
*  USER1+META    =
*
*  LAUNCH KEYS = rigBht side vertical column of play-icon BUTTONS that launch scenes in the current scene bank (scene 1..8)
*
*  LAUNCHKEY+SHIFT=
*    LS1 (VOL)  = UNDO
*    LS2 (PAN)  = REDO
*    LS3 (sndA) = ZOOM+
*    LS4 (sndB) = ZOOM-
*    LS5 (stop) = ZOOM to Fit
*    LS6 (trkon)= ZOOM to Selection (toggle)
*    LS6 (solo) = ?
*    LS7 (arm)  = ?
*
*  LAUNCHKEY+MODE=
*    LS1 (VOL)  = Clip Automation Write toggle
*    LS2 (PAN)  = Metronome toggle
*    LS3 (sndA) = Loop arranger section toggle
*    LS4 (sndB) = Mixer Edit
*    LS5 (stop) = Note Editor
*    LS6 (trkon)= ?
*    LS6 (solo) = ?
*    LS7 (arm)  = ?

*  LAUNCHKEY+META=
*    LS1 (VOL)  = Browser toggle
*    LS2 (PAN)  = Inspector View
*    LS3 (sndA) = Arranger View
*    LS4 (sndB) = Mix View
*    LS5 (stop) = Edit View
*    LS6 (trkon)= Device toggle
*    LS6 (solo) = Clip Overdub Toggle
*    LS7 (arm)  = Pre-Roll Metronome Toggle
*
*
*  SESSION = [META]  FOR KEY COMBINATIONS  
*  USER2   = [MODE]  FOR KEY COMBINATIONS
*  MIXER   = [SHIFT] FOR KEY COMBINATIONS
*
* */






gridPage = new Page();

gridPage.mixerAlignedGrid = true;
gridPage.canScrollTracksUp = false;
gridPage.canScrollTracksDown = false;
gridPage.canScrollScenesUp = false;
gridPage.canScrollScenesDown = false;
gridPage.title = "Clip Launcher";
gridPage.notify = gridPage.title + " (User1:Split Keys/Clips)";

gridPage.currentVelocity = 127;
gridPage.split = false;
gridPage.grid_shift=0; // only useful when using split mode. 
gridPage.scene_active = -1; // no active scene
gridPage.armed_track = -1;
gridPage.canCycle = false; // parameter pages : cycle when reach end? 

gridPage.maxrow = 8;
gridPage.maxcol = 8;
gridPage.rowDown= -1;
gridPage.columnDown= -1;
gridPage.playingStep = -1;
gridPage.previousPlayingStep = -1;

gridPage.banked = 0;
gridPage.LastDeletedTrack = 0;
gridPage.LastDeletedScene = 0;
gridPage.KeysPagePressCount = 0;


ARMED=false;




gridPage.nextPreset = function()
{  println("next preset");
	//cursorDevice.switchToNextPreset(); // use browser instead
	browser.selectNextFile();
};

gridPage.previousPreset = function()
{   println("previous preset");
	//cursorDevice.switchToPreviousPreset(); // use browser instead
	browser.selectPreviousFile();
};
 
gridPage.nextParameterPage = function()
{  println("next parameter page");
   remoteControls.selectNextPage(gridPage.canCycle); // replaces CursorTrack.nextParameterPage() which is DEPRECATED but not documented as such.
};

gridPage.previousParameterPage= function()
{   println("previous param page");
	remoteControls.selectPreviousPage(gridPage.canCycle); // replaces CursorTrack.previousParameterPage() which is DEPRECATED but not documented as such.
};
 


gridPage.previousDevice = function()
{
	cursorDevice.selectPrevious();
	
};

gridPage.nextDevice = function()
{
	cursorDevice.selectNext();
};

gridPage.CursorLeft = function(isPressed)
{
	if (isPressed) {
		gridPage.grid_shift = gridPage.grid_shift - 2;
		if (gridPage.grid_shift<0) {
			gridPage.grid_shift = 4;
		}
		
		showPopupNotification('Grid +'+gridPage.grid_shift);;
	}
}

//cursorClip.addPlayingStepObserver(gridPage.onStepPlay); ==>
gridPage.onStepPlay = function(step)
{
	if (trace>4) {
		println("gridPage.OnStepPlay step="+step);
	}
	gridPage.previousPlayingStep = gridPage.playingStep; 
	gridPage.playingStep = step;
	//gridPage.updatePlayingStep();
	flushLEDs();
};

gridPage.CursorRight = function(isPressed)
{
	if (isPressed) {
		gridPage.grid_shift = gridPage.grid_shift +2;
		if (gridPage.grid_shift>4) {
			gridPage.grid_shift =0;
		}
		showPopupNotification('Grid +'+gridPage.grid_shift);
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

gridPage.onScrollUp = function(isPressed)
{
   if (isPressed)
   {
      //if (this.mixerAlignedGrid) trackBank.scrollTracksUp();
      //else 
	  println("scroll scenes up");

	  trackBank.scrollScenesUp();
	  sceneBank.scrollUp();
   }
};

gridPage.onScrollDown = function(isPressed)
{
   if (isPressed)
   {
	println("scroll scenes down");
	  
      //if (this.mixerAlignedGrid) trackBank.scrollTracksDown();
      //else 
	  trackBank.scrollScenesDown();
	  sceneBank.scrollDown();
   }
};

gridPage.modeUp = function()
{ 
  println("MODE+UP: BANK SHIFT?");



};
// TVbene updates the mode buttons on the top
gridPage.updateOutputState = function()
{
   clear();

   if (trace > 2) {
   println("updateOutputState");
   }

   this.updateGrid();
   var c = Colour.OFF;
   var cls1 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.RED_FLASHING,Colour.YELLOW_FULL]); 
   var cls2 = ((WRITEOVR) ? [Colour.RED_FLASHING,Colour.RED_FULL]:[Colour.YELLOW_FLASHING,Colour.YELLOW_FULL]);  
   // Set the top LEDs while in Clip Launcher
   clipActive = transport.isPlaying().get();

   setTopLED(0,  clipActive ? Colour.GREEN_FULL : Colour.YELLOW_LOW );
   setTopLED(1,  clipActive ? Colour.GREEN_FULL : Colour.YELLOW_LOW );

   switch(view_shift) {
	   case 0:
		   	c = Colour.GREEN_LOW; break;
		case 1:
			c = Colour.ORANGE; break;
		case 2:
			c = Colour.YELLOW_LOW; break;
		default:
			c = Colour.RED_LOW;
   }
	setTopLED(2,  c );
	setTopLED(3,  c );
	
   
   setTopLED(5, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 9 ? (ARMED?cls1[0]:cls1[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 9 is for the delete clip mode
   setTopLED(6, IS_SHIFT_PRESSED ? Colour.YELLOW_FULL : (ARMED == 10 ? (ARMED?cls2[0]:cls2[1]):Colour.GREEN_LOW)); //TVbene: ARMED == 10 is for the select clip mode
   setTopLED(7, IS_SHIFT_PRESSED ? Colour.AMBER_FULL : Colour.GREEN_LOW);
};

gridPage.onSession = function(isPressed)
{   
	IS_META_PRESSED  = isPressed;
	if (IS_META_PRESSED)
	{ 
	   println("[META] Pressed (grid)");
	} 
	else
	{ 
	   println("[META] Release (grid)");
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

gridPage.cursorDeviceReplace = function()
{
	if (cursorDevice.exists().get()) {
		cursorDevice.browseToReplaceDevice();
	} else {
		cursorDevice.browseToInsertAtStartOfChain();
	}
}


gridPage.onSceneButtonShift = function(row, isPressed)
{
	if (isPressed) {
		println("onSceneButtonShift "+row);

		if (row==0) {
			application.undo();
		} else if (row==1) {
			application.redo();
		} else if (row==2) {
			application.zoomIn();
		} else if (row==3) {
			application.zoomOut();
		} else if (row==4) {
			application.zoomToFit();
		}  else if (row==5) {
			application.zoomToSelectionOrAll();
		} else if (row==6) {
			//application.zoomToFit();
		}		else if (row==7) {
			//application.zoomToFit();
		}

	 }

}

gridPage.onSceneButtonMeta = function(row, isPressed)
{
	if (isPressed) {
		println("onSceneButtonMeta "+row);

		if (row==0) {
			application.toggleBrowserVisibility();
		} else if (row==1) {
			application.toggleInspector();
		}else if (row==2) {
		
			application.setPerspective('ARRANGE');
		}else if (row==3) {
			
			application.setPerspective('MIX');
		}else if (row==4) {
			application.setPerspective('EDIT');
		}else if (row==5) {
			
			application.toggleDevices();
		}else if (row==6) {
			transport.isClipLauncherOverdubEnabled().toggle();
		}else if (row==7) {
			transport.isMetronomeAudibleDuringPreRoll().toggle();
		}
	 }

}

gridPage.onSceneButtonMode = function(row, isPressed)
{
	if (isPressed) {
		println("onSceneButtonMeta "+row);

		if (row==0) {
			transport.isClipLauncherAutomationWriteEnabled().toggle();
		} else if (row==1) {
			transport.isMetronomeEnabled().toggle();
		}else if (row==2) {
			transport. isArrangerLoopEnabled().toggle();
		}else if (row==3) {
			application.toggleMixer();
		}else if (row==4) {
			application.toggleNoteEditor();
		}else if (row==5) {
			//application.zoomToFit();
		}else if (row==6) {
			//application.zoomToFit();
		}else if (row==7) {
			//application.zoomToFit();
		}
	 }

}
// LAUNCH SCENE: RIGHT SIDE BUTTONS press. (scene,  vol,pan,etc)
gridPage.onSceneButton = function(row, isPressed)
{

	if (IS_SHIFT_PRESSED) {
		return gridPage.onSceneButtonShift(row,isPressed);
	}
	else if (IS_META_PRESSED) {
		return gridPage.onSceneButtonMeta(row,isPressed);
	}
	else if (IS_MODE_PRESSED) {
		return gridPage.onSceneButtonMode(row,isPressed);
	}

   if (isPressed)
   {  	println("onSceneButton "+row);

	

	   if (row<=gridPage.maxrow) {
		// top half is like ableton live launchpad, launches a scene.
		masterTrack.mute().set(false);
		scene = row+gridPage.grid_shift;
		
		sceneBank.getScene(scene).launch();
		println("launch scene "+scene+1 );

		gridPage.scene_active = scene; 
	   }

	  /* else
     switch(row)
      {   
		  	case MixerButton.STOP:
				if (IS_SHIFT_PRESSED) {
					gridPage.previousParameterPage();
				} else {
				   gridPage.nextParameterPage();
				}
			   
			  break;
         case MixerButton.TRK_ON: 
		 	if (IS_SHIFT_PRESSED) {
				 gridPage.previousDevice();
			 } else {
				gridPage.nextDevice();
			 }
            break;

         case MixerButton.SOLO:
			if (IS_META_PRESSED) {
				isSolo =  cursorDevice.getChannel().getSolo().get(); 
				cursorDevice.getChannel().getSolo().set( !isSolo );
				if (!isSolo) {
					cursorDevice.getChannel().getMute().set(false);
					showPopupNotification("SOLO");
				} else {
					showPopupNotification("SOLO Off");
				}


			} else if (IS_SHIFT_PRESSED) {
				isMute =  cursorDevice.getChannel().getMute().get(); 
				cursorDevice.getChannel().getMute().set( !isMute );
				if (!isMute) {
					cursorDevice.getChannel().getSolo().set( false );
					showPopupNotification("MUTE");
				} else {
					showPopupNotification("MUTE Off");
				}
			} 
			else {
				println("Change Keys velocity");
		    	gridPage.ChangeVelocity();
			}
            break;

         case MixerButton.ARM:
			if (IS_META_PRESSED) {
				gridPage.cursorDeviceReplace();

			} else if (IS_SHIFT_PRESSED) {
				// you can create a track given any known bitwig device name or plugin name
				createSpecialTrack('Drum Machine');
			} else {
				gridPage.SetQuantNext();
			}
			break;

      }
	  */
   }
   else
   {

   }
};





// PLAY/STOP (USER1)
gridPage.onUser1 = function(isPressed)
{
	if (isPressed) {
		if (IS_META_PRESSED) {
			print("[META+USER1] SPLIT ");
			gridPage.split = !gridPage.split;
			println("[user1] TOGGLE split ="+gridPage.split);
			if (gridPage.split) {
				gridPage.maxrow =4; 

			} 
			else {
				gridPage.maxrow = 8;
			}
			gridPage.updateOutputState();
			flushLEDs();

		} else if (IS_SHIFT_PRESSED) {
			println("[SHIFT+USER1]");
		
		} else {
			
			//USER1 without shift/meta/mode is play and stop
            if (isPressed)
            {  
               
               if (IS_SHIFT_PRESSED && playing) {
                  println("shift+play: musical stop");
                  MUSICAL_STOP_STATE = 1;
                  MasterTrackVolume = getMasterVol();

                  return;
               }
               else
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

			

		}

	}
	else {
		println("USER1 button release");
	}
   
}

// MODE BUTTON (USER2)
gridPage.onUser2 = function(isPressed)
{

	IS_MODE_PRESSED = isPressed;

	// if (isPressed) {
	// 	if (IS_META_PRESSED) {
	// 		print("[META+USER2]");
	// 		//gridPage.nextPreset();
	// 		cursorClip.duplicateContent();
	// 	} else if (IS_SHIFT_PRESSED) {
	// 		print("[SHIFT+USER2]");
	// 	} else {
	// 		// browser.startBrowsing(); no worky.
	// 	}
	// }
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
var BASE_NOTES = [36,12,48,96];

// META (DEL) + CLIP LAUNCHER BUTTON : DELETE CLIP
gridPage.doMetaGridPress = function(row,column,pressed)
{
	
	if (pressed) {
 	 println("[META]+ { ROW:"+row+" COL:"+column+" } - Clear clip");
	 var track = column;
	 var scene =  row+gridPage.grid_shift;	
	 var t = trackBank.getChannel(track);
	 var l = t.getClipLauncherSlots();
	 l.deleteClip(scene);
	 gridPage.LastDeletedTrack = track;
	 gridPage.LastDeletedScene = scene;
	}
}


// MODE (OVRDB) + CLIP LAUNCHER BUTTON : OVERDUB CLIP
gridPage.doModeGridPress = function(row,column,pressed)
{
	
	if (pressed) {
 	 println("[MODE]+ { ROW:"+row+" COL:"+column+" } - Clear clip");
	 var track = column;
	 var scene =  row+gridPage.grid_shift;	
	 var t = trackBank.getChannel(track);
	 var l = t.getClipLauncherSlots();
	 //l.createEmptyClip (scene, 8 * 4); // 8 bars
	 
	 l.record(scene);

	}
}
gridPage.doShiftGridPress = function(row,column,pressed)
{
	
	if (pressed) {
 	 println("[SHIFT]+ { ROW:"+row+" COL:"+column+" } - Duplicate clip");
	 var track = column;
	 var scene =  row+gridPage.grid_shift;	
	 var t = trackBank.getChannel(track);
	 var l = t.getClipLauncherSlots();
	 l.duplicateClip(scene);
	}
}

gridPage.doGridNoteOrCCButton = function(row,column,pressed)
{
	var rowInvert = 3 - (row-4);
	var baseNoteNo = BASE_NOTES[view_shift];


	if (pressed) {
		gridPage.rowDown=row;
		gridPage.columnDown=column;
	} else {
		gridPage.rowDown=-1;
		gridPage.columnDown=-1;

	}
	
	var channel = 0;
	
	if (rowInvert<0 ) {
		rowInvert = 0;
	}
	var noteIndex = baseNoteNo+ ((rowInvert)*8)+column; // this is the physical 8 by 8 not the OBSERVER_MULT

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

// record clips and play them.
gridPage.onGridButton = function(row, column, pressed)
{


	// Warren adapted to split into a 4 track, 8 scene clip launcher with 4 rows of 8 midi cc and note buttons
    // println("gridPage.onGridButton row "+row+" column "+column+" pressed "+pressed );
	if ((row < gridPage.maxrow)||(!gridPage.split)) 
	{
		if (IS_SHIFT_PRESSED) {
	
			return gridPage.doShiftGridPress(row,column,pressed);
		}
		
		if (IS_META_PRESSED) {
		
			return gridPage.doMetaGridPress(row,column,pressed);
		}
		if (IS_MODE_PRESSED) {
		
			return gridPage.doModeGridPress(row,column,pressed);
		}
	
	
		
		var track = column;
		var scene =  row+gridPage.grid_shift;
		//println("scene "+scene);
	
			
		var t = trackBank.getChannel(track);
		var l = t.getClipLauncherSlots();
			
		var tt = t.trackType().get();
		var te = t.exists().get();
		println("exists "+te)
		println("track type= "+tt);
		if (IS_MODE_PRESSED && pressed) {
			//if (row==8) {
		    //	 // add a device at end of chain. 
			 // t.browseToInsertAtEndOfChain ();
			//} else
			 if (row==7) {
				t.mute().toggle();
			}  else if (row==6) {
				t.solo().toggle();
			}   else if (row==5) {
				t.arm().toggle(); // record arm
			}  else if (row==4) {
				t.monitor().toggle();
			}  else if (row==3) {
				//t.
			}  else if (row==2) {
				//t.
			} else if (row==1) {
				//t.
			}  else if (row==0) {
				if ( tt != "") {
				  t.selectInMixer();
				  println("select track");
				}
				else {
					application.createInstrumentTrack(-1); //-1:end of list
					//cursorDevice.browseToInsertAtStartOfChain();
					cursorTrack.startOfDeviceChainInsertionPoint().browse();
					println("add instrument track");
				}
			}

		   return;
		   
	   }


		if (pressed) {

				if (gridPage.armed_track>=0) {
					println("disarming track# "+gridPage.armed_track);
					trackBank.getChannel(gridPage.armed_track).arm().set(false);
					
				}
				
				trackBank.scrollToChannel(track);
				trackBank.getChannel(track).arm().set(true);
				//println("arm");
				gridPage.armed_track = track;
				//println("arm2");

				

				//if(isPlaying[column+8*scene] > 0)
				if(  getPlaying(scene,column) )
				{	
					if (IS_META_PRESSED) {
						l.record(scene);
					}
					else
					if (!IS_SHIFT_PRESSED) {
						println("stop track "+(track+1) +" clip "+(scene+1));				
						l.stop();
					}

				}
				else
				{  
					masterTrack.mute().set(false);
					if ((scene>=0)&&(scene<=7)) {
						println("tracktype:"+t.trackType());
						println("launch track "+(track+1)+" clip "+(scene+1));
						if (IS_META_PRESSED) {
							l.record(scene);
						}
						else {
							println("SCENE LAUNCH "+scene);
							l.launch(scene);
						}
					} else {
						println("launch track "+(track+1)+" clip "+(scene+1)+" ? ");
						
					}

				}
		}

	}
	else if ((row >= gridPage.maxrow)&&(gridPage.split)) 
	{
		if (trace>2) {
		println("note @ "+row+" "+column);
		}

		gridPage.doGridNoteOrCCButton(row,column,pressed);
		

	}


};

function setTopSplitGridColour(colour) 
{
   for (var c=0;c<8;c++) //
   for (var r=0;r<4;r++) // GRID_NOTE_ROWS
      setCellLED(c,r, colour );
}
function setBottomSplitGridColour(colour) 
{
   for (var c=0;c<8;c++) //
   for (var r=4;r<8;r++) // GRID_NOTE_ROWS
      setCellLED(c,r, colour );
}

function setBottomSparkle(coloura,colourb) 
{
   for (var c=0;c<8;c++) //
   for (var r=4;r<8;r++) {
	   	if (Math.random()>0.9)
      		setCellLED(c,r, coloura )
		else
			setCellLED(c,r, colourb )
   }
}

gridPage.updatePlayingStep = function()
{
	
	if (gridPage.previousPlayingStep>=0) {
		setCellLED( gridPage.previousPlayingStep % 8, Math.floor(gridPage.previousPlayingStep/8),-1 );
	} 
	if (gridPage.playingStep>=0) {
		setCellLED( gridPage.playingStep % 8, Math.floor(gridPage.playingStep/8),Colour.ORANGE );
	} 
	
}

// updates the grid (no more vumeter feature)
gridPage.updateGrid = function()
{

	if (trace>0) {
	println("gridPage.updateGrid");
	}
	clipActive = transport.isPlaying().get();

   for(var col=0; col<gridPage.maxcol; col++)
   {
      this.updateTrackValue(col); // one column of grid
   }
	
  // gridPage.updatePlayingStep();


   if (gridPage.split) {
			//	draw bottom area keys
			if ((gridPage.columnDown>=0)&&(gridPage.rowDown>=0)) {
				setBottomSparkle(Colour.ORANGE,ViewShiftColour(view_shift));
				setCellLED(gridPage.columnDown,gridPage.rowDown, Colour.YELLOW_FULL);
			}
			else
			if ((!IS_SHIFT_PRESSED)&&(!IS_META_PRESSED)&&clipActive) {
				
					setBottomSparkle(ViewShiftColour(view_shift),Colour.ORANGE);
				
			}
			else
			setBottomSplitGridColour(ViewShiftColour(view_shift));
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
		if (isPlaying[track + (scene* OBSERVER_MULT)]) {
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

	var alt = Colour.GREEN_LOW;



	// last three scene LEDs are for various status flags
	if (IS_SHIFT_PRESSED ) {
		for(var j=0; j< gridPage.maxrow; j++)
			{
			
			setSceneLEDColor(j, Colour.YELLOW_LOW);
			}
	
		if (gridPage.split)
		for(var j=4; j<8; j++)
			{
			
			setSceneLEDColor(j, Colour.AMBER_FULL);
			}
	}
	else {
		for(var j=0; j<gridPage.maxrow; j++)
		{
			scenePlaying = playing && ( j+gridPage.grid_shift == gridPage.scene_active );
		   if ((scenePlaying) && (timerState==0)) {
			setSceneLEDColor(j,  Colour.OFF );
		   } 
		   else 
		   {
				
			     if (( gridPage.grid_shift==2)&&(j==1)) {
					 alt = Colour.YELLOW_LOW;
				 } else if (( gridPage.grid_shift==4)&&(j==3)) {
					alt = Colour.YELLOW_LOW;
				}
				else
					alt = Colour.GREEN_LOW;
			    setSceneLEDColor(j, scenePlaying ? Colour.GREEN_FULL : alt );
		   }
		 
		}

		if (!gridPage.split) {
		 setSceneLEDColor(4, Colour.YELLOW_LOW);
		 setSceneLEDColor(5, Colour.YELLOW_FULL);
		 setSceneLEDColor(6, Colour.RED_LOW);
		 setSceneLEDColor(6, Colour.GREEN_LOW);
		}
		
	
	}
	

	
   
};

/*

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
			 
	
		
		
*/


// track = column (REFRESH MAIN GRID)
gridPage.updateTrackValue = function(track)
{
	track_offset = track;

	active = trackBank.getChannel(track_offset).isActivated().get();
	selected = active && trackEquality[track_offset].get();
	//println("selected "+selected);
	
	tplay = transport.isPlaying().get();

	//
	randcol=-1;
	// if (Math.random()>0.9)
	// 	randcol = 2+Math.floor(Math.random()*6);

	//println("active "+active);

	// scenes are ROWS in the launchpad in this script. 
	for(var scene=0; scene<gridPage.maxrow; scene++)
	{
		var i = track_offset + ((scene+gridPage.grid_shift) * OBSERVER_MULT);

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
			 

			 //  selected track : flash yellow.
			 if (selected) {
				if (timerState==0 ) {
				 col = Colour.YELLOW_LOW;
				} else {
					col = Colour.OFF;
				}
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
