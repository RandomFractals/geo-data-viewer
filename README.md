# geo-data-viewer

[![Build Status](https://api.travis-ci.com/RandomFractals/geo-data-viewer.svg?branch-master)](https://github.com/RandomFractals/geo-data-viewer)
[![Apache-2.0 License](https://img.shields.io/badge/license-Apache2-orange.svg?color=green)](http://opensource.org/licenses/Apache-2.0)
<a href='https://ko-fi.com/dataPixy' target='_blank' title='support: https://ko-fi.com/dataPixy'>
  <img height='24' style='border:0px;height:20px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png?v=2' alt='https://ko-fi.com/dataPixy' /></a>

[![Version](https://img.shields.io/visual-studio-marketplace/v/RandomFractalsInc.geo-data-viewer.svg?color=orange&style=?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/RandomFractalsInc.geo-data-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/RandomFractalsInc.geo-data-viewer.svg?color=orange)](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer)

Geo Data Analytics tool for [VSCode](https://code.visualstudio.com/) IDE with [kepler.gl](https://kepler.gl) support to generate and view maps 🗺️  without any `Python` 🐍, `IPyWidgets` ⚙️, `pandas` 🐼, `Jupyter notebooks` 📚, or `ReactJS` ⚛️ app code.

![Geo Data Viewer](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer.png?raw=true
 "Geo Data Viewer")

![Geo Data Viewer Ultri Wide](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-ultri-wide.png?raw=true
 "Geo Data Viewer Ultri Wide")

# Features

- Map View 🗺️ for [GeoJSON](https://geojson.org/), [TopoJSON](https://github.com/topojson/topojson/wiki), [keplerg.gl JSON](https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map.md#supported-file-formats), [KML](https://developers.google.com/kml), [GPX](https://www.topografix.com/gpx.asp), [shapefiles](https://en.wikipedia.org/wiki/Shapefile), [FlatGeobuf](https://flatgeobuf.org), [IGC](https://xp-soaring.github.io/igc_file_format/igc_format_2008.html), [WKT](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry), and `CSV` geo data files
- Create `.geojson` file for `.topojson`, `.kml`, `.gpx`, `.fgb`, `.shp` `.prj` and `.dbf` shapefiles
- Dark and Light Map View 🗺️ Controls [UI Themes](https://github.com/RandomFractals/geo-data-viewer#configuration)
- Dark, Light, Satellite and Outdoors [Map Styles](https://github.com/RandomFractals/geo-data-viewer#configuration)
- [Map Gallery](https://github.com/RandomFractals/geo-data-viewer#map-gallery) with public [kepler.gl](https://kepler.gl/) map configs to try
- Save map 🗺️ in `html` format to share with others via Slack or email
- Save [kepler.gl JSON data and map config](https://github.com/RandomFractals/geo-data-viewer#supported-file-formats) for loading online via [kepler.gl demo app](https://kepler.gl/demo) or in this geo data tool
- Load map config or geo data from [kepler.gl demo app url](https://kepler.gl/demo?mapUrl=https://gist.githubusercontent.com/JesperDramsch/73a2f437cfc1e6e968cddfbb4793167f/raw/66550b932db2a93a495b3e362309e676b084991b/expat_keplergl.json), github repository, or [gists](https://gist.github.com/search?l=JSON&q=keplergl)
- View map from Starred ⭐️ Gists in [GistPad 📘](https://github.com/vsls-contrib/gistpad)
- View `CSV` and `JSON` data with [Data Preview 🈸](https://github.com/RandomFractals/vscode-data-preview) grid and charts 📊

# Usage

- Run `Geo: View Map` (`ctrl/cmd + alt + m`) command on an open geo data document to view 🗺️
- Use `Geo: View Map from Url` (`ctrl/cmd + alt + u`) command to load a map from [kepler.gl demo app](https://kepler.gl/demo?mapUrl=https://gist.githubusercontent.com/JesperDramsch/73a2f437cfc1e6e968cddfbb4793167f/raw/66550b932db2a93a495b3e362309e676b084991b/expat_keplergl.json), github repository, or a [gist](https://gist.github.com/search?l=JSON&q=keplergl)
- Run `Geo: Map Gallery` (`ctrl/cmd + alt + g`) command to view a list of built-in public keplergl map configs 🗺️

![Geo Data Viewer Gist](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-gist.png?raw=true
 "Geo Data Viewer Gist")

# Supported File Formats

See [kepler.gl file formats](https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map.md#supported-file-formats) documentation for the supported geo data files in addition to the geo data formats this extension provides for kepler.gl map 🗺️ views: [TopoJSON](https://github.com/topojson/topojson/wiki), [keplerg.gl JSON](https://github.com/keplergl/kepler.gl/blob/master/docs/user-guides/b-kepler-gl-workflow/a-add-data-to-the-map.md#supported-file-formats), [KML](https://developers.google.com/kml), [GPX](https://www.topografix.com/gpx.asp), [FlatGeobuf](https://flatgeobuf.org), [shapefiles](https://en.wikipedia.org/wiki/Shapefile), [IGC](https://xp-soaring.github.io/igc_file_format/igc_format_2008.html), [WKT](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry).

# Map Gallery

[Geo Data Viewer 🗺️ ](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer) comes with built-in [Map Gallery](https://github.com/RandomFractals/geo-data-viewer/tree/master/data) for data analysts and devs to try [kepler.gl](https://kepler.gl/) maps 🗺️ found in the wild 🌐:

![Geo Data Viewer Map Gallery](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-map-gallery.gif?raw=true
 "Geo Data Viewer Map Gallery")

**Note:** you can submit a PR with your [kepler.gl](https://kepler.gl/) maps 🗺️ data and config github repo or a  gist to be added to the [/data/README.md](https://github.com/RandomFractals/geo-data-viewer/tree/master/data) map gallery list.

# Installation

Install [Geo Data Viewer 🗺️](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.geo-data-viewer) via VSCode Extensions tab (`ctrl+shift+x`) by searching for `geo`, or via [VSCode marketplace search results](https://marketplace.visualstudio.com/search?term=geo&target=VSCode&category=All%20categories&sortBy=Relevance) in your browser.

Users of [VSCodium](https://vscodium.com/), [Azure Data Studio](https://github.com/microsoft/azuredatastudio), and other VSCode-based IDEs can install Geo Data Viewer 🗺️ using `.vsix` extension package attached to the Assets section in published [releases](https://github.com/RandomFractals/geo-data-viewer/releases) of this extension on github. Follow [install from .vsix](https://code.visualstudio.com/docs/editor/extension-marketplace#_install-from-a-vsix) instructions in your VSCode extensions compatible IDE or online container service to install it.

**Note:** VSCodium and other VSCode extension compatible IDE flavors are not officially supported as they require additional testing in those IDE variants.

# Contributions

List of Geo Data Viewer 🗺️ commands, keyboard shortcuts, augmented VSCode UI context menus, added geo data Language mappings, and supported geo data files:

![Geo Data Viewer Contributions](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-contributions.png?raw=true
 "Geo Data Viewer Contributions")

# Configuration
[Create User or Workspace Settings in vscode](http://code.visualstudio.com/docs/customization/userandworkspace#_creating-user-and-workspace-settings) to change default Geo Data Viewer 🗺️ extension Settings:

| Setting | Type | Default Value | Description |
| ------- | ---- | ------------- | ----------- |
| `geo.data.viewer.theme` | string | `dark` | Map View 🗺️ Controls UI Theme: `dark` or `light` |
| `geo.data.viewer.map.style` | string | `dark` | Default Map Style: `dark`, `light`, `muted` (light), `muted_night`, `satellite`, `dark_streets`, `light_streets`, `outdoors` |
| `geo.data.viewer.create.geojson` | boolean | `true` | Creates `.geojson` data file on disk for `topojson`, `kml`, `gpx`, `fgb` and `shp` map views |

![Geo Data Viewer Settings](https://github.com/RandomFractals/geo-data-viewer/blob/master/images/geo-data-viewer-settings.png?raw=true
 "Geo Data Viewer Settings")

# Recommended Extensions

Other [VSCode](https://code.visualstudio.com/) extensions Geo Data Viewer 🗺️ replaces, enhances or supplements for geo spatial analysis and working with geo data formats:

| Extension | Description |
| --- | --- |
| [Data Preivew 🈸](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-data-preview) | Data Preview 🈸 extension for importing 📤, viewing 🔎, slicing 🔪, dicing 🎲, charting 📊, and exporting 📥 large JSON array/config, YAML, Apache Arrow, Avro & Excel data files. |
| [Tabular Data Viewer  🀄](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.tabular-data-viewer) | Tabular Data Viewer provides fast DSV data loading and custom Table Views  🀄 for large local and remote .csv, .tsv and .tab data files with Tabulator Table, Perspective View, and D3FC Chart Views 📊📈. |
| [Data Table Renderers](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-data-table) | Data Table 🈸, Flat Data Grid 中, and Data Summary 🈷️ Renderers for VSCode Notebook 📓 Cell ⌗ Data Outputs. |
| [Leaflet 🍃 Map 🗺️](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-leaflet) | Leaflet 🍃 Map 🗺️ for Notebook 📓 Cell ⌗ Data Outputs. |
| [Vega Viewer 📈](https://marketplace.visualstudio.com/items?itemName=RandomFractalsInc.vscode-vega-viewer) | VSCode extension for Interactive Preview of Vega and Vega-Lite maps 🗺️ and graphs 📈. |
| [GistPad 📘](https://marketplace.visualstudio.com/items?itemName=vsls-contrib.gistfs) | VS Code extension for managing and sharing code snippets, notes and interactive samples using GitHub Gists. |
| [VSCode Map Preview](https://marketplace.visualstudio.com/items?itemName=jumpinjackie.vscode-map-preview) | VSCode extension for visually previewing geospatial file content (GeoJSON, KML, etc) on a map. |
| [Geo Tools](https://marketplace.visualstudio.com/items?itemName=SmartMonkey.geotools) | Geo Tools VSCode extension allows you to easily interact with geographical data. |
| [Hex Editor](https://marketplace.visualstudio.com/items?itemName=ms-vscode.hexeditor) | Allows Hex Editing inside VS Code. |

# Dev Log

See [#GeoDataViewer 🗺️ tag on Twitter](https://twitter.com/search?f=live&q=(%23GeoDataViewer)%20(from%3ATarasNovak)&src=typed_query) for the latest and greatest updates on this vscode extension development, new features, and usage statistics.

# Dev Build

```bash
$ git clone https://github.com/RandomFractals/geo-data-viewer
$ cd geo-data-viewer
$ npm install
$ code .
```
`F5` to launch Geo Data Viewer 🗺️ extension VSCode debug session.

# Support

Become a [Fan](https://github.com/sponsors/RandomFractals/sponsorships?tier_id=18883&preview=false) to sponsor our dev efforts on this and other [Random Fractals, Inc.](https://twitter.com/search?q=%23RandomFractalsInc&src=typed_query&f=live) code and [data viz extensions](https://marketplace.visualstudio.com/publishers/RandomFractalsInc) if you find them useful, educational, or enhancing your daily dataViz dev code workflows and geo spatial analysis:

☕️ https://ko-fi.com/dataPixy 💖 https://github.com/sponsors/RandomFractals