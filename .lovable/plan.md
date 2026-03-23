

## Swipe + Buttons for Game Cards

### What changes (single file: `GameScreen.tsx`)

**Swipe gestures (left/right only):**
- Add `drag="x"` to the card `motion.div` with elastic constraints
- Swipe right (offset > 100px) = "Fait" (done)
- Swipe left (offset < -100px) = "Refuse"
- No swipe up — Pass is button-only

**Visual feedback during drag:**
- Card rotates slightly based on drag X position (`rotate: dragX / 20`)
- Green overlay + "Fait ✅" text fades in when dragging right
- Red overlay + "Refuse ❌" text fades in when dragging left
- Card flies off-screen on release (exit animation matches swipe direction)

**Button animations:**
- Keep all 3 buttons (Fait, Refuse, Pass)
- When a button is clicked, animate the card out with the same fly-off effect as swipe:
  - "Fait" → card flies right with green tint
  - "Refuse" → card flies left with red tint
  - "Pass" → card fades up slightly
- Track `exitX` state to control exit animation direction

**Swipe hint:**
- Show "← Swipe pour jouer →" text under the card on the first card only, fading out after 2 seconds

### Implementation approach
- Use `useMotionValue` and `useTransform` from framer-motion for real-time drag tracking
- Store `exitDirection` state (`"left" | "right" | "up"`) to drive exit animation
- Use `onDragEnd` with velocity/offset threshold detection
- Delay `nextCard()` call by ~200ms to let exit animation play

