# Image Lightbox Features

## Overview

Clicking any photo opens a fullscreen lightbox with advanced zoom and pan capabilities.

## ✨ Features

### 🖱️ Mouse Controls
- **Click image** - Open lightbox
- **Click outside** - Close lightbox
- **Scroll wheel** - Zoom in/out
- **Click & drag** - Pan when zoomed (only works when zoom > 100%)
- **Left/Right arrows** - Navigate between photos

### ⌨️ Keyboard Shortcuts
- `ESC` - Close lightbox
- `←` / `→` - Navigate to previous/next photo
- `+` / `=` - Zoom in
- `-` / `_` - Zoom out
- `0` - Reset zoom and pan to default

### 📱 Touch Controls
- **Tap image** - Open lightbox
- **Tap outside** - Close lightbox
- **Touch & drag** - Pan when zoomed
- **Pinch** - Zoom in/out (native browser behavior)

### 🎨 UI Elements

1. **Top Left** - Photo filename and counter (e.g., "1 / 12")
2. **Top Right** - Close button (X)
3. **Bottom Center** - Zoom controls
   - Zoom out button (-)
   - Current zoom percentage
   - Zoom in button (+)
   - Reset button (↻)
4. **Bottom Right** - Keyboard hints (desktop only)
5. **Left/Right** - Navigation arrows (when multiple photos)

## 🔍 Zoom Behavior

- **Range**: 50% - 500%
- **Increment**: 50% per step
- **Default**: 100% (fit to screen)
- **Auto-reset**: Pan resets when zooming back to 100%

## 🖼️ Image Display

- Images are centered and fit to screen by default
- Maintains aspect ratio
- Smooth transitions between zoom levels
- High-quality rendering at all zoom levels

## 🎯 Pan Behavior

- **Enabled**: Only when zoomed > 100%
- **Cursor**: Changes to grab/grabbing cursor
- **Smooth**: Real-time dragging with no lag
- **Touch-friendly**: Works on mobile devices

## 🔄 Navigation

- Navigate through all photos in the gallery
- Photos maintain their sort order (newest first)
- Previous/next buttons only show when available
- Keyboard arrows work at any zoom level

## 💡 Tips

1. **Quick zoom**: Use scroll wheel for fast zooming
2. **Reset quickly**: Press `0` to reset zoom and pan
3. **Navigate fast**: Hold arrow keys to browse quickly
4. **Focus on detail**: Zoom to 300%+ and pan to inspect details
5. **Mobile**: Use pinch gestures for natural zooming

## 🚀 Performance

- Lazy loading: Images load on demand
- Smooth animations: 60fps transitions
- Memory efficient: Only loads current image
- No lag: Real-time pan and zoom

## 🎨 Design

- **Background**: Black with 95% opacity
- **Controls**: Semi-transparent with backdrop blur
- **Animations**: Smooth, subtle transitions
- **Accessibility**: Full keyboard navigation support
- **Responsive**: Works on all screen sizes

## 🛠️ Technical Details

**Component**: `/app/components/ImageLightbox.vue`

- Built with Vue 3 Composition API
- Uses CSS transforms for smooth performance
- Teleports to body for proper z-index layering
- Prevents body scrolling when open
- Cleans up event listeners on unmount

## 📦 Features Included

✅ Fullscreen overlay  
✅ Zoom in/out (50% - 500%)  
✅ Pan/drag when zoomed  
✅ Mouse wheel zoom  
✅ Touch gestures  
✅ Keyboard navigation  
✅ Photo counter  
✅ File info display  
✅ Previous/next navigation  
✅ Close on outside click  
✅ Smooth animations  
✅ Mobile responsive  
✅ Accessibility support  

## 🎬 User Experience

The lightbox provides a professional gallery experience similar to:
- Lightroom Web
- Google Photos
- Adobe Portfolio
- Behance
- 500px

Perfect for showcasing photography in high detail! 📸
