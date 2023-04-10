
/*
 * PRESET BROWSER PAGE
 *
 *  A page that can be auto opened when we are browsing for a preset and which could close (go back to prior)
 * 
 * globals
 *     NAME               Type                    Capability
 *     browser            PopupBrowser            navigation, get 
 * */

var browsePresetPage = new Page();

browsePresetPage.cursorBrowingSession = undefined;


browsePresetPage.title = "Browse Presets";
browsePresetPage.notify = browsePresetPage.title;
browsePresetPage.ccStart = 14;
browsePresetPage.state = [0];
browsePresetPage.HasSelection = false;

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
   browsePresetPage.SelectSmartCategory(0);

   browsePresetPage.SelectCategory(0);
   
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

// marked as play/stop on my system.
browsePresetPage.onUser1 = function(isPressed)
{
   if (isPressed)
   {

      if (IS_SHIFT_PRESSED)
      {
        //
      }
      else
      { if (browsePresetPage.HasSelection) {
         browser.commit();
         browsePresetPage.HasSelection = false;
         println("Changed")
        } else {
         cursorDeviceBrowser.startBrowsing();
        }

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

browsePresetPage.SelectSmartCategory = function(i) {
   if (trace>0) {
      println("select smart category# "+i)
   }
   var browserItem = sccBank.getItem(i);
   browserItem.isSelected().set(true); // select a smart category

}

browsePresetPage.SelectCategory = function(i) {
   if (trace>0) {
      println("select smart category# "+i)
   }
   var browserItem = catBank.getItem(i);
   browserItem.isSelected().set(true); // select a  category

}

browsePresetPage.SelectTag = function(i) {
   if (trace>0) {
      println("select tag# "+i)
   }
   var browserItem = tagBank.getItem(i);
   browserItem.isSelected().set(true); // select a  category

}

browsePresetPage.SelectResult = function(i) {
   if (trace>0) {
      println("select tag# "+i)
   }
   var browserItem = cursorResultBank.getItem(i);
   browserItem.isSelected().set(true); // select a result item.

   showPopupNotification( "Select "+browserItem.name().get() );
   
   browsePresetPage.HasSelection = true;
   browsePresetPage.LastSelectedName = browserItem.name().get() ;

   // browser.selectFirstFile();
   // for (var n=0; n< (i-1);n++) {
   //    browser.selectNextFile();
   // }
   


}

 

// each time a key is pressed, we could get a mapped note or something else
browsePresetPage.onGridButton = function(row, column, pressed)
{
   if (pressed) {
   if (column < 2) 
   { 
      var i = row+(column*8);
      if (i<0) {
         i = 0;
      } else if (i>15) 
      {
         i = 15;
      }
      browsePresetPage.SelectSmartCategory(i);
     

   }
   else if ((column >= 2)&&(column < 4))
   {
      var i = row+(column-2)*8;
      if (i<0) {
         i = 0;
      } else if (i>15) 
      {
         i = 15;
      }
      browsePresetPage.SelectCategory(i);
   }
   else if ((column >= 4)&&(column <6))
   {
      // TAG or AUTHOR or something else here.
      
      var i = row+(column-4)*8;
      if (i<0) {
         i = 0;
      } else if (i>15) 
      {
         i = 15;
      }
      browsePresetPage.SelectTag(i);
      
   }
   else 
   { // col 7,8
 // TAG or AUTHOR or something else here.
      
      var i = row+(column-6)*8;
      if (i<0) {
         i = 0;
      } else if (i>15) 
      {
         i = 15;
      }
      browsePresetPage.SelectResult(i);
   }
   /*
   else
   if (row == 7 ) {
      if (column == 0) {
          // home/reset script, back to grid page, clear any state. mixer view
          //cursorDeviceBrowser.selectPreviousFile();
          //browsePresetPage.cursorBrowingSession.selectPrevious(); // navigates among active clip launcher clips on device.
 
            // browser = PopupBrowser type in Docs.

            //browser.selectPreviousFile();
         
            //sccBank is BrowserFilterItemBank 	
            //sccBank = browser.smartCollectionColumn().createItemBank(16);
            
            BrowserFilterItemBank 	
            


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
   
  */
   }
};

browsePresetPage.drawCell = function(x, y, highlight)
{
   //var cc = this.buttonToMidiCC(x, y);

   var colour = Colour.OFF;

   if ((x%2)==0) {
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
