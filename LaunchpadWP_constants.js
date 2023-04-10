var NOTE_ON = 144; // + channel.
var NOTE_OFF = 128;
var CC_MSG =  176; // + midi channel.
var LED_COUNT = 90;

// CCs for the Top buttons
var TopButton =
{
   CURSOR_UP:104,
   CURSOR_DOWN:105,
   CURSOR_LEFT:106,
   CURSOR_RIGHT:107,
   SESSION:108,
   USER1:109,
   USER2:110,
   MIXER:111
};

// CCs for the Mixer Buttons
var MixerButton =
{
   VOLUME:0,
   PAN:1,
   SEND_A:2,
   SEND_B:3,
   STOP:4,
   TRK_ON:5,
   SOLO:6,
   ARM:7
};

// Called the scripts mainly within launchpad_grid
// It is used for the Bitwig logo and the VUmeter
function mixColour(red, green, blink)
{
   return (blink ? 8 : 12) | red | (green * 16);
}

// Defines the values to be sent for the colours
var Colour = // Novation are from the UK which is nice for us Canadians.
{
   OFF:12,
   RED_LOW:13,
   RED_FULL:15,
   AMBER_LOW:29,
   AMBER_FULL:63,
   YELLOW_FULL:62,
   YELLOW_LOW: 0x2D,
   ORANGE:39,
   LIME:0x3D,
  // HEADER:mixColour(0,1,false),
   GREEN_LOW:28,
   GREEN_FULL:60,
   RED_FLASHING:11,
   AMBER_FLASHING:59,
   YELLOW_FLASHING:58,
   GREEN_FLASHING:56
};

// MK1 launchpad doesn't support these colors:
const RGB_COLORS =
[
    [ 0.3294117748737335 , 0.3294117748737335 , 0.3294117748737335 , "Dark Gray"],
    [ 0.47843137383461   , 0.47843137383461   , 0.47843137383461   , "Gray"],
    [ 0.7882353067398071 , 0.7882353067398071 , 0.7882353067398071 , "Light Gray"],
    [ 0.5254902243614197 , 0.5372549295425415 , 0.6745098233222961 , "Silver"],
    [ 0.6392157077789307 , 0.4745098054409027 , 0.26274511218070984, "Dark Brown"],
    [ 0.7764706015586853 , 0.6235294342041016 , 0.43921568989753723, "Brown"],
    [ 0.34117648005485535, 0.3803921639919281 , 0.7764706015586853 , "Dark Blue"],
    [ 0.5176470875740051 , 0.5411764979362488 , 0.8784313797950745 , "Purplish Blue"],
    [ 0.5843137502670288 , 0.2862745225429535 , 0.7960784435272217 , "Purple"],
    [ 0.8509804010391235 , 0.21960784494876862, 0.4431372582912445 , "Pink"],
    [ 0.8509804010391235 , 0.18039216101169586, 0.1411764770746231 , "Red"],
    [ 1                  , 0.34117648005485535, 0.0235294122248888 , "Orange"],
    [ 0.8509804010391235 , 0.615686297416687  , 0.062745101749897  , "Light Orange"],
    [ 0.45098039507865906, 0.5960784554481506 , 0.0784313753247261 , "Green"],
    [ 0                  , 0.615686297416687  , 0.27843138575553894, "Cold Green"],
    [ 0                  , 0.6509804129600525 , 0.5803921818733215 , "Bluish Green"],
    [ 0                  , 0.6000000238418579 , 0.8509804010391235 , "Blue"],
    [ 0.7372549176216125 , 0.4627451002597809 , 0.9411764740943909 , "Light Purple"],
    [ 0.8823529481887817 , 0.4000000059604645 , 0.5686274766921997 , "Light Pink"],
    [ 0.9254902005195618 , 0.3803921639919281 , 0.34117648005485535, "Skin"],
    [ 1                  , 0.5137255191802979 , 0.24313725531101227, "Redish Brown"],
    [ 0.8941176533699036 , 0.7176470756530762 , 0.30588236451148987, "Light Brown"],
    [ 0.6274510025978088 , 0.7529411911964417 , 0.2980392277240753 , "Light Green"],
    [ 0.24313725531101227, 0.7333333492279053 , 0.3843137323856354 , "Grass Green"],
    [ 0.26274511218070984, 0.8235294222831726 , 0.7254902124404907 , "Light Blue"],
    [ 0.2666666805744171 , 0.7843137383460999 , 1                  , "Greenish Blue"],
];

// defines the LED locations with the pending and active LED arrays for the lights
// They are used in the format LED.SCENE
var LED =
{
   GRID:0,
   SCENE:64,
   TOP:72,

   CURSOR_UP:0,
   CURSOR_DOWN:1,
   CURSOR_LEFT:2,
   CURSOR_RIGHT:3,
   SESSION:4,
   USER1:5,
   USER2:6,
   MIXER:7,

   VOLUME:0,
   PAN:1,
   SEND_A:2,
   SEND_B:3,
   STOP:4,
   TRK_ON:5,
   SOLO:6,
   ARM:7
};

// Number of tracks, sends and scenes, they are called from the Launchpad.control.js file only during the init() function
var NUM_TRACKS = 40;
var NUM_SENDS = 2;
var NUM_SCENES = 8;
var NUM_EFFECT_TRACKS = 1;
var NUM_EFFECT_SCENES = 1;

//new controller variables
var mixerButtonToggle = false;
var mixerDetailMode = false;
var armedToggle = false;
var sessionButtonToggle = false;
var seqPageDrumMode = false;
var seqPageNoteMode = false;
var sendNumber = 0;
var setPan = 0;
var undo1 = false;

function ViewShiftColour(index) {
   switch (index) {
      case 0:
         return Colour.YELLOW_LOW;
      case 1:
         return Colour.GREEN_LOW;
      case 2:
         return Colour.RED_LOW;
      case 3:
         return Colour.GREEN_FULL;
      case 4:
         return Colour.RED_FULL;
      default:
         return Colour.OFF;

   }
}
    


