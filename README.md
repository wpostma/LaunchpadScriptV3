Launchpad Script V3 for Live Looping
==============


Warren's Launchpad V3 Script 2023-04-10

1. Always starts up in a clip launcher mode.  Uses the horizontal rows as scenes so that the scene launch buttons make sense to launch all clips in one scene (all clips in that row).  This works best visually when bitwig is in Mix layout rather than in arranger. but it would be possible to have the script follow the program layout.

2. Optional split mode where top half is launcher of 4 rows, each ROW is one scene. Each of the 8 columns of the grid is one instrument. This is meant to correspond to the view where bitwig is showing instruments in columns, scenes as rows.  The scene launch buttons, the first four of them actually launch... scenes.  Weird eh?  That's a lot like the way this worked in Live.

3. There's no intent to make this a full function Launchpad script as powerful as the driven DrivenByMoss script, but rather to be a quirky alternative, focused around clip recording and playback as a keys and guitar jamming tool.  It seems to be my style to prefer a lot of different SHIFT/ALT/META/OPTION combination key presses which means that
one button can have multiple alternate functions.  I use label-maker printed labels on my unit to help me remember the three (or more) functions that one button could have.
 A pdf might get made at some point and a youtube video showing this when it's further along.

4. Top Row Button Functions in Grid Mode
   (other modes different, but META+LEFT/RIGHT is always to navigate the major pages that exist in the script)
   
    UP - Scene Bank Up  
    DOWN - Scene Bank Down.
       Press while in grid mode to shift the bottom half through different octaves of keys. The highest set of keys also has midi CCs.
    LEFT - Previous track. +SHIFT=  TrackBank Shift Up     +META = Previous Mode. 
    RIGHT - Next track.    +SHIFT=  TrackBank Shift Down   +META = Next mode. 

    SESSION - META/DEL key. Used in combination as a deletion or alternate function combination.
    USER1 - PLAY/STOP.  +SHIFT = gradual fade out and stop (musical stop) +META = SPLIT keys + launcher
    USER2 - MODE key (a shift-like key used in combination)
    MIXER - SHIFT key used in combinations.
    
5. Side buttons ( grid mode)
    First four are SCENE launch buttons.
    Next four are:

    STOP - Next Preset Page.  +SHIFT = Preset Page.
    TRKON - Next Device.  +SHIFT = PRevious Device.
    SOLO - Keyboard velocity. Since the MK1 launchpad is not velocity sensitive, this lets you toggle among some fixed velocities.
    ARM - Loop quantize

6. The modes:

    1  GRID MODE - for clip recording and launching and launching scenes.

    2  KEYS MODE - piano key, chromatic and various other key layouts.

    3  STEP SEQUENCER - lets you turn notes on and off inside the focused clip. Ideal for clips which are 1 or 2 bars in length.
    
    4  MIXER MODE - set level faders etc
    
    5  SWITCHES - (midi CC on/off)


Derivation:

based on https://github.com/TVbene/LaunchpadScriptV3
which was based on https://github.com/dplduffy/LaunchpadScriptV3

Also includes stuff borrowed from here:
  https://github.com/wpostma/bitwig_scripts/blob/master/Controller%20Scripts/yamaha_mx49_mx61/Yamaha-MX49-MX61.control.js
