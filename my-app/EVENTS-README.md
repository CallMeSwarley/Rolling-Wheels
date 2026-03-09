# Events Feature - Auto Image Loading

## How It Works

The events page now supports **automatic image loading** from folders, which works perfectly with static export!

### Setup

1. **Add images** to `/public/events/your-event-folder/`
2. **Update data.json** with your event
3. **Run build script** to generate the image manifest

### Usage Examples

#### Option 1: Auto-load from folder
```json
{
  "id": 1,
  "title": "Summer Festival 2023",
  "date": "2023-06-15",
  "summary": "Our annual summer festival...",
  "folder": "iswurscht23"
}
```
Put images in `/public/events/iswurscht23/` - they'll load automatically!

#### Option 2: Specify images manually
```json
{
  "id": 2,
  "title": "Workshop 2024",
  "date": "2024-03-20",
  "summary": "Workshop for beginners...",
  "images": ["/logo.png"]
}
```
Perfect for single flyers or specific images.

#### Option 3: Mix both
```json
{
  "id": 3,
  "title": "Championship",
  "date": "2024-09-10",
  "summary": "Annual championship...",
  "folder": "championship2024",
  "images": ["/fallback.png"]
}
```
If folder is empty, uses images array as fallback.

### How it works with Static Export

1. **Build-time script** (`scripts/generate-image-manifest.js`):
   - Scans `/public/events/*/` folders
   - Finds all image files (jpg, png, gif, webp, svg)
   - Generates `/public/image-manifest.json`

2. **ImageCarousel component**:
   - If `folder` is provided and `images` is empty → fetches from manifest
   - If `images` is provided → uses those directly
   - Works in both dev and production (static export)

3. **Events page**:
   - Single image → displays without carousel
   - Multiple images → shows carousel with navigation
   - Folder specified → auto-loads all images from that folder

### Running the script manually

```bash
node scripts/generate-image-manifest.js
```

This runs automatically before every build.

### Adding a new event with images

1. Create folder: `/public/events/my-event/`
2. Add images: `img1.jpg`, `img2.jpg`, etc.
3. Add to `data.json`:
```json
{
  "id": 4,
  "title": "My Event",
  "date": "2024-12-25",
  "summary": "Event description",
  "folder": "my-event"
}
```
4. Run `npm run build` or the script manually

Done! Images load automatically.
