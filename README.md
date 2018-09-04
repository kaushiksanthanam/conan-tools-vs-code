# CONAN-TOOLS

Welcome to the VS Code extension for conan tools!

Conan tools enable developers working on conan based C++ projects to use Visual Studio Code for their development.

This extension activates automatically when a workspace contains a `conanfile.py`


## Features
---
### Install conan dependencies
![](https://github.com/kaushiksanthanam/conan-tools-vs-code/resources/media/installation.gif)

---
### Build conan based projects
![](https://github.com/kaushiksanthanam/conan-tools-vs-code/resources/media/building.gif)

---
### View Nested Conan Dependencies
![](https://github.com/kaushiksanthanam/conan-tools-vs-code/resources/media/view_dependencies.gif)

---
### Custom install and build commands tailored for each workspace
![](https://github.com/kaushiksanthanam/conan-tools-vs-code/resources/media/custom_install_command.gif)


## Requirements

Conan version >= 1.0.0 

`pip install conan==1.0.0`

## Extension Settings

This extension contributes the following settings to workspace settings:

* `conan.installCommand`: custom install command to be used for the workspace
* `conan.buildCommand`: custom build command to be used for the workspace


### 0.1.0

Initial release of conan-tools
