
/*
 * PRESET BROWSER PAGE
 *
 *  A page that can be auto opened when we are browsing for a preset and which could close (go back to prior)
 * 
 * */

var browsePresetPage = new Page();

browsePresetPage.cursorBrowingSession = undefined;

browsePresetPage.title = "Browse Presets";
browsePresetPage.notify = browsePresetPage.title;
browsePresetPage.ccStart = 14;
browsePresetPage.state = [0];
for	(var index = 0; index < 128; index++)  {
     browsePresetPage.state[index] = 0;  // javascript, genius or shit. you decide.
 }


 browsePresetPage.canScrollUp    = function() { return false; };
 browsePresetPage.canScrollDown  = function() { return false; };
 browsePresetPage.canScrollLeft  = function() { return false; };
 browsePresetPage.canScrollRight = function() { return false; };

browsePresetPage.onActivePage = function()
{
   activeNoteMap = undefined;
   clearNoteTranslationTable();
   cursorDeviceBrowser.startBrowsing();
   
   // navigate among clips.
   //browsePresetPage.cursorBrowingSession = cursorDeviceBrowser.createCursorSession();


   println("XXX browsing preset page activated");

}
browsePresetPage.CursorLeft = function(isPressed)
{
 println("cursor left on browse preset page");

}


browsePresetPage.CursorRight = function(isPressed)
{
 println("cursor right on browse preset page");
 
}

browsePresetPage.updateOutputState = function()
{
   // println("uos");
   clear();
   setTopLED(5, WRITEOVR ? Colour.RED_FULL:Colour.YELLOW_FULL);
   setTopLED(7, gridPage.firstStep ? Colour.RED_FULL:Colour.GREEN_FULL);
   browsePresetPage.drawKeys();
};

browsePresetPage.onSession = function(isPressed)
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

browsePresetPage.onUser1 = function(isPressed)
{
   if (isPressed)
   {

      if (IS_SHIFT_PRESSED)
      {
        //
      }
      else
      {
         cursorDeviceBrowser.startBrowsing();
      }
   }
}

browsePresetPage.onUser2 = function(isPressed)
{
       IS_MODE_PRESSED = isPressed;

}

browsePresetPage.onShift = function(isPressed)
{
   
}


browsePresetPage.onSceneButton = function(row, isPressed)
{
   if (isPressed) {
   println("browsePresetPage Scene Pressed row "+row)

  }
};

browsePresetPage.onScrollUp = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollLeft();
//    }
};

browsePresetPage.onScrollDown = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollRight();
//    }
};

browsePresetPage.onUp = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollUp();
//    }
};

browsePresetPage.onDown = function(isPressed)
{
//    if (isPressed)
//    {
//       activeNoteMap.scrollDown();
//    }
};

browsePresetPage.scrollKey = function(offset)
{
   //browsePresetPage.rootKey = Math.max(0, Math.min(70, browsePresetPage.rootKey + offset));
};

browsePresetPage.buttonToMidiCC = function(x,y) 
{

   var subX = x & 3;
   var subY = y & 3;
   var page = (y < 4 ? 2 : 0) + (x >= 4 ? 1 : 0);
   var k = this.ccStart + (3 - subY) * 4 + subX + 16 * page;
  // println("buttonToMidiCC x="+x+" y="+y+ " -> "+k);
   return k;

}

browsePresetPage.onMomentaryGridButton = function(row,column,pressed,cc) 
{

    if (pressed)
    {  
    }
    else
    { 
           
    }
}

browsePresetPage.onToggleGridButton = function(row,column,pressed,cc) 
{

    if (pressed)
    {  
         // DO action.

 
       browsePresetPage.drawKeys();
    }
    else
        browsePresetPage.drawKeys();
  
    
}

// each time a key is pressed, we could get a mapped note or something else
browsePresetPage.onGridButton = function(row, column, pressed)
{
   if (pressed) {
   if (row == 0 ) {
      if (column == 0) {
          // home/reset script, back to grid page, clear any state. mixer view
          //cursorDeviceBrowser.selectPreviousFile();
          //browsePresetPage.cursorBrowingSession.selectPrevious(); // navigates among active clip launcher clips on device.

            browser.selectPreviousFile();
         

        // cursorDeviceBrowser.smartCollectionColumn().createCursorItem(). isSelected().set(true);

      } else if (column == 1) {
        // cursorDeviceBrowser.selectNextFile();
        //browsePresetPage.cursorBrowingSession.selectNext();  // navigate among clips
        browser.selectNextFile();
         

         //cursorDeviceBrowser.smartCollectionColumn().createCursorItem(). isSelected().set(true);
      } else if (column == 2) {
       

      } else if (column == 3) {
       
      } else if (column == 4) {
       
      } else if (column == 5) {
         // f
      } else if (column == 6) {
         // f
      } else if (column == 7) {
         // f
      } 
   } 
   }
  
   
};

browsePresetPage.drawCell = function(x, y, highlight)
{
   //var cc = this.buttonToMidiCC(x, y);

   var colour = Colour.OFF;

   if ((y%2)==0) {
      colour = Colour.GREEN_LOW;
   } else  {
      colour = Colour.GREEN_FULL;
   }
    
   // if (this.state[cc]==127)
   // {
   //    colour = Colour.GREEN_FULL;
   // } else if (this.state[cc]>60)
   // {
   //    colour = Colour.GREEN_LOW;
   // }

   setCellLED(x, y, colour);
};
// Draws the keys
browsePresetPage.drawKeys = function()
{

   for(var y=0; y<8; y++)
   {
      for(var x=0; x<8; x++)
      {
         browsePresetPage.drawCell(x, y, false);
      }
   }
};

// always return false so no Midi Note Ons are emitted
browsePresetPage.shouldKeyBeUsedForNoteInport = function(x,y)
{
   return false;
}
