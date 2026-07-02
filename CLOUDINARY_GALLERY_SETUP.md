# Cloudinary Gallery Setup

The gallery is prepared to load media automatically from Cloudinary after deployment.

## Cloudinary account

- Cloud name: `demcs8ho`
- Gallery folder: `gallery`

Every image or video that should appear in the site gallery should be uploaded to the Cloudinary folder:

```text
gallery
```

To make filtering work, add one category tag as well. If no category tag is added, the item will still appear under "הכל".

```text
mevashlim
etgar
field
process
schools
```

Examples:

- A cooking workshop image in folder `gallery` with tag `mevashlim`
- A field workshop video in folder `gallery` with tag `field`
- A school team image in folder `gallery` with tag `schools`

Optional Cloudinary context fields:

```text
title
alt
description
```

If those fields are missing, the site will use the Cloudinary public ID as the title and alt text.

## Hosting environment variables

Set these in Vercel or Netlify:

```text
CLOUDINARY_CLOUD_NAME=demcs8ho
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_GALLERY_FOLDER=gallery
```

Do not put `CLOUDINARY_API_SECRET` in browser JavaScript.

## How it works

- The site first tries to load `api/gallery-feed`.
- On Netlify, it also supports `/.netlify/functions/gallery-feed`.
- If the API is not available, the gallery falls back to `galleryItems.js`.

This keeps the local static site working while allowing automatic Cloudinary loading from the `gallery` folder after deployment.
