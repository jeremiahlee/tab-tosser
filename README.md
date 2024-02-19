# Tab Tosser

Tab Tosser is a browser extension that automatically closes tabs you have ignored for too long.

- [Project home](https://www.jeremiahlee.com/tab-tosser/)
- [Install from Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tab-tosser/)

Once upon a time, I accidentally reset my browser. I lost over 100 open tabs and my browsing history. I panicked. After a moment, I realized I had not really lost anything. I could search and find any website I had open. And if I couldn't remember enough about the page to search for, I didn't really lose anything.

I created Tab Tosser to help free myself of digital clutter.

## Features

- Configurable length of time a tab must be ignored before closing
- Only runs when browser is idle
- Vacation detection ensures you don't lose tabs when you're away from keyboard
- The last 1,000 tabs closed by Tab Tosser are logged to the extension settings page just in case. They are kept for as long as they were ignored. Tabs from private windows are not logged. The list can be cleared on demand.
- A count of how many tabs Tab Tosser has freed you from is kept
- Privacy by design: almost no data stored and what is stored never leaves your device
- Pinned tabs are never closed by Tab Tosser

## Explanation of permissions

These are the permissions specified in manifest.json and the justification for requesting them.

- `idle`: Tab Tosser must know when the device is inactive in order for it to not interfere with higher priority usage of the browser.
- `storage`: Tab Tosser must store its configuration settings and closed tab history to be able to function.
- `tabs`: Tab Tosser must be able to access information about tabs and be able to close them to be able to provide value.

## Build instructions

Building and testing requires Node.js. The version is noted in `package.json`. I use macOS 14.

To build: `npm run build`

To test: `npm run test`

To distribute: Bump the version number in package.json and src/manifest.json, then `npm run release`

## Firefox Add-ons submission

Mozilla [requires](https://extensionworkshop.com/documentation/publish/source-code-submission/) submitting the source code alongside the build artifact because Tab Tosser uses TypeScript and Tailwind CSS, which generate the code used in the distributed extension.

Note for Mozilla Add-on review: The _Unsafe assignment to innerHTML_ warning is incorrect. The input is santized by `formatPageTitle()` in `lib/utils.js` when being stored by `removeTabs()` in `lib/open-tabs.js`.

## Copyright

©2019–2024 Jeremiah Lee. [European Union Public License 1.1](LICENSE.md)

“Tab Tosser” and the tab hat smiley face are trademarks of Jeremiah Lee.
