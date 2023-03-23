// This script defines the pages. It is called everytime a new page is created at the start of most of the script files.

function Page()
{
   this.canScrollLeft = false;
   this.canScrollRight = false;
   this.canScrollUp = false;
   this.canScrollDown = false;
   this.pollingRate  = 200;
   this.title = "page";
   this.notification = "page";

}

Page.prototype.onScrollUp = function()
{  println("<this page can not scroll up>");
};

Page.prototype.onScrollDown = function()
{  println("<this page can not scroll up>");
};


Page.prototype.modeUp = function()
{  println("MODE+UP: No operation");
};

Page.prototype.updateOutputState = function()
{
};

Page.prototype.polledFunction = function()
{
  // println("page polling");

};

// defines the colours of the arrow buttons at the top of the pages
Page.prototype.updateScrollButtons = function()
{
   setTopLED(0, this.canScrollUp ? Colour.GREEN_FULL : Colour.GREEN_LOW);
   setTopLED(1, this.canScrollDown ? Colour.GREEN_FULL : Colour.GREEN_LOW);
   setTopLED(2, this.canScrollLeft ? Colour.GREEN_FULL : Colour.GREEN_LOW);
   setTopLED(3, this.canScrollRight ? Colour.GREEN_FULL : Colour.GREEN_LOW);
};

Page.prototype.shouldKeyBeUsedForNoteInport = function(x,y)
{
   return false;
}
