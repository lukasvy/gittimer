# gittimer
Electron program that will count time spend on specific branch.

Time will be counted only on the repos that files were changed periodically. If no changes were made those branches and repos will not have their work time changed.

## Features
* count time spent on specific repo and branch and present it to the user in human readable form
* keep data stored in user folder so even when application is deleted data is kept safe
* watch file changes based on git diff to add time to only active repos and branches
* quick search through all branches right via list view

## Built With
* [Electron](https://www.electronjs.org/)
* [Vue](https://www.vuejs.org/)
* ❤

## Author
Lukas Vyslocky https://github.com/lukasvy

## To start 
* have the latest [NodeJs](https://nodejs.org/) installed
* have Git installed
* run > `npm install` to install dependency packages
* run > `npm run start` to start application

## To build 
* have latest [NodeJs](https://nodejs.org/) installed
* run > `npm install && npm run build`
* new directory should be created with name 'build', in it should be portable version for windows with name `GitTimer.exe`

## License

This project is under MIT.
See [LICENSE](https://github.com/lukasvy/gittimer/blob/master/LICENSE)