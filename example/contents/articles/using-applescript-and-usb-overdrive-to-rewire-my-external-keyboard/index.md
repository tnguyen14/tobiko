---
title: Using AppleScript and USB Overdrive to rewire my external keyboard
author: tri-nguyen
date: 2013-04-16
template: article.hbs
---

So I've recently made an investment in the [Kinesis Freestyle 2 for Mac](http://www.kinesis-ergo.com/freestyle2_mac.htm) - an amazing keyboard that is supposed to be ergonomic and very friendly for your hands to type.

After playing it for a while, I really like it except for one thing - when I press the `prev`, `play/pause` and `next` buttons, it will always bring up iTunes even if Spotify is open. This is very annoying as I've said goodbye to iTunes long time ago and have migrated over to Spotify. It is also different from the default behavior of the Mac's native keyboard. If I press these buttons on the default keyboard while Spotify is open, it will just play Spotify. Same goes for QuickTime Player.

This annoys me enough that I spent the past 2 hours looking into a solution. I've found one that is sort of a workaround that works well for me for now, so I thought I should leave it here. <span class="more"></span>

First, I use [USB Overdrive](http://www.usboverdrive.com/) to manage the behavior of external mice and keyboards. It is just an incredible piece of software in terms of the amount of control it gives you.

It is almost perfect for what I need to do, except that for Media keys, it only allows mapping to iTunes commands.

To gives Spotify any sort of priority, I have to use the *'Execute AppleScript'* feature. Even for someone who's relatively good at programming, this was scary to me at first. The thought of programmatically alter my Mac was a scary thought, and a downhill move I thought. That is until I learned how friendly AppleScript is. Here's a little code I wrote to get the `play/pause` button do what I want:

```bash
# prioritize Spotify first
if application "Spotify" is running then
	tell application "Spotify" to playpause

# if Spotify isn't open, QuickTime Player is second on the list
else if application "QuickTime Player" is running then
	tell application "QuickTime Player"
		tell document 1 to if exists then
			if playing then
				pause
			else
				play
			end if
		end if
	end tell

# only play iTunes when nothing else is open
else if application "iTunes" is running then
	tell application "iTunes" to playpause

# if no media app is open, start Spotify and play some tunes!
else
	tell application "Spotify"
		activate
		delay 2 -- I added this in because having play right after activate doesn't quite work. It turns out the delay gives it a nice fade in effect
		play
	end tell
end if
```

This is an opinionated solution to what to do. It is also limited to currently 3 apps right now, so it's probably not as versatile as the built-in keys. However, for now, these are the 3 apps I use the most. If you use "VLC", then just replace "QuickTime Player" with that, or put it before QuickTime.

Here are another example of what I did with my `previous` button. The `next` button is pretty much the same.

```bash
if application "Spotify" is running then
	tell application "Spotify" to previous track

else if application "QuickTime Player" is running then
	tell application "QuickTime Player"
		tell document 1 to if exists then
			step backward
		end if
	end tell
else if application "iTunes" is running then
	tell application "iTunes" to previous track
end if
```

I hope this is helpful to someone out there who's looking to get more power of their keyboard and mouse mappings. As you can see, there is a limitless number of things you can do with this.

One more note, to start writing AppleScript, a good place to start is open the 'AppleScript Editor' on your Mac. Once you're there, you can open the Application Dictionary through the shortcut `cmd + shift + O` or "File -> Open Dictionary". Have fun!