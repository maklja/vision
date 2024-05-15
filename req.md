1. Every event has it own id that is unique and preserved until reaches the subscriber element
2. Every event should have spacing if they are fired at the same time and they are present on the same connect line
   otherwise you should just fire the event.
3. Subscribe events should be fired immediately and any value events shouldn't be emitted until specific branch is subscribed.

// 1. subscribe (merge, interval) 1 connect line
// 2. event (interval, subscriber) 1 connect line
// 3. event (merge, subscriber) 2 connect lines

// 1. subscribe (concat, interval) 1 connect line


// queued animations
// in progress animations
// waiting animations
