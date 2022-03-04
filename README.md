Launchpad Script V3 for Live Looping
==============


Warren's Launchpad V3 Script 2022-03-03 

1. Always starts up in a clip launcher + midi key playing split mode. Top half is 4 rows, each ROW is one scene. Each of the 8 columns of the grid is one instrument. This is meant to correspond to the view where bitwig is showing instruments in columns, scenes as rows.  The scene launch buttons, the first four of them actually launch... scenes.  Weird eh?

2. More features and modes coming soon, but the script this was based on heavily removed stuff until there was not much left but the main page.  There's no intent to make this a full function Launchpad script, but rather a quirky clip recording and playback jamming tool only.

3. A pdf might get made at some point and a youtube video showing this when it's further along.

4. The up arrow key is a PLAY/STOP CONTROL.

5.  The down arrow key is a mode/view command.  For now the main thing it does is change which bank of midi notes the bottom half of the pad sends.

6. The bottom half of the 8x8 grid is midi note sends.

7. The last row (row 8) will indicate which loop quantize mode is active and the scene button toggles this value (causing the lit pad to move over).  This last row is still used for midi note triggering.  I do plan to add pitch/scale quantization mapping to this but for now it's just semitones, but the lowest bank is set to the same midi note that most clip launcher and drum devices in bitwig expect.  It's not meant to be used to play melodically.



based on https://github.com/dplduffy/LaunchpadScriptV3
