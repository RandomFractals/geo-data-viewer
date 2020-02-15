# geo-data-viewer

[![Build Status](https://travis-ci.org/HoangNguyen17193/vscode-simple-rest-client.svg?branch=master)](https://travis-ci.com/RandomFractals/geo-data-viewer)
[![Apache-2.0 License](https://img.shields.io/badge/license-Apache2-orange.svg?color=green)](http://opensource.org/licenses/Apache-2.0)
<a href='https://ko-fi.com/dataPixy' target='_blank' title='support: https://ko-fi.com/dataPixy'>
  <img height='24' style='border:0px;height:20px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=2' alt='https://ko-fi.com/dataPixy' /></a>

[![Version](https://vsmarketplacebadge.apphb.com/version/RandomFractalsInc.geo-data-viewer.svg?color=orange&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/RandomFractalsInc.geo-data-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)
[![Downloads](https://vsmarketplacebadge.apphb.com/downloads/RandomFractalsInc.geo-data-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)

🗺️ Geo Data Analytics tool for [VSCode](https://code.visualstudio.com/) with [kepler.gl](https://kepler.gl) to gen. some snazzy 🗺️s  w/0 `Py` 🐍 || `pyWidgets` || `pandas` 🐼 || `@reactjs` ⚛️ required ...

![Geo Data Viewer](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer.png?raw=true 
 "Geo Data Viewer")

# Features

- Map View 🗺️ for [GeoJSON](https://geojson.org/), [keplerg.gl JSON](https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map.md#supported-file-formats) and CSV geo data files
- Map Gallery with public kepler.gl map configs to try
- Save map in html, JSON data and map config formats
- Load map config from [kepler.gl demo app url](https://kepler.gl/demo?mapUrl=https://gist.githubusercontent.com/JesperDramsch/73a2f437cfc1e6e968cddfbb4793167f/raw/66550b932db2a93a495b3e362309e676b084991b/expat_keplergl.json) or [gists](https://gist.github.com/search?l=JSON&q=keplergl)
- View map from ⭐️ Starred Gists in [GistPad 📘](https://github.com/vsls-contrib/gistpad)
- View CSV and JSON data with [Data Preview 🈸](https://github.com/RandomFractals/vscode-data-preview) grid and charts 📊

# Usage 

- Run `Geo: View Map` (`ctrl/cmd + alt + m`) command on an open geo data document to view 🗺️
- Use `Geo: View Map from Url` (`ctrl/cmd + alt + u`) command to load a map from [kepler.gl demo app](https://kepler.gl/demo?mapUrl=https://gist.githubusercontent.com/JesperDramsch/73a2f437cfc1e6e968cddfbb4793167f/raw/66550b932db2a93a495b3e362309e676b084991b/expat_keplergl.json) or [gist](https://gist.github.com/search?l=JSON&q=keplergl)
- Run `Geo: Map Gallery` (`ctrl/cmd + alt + g`) command to view a list of public keplergl map configs 🗺️

![Geo Data Viewer Gist](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-gist.png?raw=true 
 "Geo Data Viewer Gist")

# Supported File Formats

See [kepler.gl file formats](https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map.md#supported-file-formats) documentation for the supported geo data files.

# Map Gallery

[Geo Data Viewer 🗺️ ](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer) comes with a built-in map gallery for devs to try [kepler.gl](https://kepler.gl/) maps 🗺️ found in the wild 🌐:

![Geo Data Viewer Map Gallery Quick Pick List](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-map-gallery-quick-pick-list.png?raw=true 
 "Geo Data Viewer Map Gallery Quick Pick List")

**Note:** if you'd like to see your public [keplerg.gl](https://kepler.gl/) map config featured in our maps gallery, please post a link to your [kepler.gl](https://kepler.gl/) maps 🗺️ data & config github repo || gist in ticket [#39](https://github.com/RandomFractals/geo-data-viewer/issues/39)

# Installation

Install [Geo Data Viewer 🗺️ ](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer) via vscode Extensions tab (`Ctrl+Shift+X`) by searching for `keplerGL`|| via [VSCode marketplace search results](https://marketplace.visualstudio.com/search?term=keplergl&target=VSCode&category=All%20categories&sortBy=Relevance). It's the only 1 out there! ;)

List of the Geo Data Viewer 🗺️ commands, keyboard shortcuts, augmented vscode UI context menus, added geo data Language mappings and supported geo data files:

![Geo Data Viewer Contributions](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-contributions.png?raw=true 
 "Geo Data Viewer Contributions")

# Recommended Extensions

Other extensions Geo Data Viewer 🗺️ replaces, enhances or supplements for working with geo data formats in [VSCode](https://code.visualstudio.com/):

| Extension | Description |
| --- | --- |
| [Data Preivew 🈸](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-data-preview) | Data Preview 🈸 extension for importing 📤 viewing 🔎 slicing 🔪 dicing 🎲 charting 📊 & exporting 📥 large JSON array/config, YAML, Apache Arrow, Avro & Excel data files |
| [GistPad 📘](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistfs) | VS Code extension for managing and sharing code snippets, notes and interactive samples using GitHub Gists |
| [VSCode Map Preview](https://marketplace.visualstudio.com/items?itemName=jumpinjackie.vscode-map-preview) | VSCode extension for visually previewing geospatial file content (GeoJSON, KML, etc) on a map |
| [Geo Tools](https://marketplace.visualstudio.com/items?itemName=SmartMonkey.geotools) | Geo Tools VSCode extension allows you to easily interact with geographical data |

# Dev Log

See [#GeoDataViewer 🗺️ tag on Twitter](https://twitter.com/hashtag/GeoDataViewer) for the latest & greatest updates on this vscode extension & what's in store next.

# Dev Build

```bash
$ git clone https://github.com/RandomFractals/geo-data-viewer
$ cd geo-data-viewer
$ npm install
$ code .
```
`F5` to launch Geo Data Viewer 🗺️ extension VSCode debug session.

# Contributions

Any & all test, code || feedback contributions are welcome. 

Open an issue || create a pull request to make this Geo Data Viewer 🗺️ vscode extension work better for all. 🤗
