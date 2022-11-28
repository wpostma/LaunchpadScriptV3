
/*
 * KEYS PAGE
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
 * */

var keysPage = new Page();

keysPage.title = "Keys / Drums";
keysPage.notify = keysPage.title;
keysPage.velocity = 90;


keysPage.CursorLeft = function(isPressed)
{
 println("cursor left on keys");

}


keysPage.CursorRight = function(isPressed)
{
 println("cursor right on keys");
 
}

keysPage.updateOutputState = function()
{
   clear();
   this.canScrollUp = activeNoteMap.canScrollUp();
   this.canScrollDown = activeNoteMap.canScrollDown();
   this.canScrollLeft = activeNoteMap.canScrollLeft();
   this.canScrollRight = activeNoteMap.canScrollRight();
   this.updateScrollButtons();
   setTopLED(5, WRITEOVR ? Colour.RED_FULL:Colour.YELLOW_FULL);

   //for(var i=0; i<4; i++)
   //{
       //var isCurrent = noteMaps[i] == activeNoteMap;
       //var hasMap = noteMaps[i] != null;
	   // sets the LED of the current notemap (top 4 side buttons)
      // setRightLED(i, hasMap ? (isCurrent ? Colour.GREEN_FULL : Colour.GREEN_LOW) : Colour.OFF);
	   
      // sets the velocity button color (bottom 4 side buttons)
      // setRightLED(4 + i, seqPage.velocityStep == i ? Colour.AMBER_LOW : Colour.AMBER_LOW);
   //}
   setTopLED(7, gridPage.firstStep ? Colour.RED_FULL:Colour.GREEN_FULL);
   this.drawKeys();
};

keysPage.onSession = function(isPressed)
{
}

keysPage.onUser1 = function(isPressed)
{
   if (isPressed)
   {
      if (IS_SHIFT_PRESSED)
      {
        transport.toggleClick();
      }
      else
      {
        transport.toggleLauncherOverdub();  
      }
   }
}

keysPage.onUser2 = function(isPressed)
{
}

keysPage.onShift = function(isPressed)
{
   
}
keysPage.setVelocity = function(step)
{
   if(step === 0)
   {
       keysPage.velocity = 10;
   }
   else if (step === 1)
   {
      keysPage.velocity = 45;
   }
   else if (step === 2)
   {
      keysPage.velocity = 90;
   }
   else if (step === 3)
   {
      keysPage.velocity = 127;
   }
   println("vel "+keysPage.velocity);
   // else if (step === 4)
   // {
   //    keysPage.velocity = 90;
   // }
   // else if (step === 5)
   // {
   //    keysPage.velocity = 100;
   // }
   // else if (step === 6)
   // {
   //    keysPage.velocity = 110;
   // }
   // else if (step === 7)
   // {
   //    keysPage.velocity = 127;
   // }
   
   
   
   
}

keysPage.onSceneButton = function(row, isPressed)
{
   if (isPressed) {
   println("keysPage Scene Pressed row "+row)
   if (row >= 4 )
   {
      println("keyvel "+(row-4))
      keysPage.setVelocity(row - 4);
   }
 
   if (noteMaps[row] != null && row != 4)
   {

      if (IS_SHIFT_PRESSED && row == 2)
      {
         row = 4;
      }
      if (IS_SHIFT_PRESSED && row == 3)
      {
         row = 5;
      }
      activeNoteMap = noteMaps[row];
      host.showPopupNotification("Scale: " + activeNoteMap.getName());
      updateNoteTranlationTable(activeNoteMap);
   }
  }
};

keysPage.onLeft = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollLeft();
   }
};

keysPage.onRight = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollRight();
   }
};

keysPage.onUp = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollUp();
   }
};

keysPage.onDown = function(isPressed)
{
   if (isPressed)
   {
      activeNoteMap.scrollDown();
   }
};

keysPage.scrollKey = function(offset)
{
   keysPage.rootKey = Math.max(0, Math.min(70, keysPage.rootKey + offset));
};

// each time a key is pressed, we could get a mapped note or something else
keysPage.onGridButton = function(row, column, pressed)
{
   
   
   var key = activeNoteMap.cellToKey(column, row);

   if (key >= 0)
   {
      
      println("keysPage.onGridButton row "+row+"  column "+column+" pressed "+pressed+" key "+key+" vel"+keysPage.velocity);
   
   
   
      if (pressed)
      {  println("start note #"+key);

         //cursorTrack.startNote(key, velocity);
         //sendNoteStart(key,velocity);
         noteInput.sendRawMidiEvent(NOTE_ON, key, keysPage.velocity); 
		
      }
      else
      { println("stop note #"+key)
         //cursorTrack.stopNote(key, velocity);
         //sendNoteStop(key,velocity);
        noteInput.sendRawMidiEvent(NOTE_OFF, key, 0);
			
      }
   }
   else
   {
      // not mapped as key
      println("keysPage.onGridButton row "+row+"  column "+column+" pressed "+pressed+" unlit key");
   
   
   }
   
};

// Draws the keys
keysPage.drawKeys = function()
{
   for(var y=0; y<8; y++)
   {
      for(var x=0; x<8; x++)
      {
         activeNoteMap.drawCell(x, y, false);
      }
   }
};

keysPage.shouldKeyBeUsedForNoteInport = function(x,y)
{
   return true;
}
