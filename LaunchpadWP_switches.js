
/*
 * SWITCHES PAGE
 *  Launchpad way of mapping white and black keys is odd but you get used to it.
 *    x = not used.  # = black keys (red) CDEFGAB= white keys on piano
 * 
 *   x##x###x
 *   CDEFGABC
 *   x##x###x
 *   CDEFGABC
 *   x##x###x
 *   CDEFGABC
 *   x##x###x
 *   CDEFGABC
 * 
 *  USER1 key is basically a one note version of the clip launcher.
 *  This lets you start recording or start playback on the last deleted clip from the session page.
 *  That lets me delete a clip and then listen and play drum sample triggers and then start recording
 *  when I am inspired to do so without switching back to the grid page. session and arrow right is how
 *  we get from grid into keys and session and arrow left is how we get back to grid.
 *  Pressing meta (session) and user1 lets us clear the last recorded slot and re-record it.
 * */

var switchesPage = new Page();

switchesPage.title = "Switches (CC)";
switchesPage.notify = switchesPage.title;
switchesPage.ccStart = 14;
switchesPage.state = [0];
for	(var index = 0; index < 128; index++)  {
     switchesPage.state[index] = 0;  // javascript, genius or shit. you decide.
 }


switchesPage.CursorLeft = function(isPressed)
{
 println("cursor left on switches");

}


switchesPage.CursorRight = function(isPressed)
{
 println("cursor right on switches");
 
}

switchesPage.updateOutputState = function()
{
   // println("uos");
   clear();
   setTopLED(5, WRITEOVR ? Colour.RED_FULL:Colour.YELLOW_FULL);
   setTopLED(7, gridPage.firstStep ? Colour.RED_FULL:Colour.GREEN_FULL);
   switchesPage.drawKeys();
};

switchesPage.onSession = function(isPressed)
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
   

}

switchesPage.onUser1 = function(isPressed)
{
   if (isPressed)
   {
      if (IS_SHIFT_PRESSED)
      {
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
      {
         if (IS_META_PRESSED) {  
            gridPage.switchesPagePressCount = 0;
         }
         else {
            gridPage.switchesPagePressCount = gridPage.switchesPagePressCount+1;
            if (gridPage.switchesPagePressCount>=2) {
               gridPage.switchesPagePressCount = 0;
               
               if (gridPage.LastDeletedScene < 7) {
                  gridPage.LastDeletedScene = gridPage.LastDeletedScene + 1;
               }
               else {
                  gridPage.LastDeletedScene = 0;
                  if (gridPage.LastDeletedTrack<7) {
                     gridPage.LastDeletedTrack = gridPage.LastDeletedTrack + 1; 
                  }
                  
               }
            }
            }
         var row = gridPage.LastDeletedScene;
         var col = gridPage.LastDeletedTrack;
         println("Launch/Record/Play row "+row+" col "+col);
        
         gridPage.onGridButton(row,col,isPressed );
      }
   }
}

switchesPage.onUser2 = function(isPressed)
{
       IS_MODE_PRESSED = isPressed;

}

switchesPage.onShift = function(isPressed)
{
   
}


switchesPage.onSceneButton = function(row, isPressed)
{
   if (isPressed) {
   println("switchesPage Scene Pressed row "+row)

  }
};

switchesPage.onScrollUp = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollLeft();
//    }
};

switchesPage.onScrollDown = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollRight();
//    }
};

switchesPage.onUp = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollUp();
//    }
};

switchesPage.onDown = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollDown();
//    }
};

switchesPage.scrollKey = function(offset)
{
   //switchesPage.rootKey = Math.max(0, Math.min(70, switchesPage.rootKey + offset));
};

switchesPage.buttonToMidiCC = function(x,y) 
{

   var subX = x & 3;
   var subY = y & 3;
   var page = (y < 4 ? 2 : 0) + (x >= 4 ? 1 : 0);
   var k = this.ccStart + (3 - subY) * 4 + subX + 16 * page;
  // println("buttonToMidiCC x="+x+" y="+y+ " -> "+k);
   return k;

}

switchesPage.onMomentaryGridButton = function(row,column,pressed,cc) 
{

    if (pressed)
    {  println("press CC#"+cc);

       //cursorTrack.startNote(key, velocity);
       //sendNoteStart(key,velocity);
       noteInput.sendRawMidiEvent(CC_MSG, cc, 64); 
       this.state[cc] = 127;

       switchesPage.drawKeys();
    }
    else
    { println("release CC #"+cc)
       //cursorTrack.stopNote(key, velocity);
       //sendNoteStop(key,velocity);
      noteInput.sendRawMidiEvent(CC_MSG, cc, 0);
      this.state[cc] = 0;
      switchesPage.drawKeys();
           
    }
}

switchesPage.onToggleGridButton = function(row,column,pressed,cc) 
{

    if (pressed)
    {  

       //cursorTrack.startNote(key, velocity);
       //sendNoteStart(key,velocity);
       var value = this.state[cc];
       if (value == 0 ) {
         value = 64;
       } 
       else if (value ==64) {
         value = 127;
       } 
       else {
        value = 0;
       }
       noteInput.sendRawMidiEvent(CC_MSG, cc, value); 
       this.state[cc] = value;
       println("set CC#"+cc+" = "+value);
       switchesPage.drawKeys();
    }
    else
        switchesPage.drawKeys();
  
    
}

// each time a key is pressed, we could get a mapped note or something else
switchesPage.onGridButton = function(row, column, pressed)
{
   
   
   var cc = switchesPage.buttonToMidiCC(column, row);

   if ((cc >= 0)&&(cc<=120))
   {
      
      println("switchesPage.onGridButton row "+row+"  column "+column+" pressed "+pressed+" CC "+cc );
      if (column<4) {
        switchesPage.onToggleGridButton(row,column,pressed,cc);  
        
      }
      else {
        switchesPage.onMomentaryGridButton(row,column,pressed,cc);  
      }
    
   
   
   }
   else
   {
      // not mapped as key
      println("not mapped to CC "+row+" "+column);
      
   
   }
   
};

switchesPage.drawCell = function(x, y, highlight)
{
   var cc = this.buttonToMidiCC(x, y);

   var colour = Colour.OFF;
    
   if (this.state[cc]>0)
   {
      colour = Colour.GREEN_FULL;
   }

   setCellLED(x, y, colour);
};
// Draws the keys
switchesPage.drawKeys = function()
{

   for(var y=0; y<8; y++)
   {
      for(var x=0; x<8; x++)
      {
         switchesPage.drawCell(x, y, false);
      }
   }
};

switchesPage.shouldKeyBeUsedForNoteInport = function(x,y)
{
   return true;
}
