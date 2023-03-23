Launchpad Script V3 for Live Looping
==============


Warren's Launchpad V3 Script 2022-03-18


1. Always starts up in a clip launcher + midi key playing split mode. Top half is 4 rows, each ROW is one scene. Each of the 8 columns of the grid is one instrument. This is meant to correspond to the view where bitwig is showing instruments in columns, scenes as rows.  The scene launch buttons, the first four of them actually launch... scenes.  Weird eh?  That's a lot like the way this worked in Live.

2. There's no intent to make this a full function Launchpad script as DrivenByMOss, but rather to be a quirky alternative, focused around clip recording and playback as a keys and guitar jamming tool.

3. A pdf might get made at some point and a youtube video showing this when it's further along.

4. Top Row Button Functions (may differ by mode, items below are how it works in grid mode)
    UP - Play/Stop.  +SHIFT= Musical Stop.  +META=
       Hit to play and when playing hit again to stop. Hit shift key to do a fade out and stop.
    DOWN - Select SubMode 0,1,2

       Press while in grid mode to shift the bottom half through different octaves of keys. The highest set of keys also has midi CCs.
    LEFT - Previous track. +SHIFT= TrackBank Shift Up     +META = Previous Mode. 
    RIGHT - Next track.    +SHIFT=  TrackBank Shift Down  +META = Next mode. 

    SESSION - META key. Works as a second shift key, for key combinations.
    USER1 - GO INTO SPLIT MODE. BOTTOM HALF IS PLAYABLE MIDI NOTES.  TOP HALF OF GRID remains launching.
    USER2 - not yet defined.
    MIXER - Acts as a shift key with many other buttons including UP,DOWN,LEFT,RIGHT, and many of the side buttons.

5. Side buttons ( grid mode)
    First four are SCENE launch buttons.
    Next four are:

    STOP - Next Preset Page.  +SHIFT = Preset Page.
    TRKON - Next Device.  +SHIFT = PRevious Device.
    SOLO - Keyboard velocity. Since the MK1 launchpad is not velocity sensitive, this lets you toggle among some fixed velocities.
    ARM - Loop quantize

6. Bottom four rows of clip/note pads.
   The bottom half of the 8x8 grid is midi note sends.  Which note it sends changes when you press MODE/VIEW (DOWN).
   The last row (row 8) will indicate which loop quantize mode is active and the scene button toggles this value (causing the lit pad to move over).  This last row is still used for midi note triggering.  I do plan to add pitch/scale quantization mapping to this but for now it's just semitones, but the lowest bank is set to the same midi note that most clip launcher and drum devices in bitwig expect.  It's not meant to be used to play melodically.

Derivation:

based on https://github.com/TVbene/LaunchpadScriptV3
which was based on https://github.com/dplduffy/LaunchpadScriptV3

Also includes stuff borrowed from here:
  https://github.com/wpostma/bitwig_scripts/blob/master/Controller%20Scripts/yamaha_mx49_mx61/Yamaha-MX49-MX61.control.js
