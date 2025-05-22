# VBCC Atari ST Extension for Visual Studio Code

This extension provides support for developing Atari ST applications using the VBCC compiler and Hatari emulator in Visual Studio Code.

## Features

- Compile C source files using VBCC with Atari ST (68k) target
- Run compiled programs directly in Hatari emulator
- Integrated error and warning messages in VSCode's Problems panel
- Quick commands for compilation and execution

## Requirements

Before using this extension, ensure you have:

1. VBCC compiler installed and configured with Atari ST (68k) backend
2. The `vc` frontend command available in your PATH
3. Hatari emulator installed and available in your PATH

## Usage

### Compiling C Files

1. Open a C source file in VSCode
2. Use one of these methods to compile:
   - Press `F1` and type "VBCC: Compile Current File"
   - Use the keyboard shortcut (if configured)
   - Right-click in the editor and select "VBCC: Compile Current File"

The compiler will create a .tos file in the same directory as your source file.

### Running Programs

After successful compilation:

1. Use one of these methods to run:
   - Press `F1` and type "VBCC: Run in Hatari"
   - Use the keyboard shortcut (if configured)
   - Right-click in the editor and select "VBCC: Run in Hatari"

This will launch your program in the Hatari emulator.

## Error Handling

Compilation errors and warnings will be:
- Displayed in the Problems panel
- Highlighted in the source code
- Shown in the output channel

## Extension Settings

This extension contributes the following commands:

* `vscode-vbcc.compile`: Compile the current C file using VBCC
* `vscode-vbcc.run`: Run the compiled program in Hatari

## Known Issues

- Make sure your VBCC environment variables are properly set
- Hatari must be properly configured for Atari ST emulation

## Release Notes

### 0.1.0

Initial release of VBCC Atari ST extension:
- Basic compilation support
- Hatari integration
- Error/warning detection

### 0.1.1

Added more commands:
- Build a file for TOS, TOS16, GEM and GEM16 configurations.
- Hatari integration with more intelligent path detection.
- Add exetution of make command for the project.

## Instructions to publish an VSCode extension:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension#publishing-extensions
