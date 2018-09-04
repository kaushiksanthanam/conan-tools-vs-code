# Conan-Tools

Welcome to the VS Code extension for conan tools!

Conan tools enable developers working on conan based C++ projects to use Visual Studio Code for their development.

This extension activates automatically when a workspace contains a `conanfile.py`


## Features
---
### Install conan dependencies
![Installing](/resources/media/installation.gif?raw=true)

---
### Build conan based projects
![Building](/resources/media/building.gif?raw=true)

---
### View Nested Conan Dependencies
![View](/resources/media/view_dependencies.gif?raw=true)

---
### Custom install and build commands tailored for each workspace
![Custom](/resources/media/custom_install_command.gif?raw=true)


## Requirements

Conan version >= 1.0.0 

`pip install conan==1.0.0`

## Extension Settings

This extension contributes the following settings to workspace settings:

* `conan.installCommand`: custom install command to be used for the workspace
* `conan.buildCommand`: custom build command to be used for the workspace


### 0.1.0

Initial release of conan-tools
