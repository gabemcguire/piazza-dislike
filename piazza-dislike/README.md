# Dislikes For Piazza™

**Version**: 0.0.0.1

**Description**: Adds a dislike button feature to Piazza - a class forum, allowing users to mark answers and comments as "not helpful" or "not useful" for improved feedback and engagement.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Permissions](#permissions)
- [Demo and Testing](#demo-and-testing)
- [Support](#support)

---

## Features
- Adds a **Dislike Button** to each answer and comment on Piazza posts.
- Tracks dislike counts and updates them dynamically.
- Provides an intuitive way to provide constructive feedback on Piazza responses.

## Installation
1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable **Developer Mode** in the top right.
4. Click on **Load unpacked** and select the extension's folder.
5. Once installed, the extension is active on any Piazza page.

## Permissions
The extension requests the following permissions:
- **`activeTab`**: To interact with the current Piazza tab and manipulate its content.
- **`storage`**: To store unique user IDs for dislike tracking.
- **Host Permissions**:
  - `*://*.piazza.com/*`: Required to access and modify Piazza pages.
  - `https://forum-dislike-extension.fly.dev/*`: Enables communication with the backend to store and retrieve dislike data.

These permissions are necessary to ensure the dislike functionality operates seamlessly and securely.

## Demo and Testing

The Chrome Web Store review team can test this extension by following the steps below.

### 1. Access the Demo User
Visit this [Piazza demo post](https://piazza.com/class/gw9jakygzvs616/post/359) to access the Piazza page and see the extension’s features in action.

### 2. Test the Features
- **Dislike Button**: Click the dislike button on any answer or comment to register your feedback. The count should update instantly.
- **Remove Dislike**: Click the dislike button again to remove your dislike. The count should decrease accordingly.
- **Persistent Dislike State**: The extension should remember dislikes based on user ID and maintain them on page reloads.

## Support
For any questions or troubleshooting, feel free to reach out via the support options provided in the Chrome Web Store listing.

---
