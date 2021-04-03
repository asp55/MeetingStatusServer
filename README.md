# MeetingStatusServer
A separate standalone websocket server for [WatchForMeeting](https://github.com/asp55/WatchForMeeting)

![Demo Video Showing The Front End in Action: 2 rooms toggling between free/busy, with their mics and video turning on and off](https://github.com/asp55/MeetingStatusServer/blob/main/.documentation/demo.gif?raw=true)

# Installation
Clone this repo and run
```
npm install
npm link
```

# Usage
This server runs as a command line utility.

```
Name: 
  MeetingStatusServer

Commands:
  [options]        the default command, starts the server              [default]
  rooms add <name>     Generate a room key
  rooms list           Show the list of rooms & keys
  rooms remove <key>   Remove a key

Options:
      --help     Show help                                             [boolean]
      --version  Show version number                                   [boolean]
  -p, --port     Port to run the server on              [number] [default: 8080]
```

# Creating a room
There are 2 ways to create a room:
1) Using the command line: `MeetingStatusServer rooms add [name of your room]`
2) Via the web interface.

# Running as a service on a raspberry pi server

Use the installation instructions above.

Assuming you cloned the repo into the home directory of user pi: `/home/pi/MeetingStatusServer/` (Otherwise adjust accordingly)

Create a file `/etc/systemd/system/meeting-status-server.service` containing:

```
[Unit]
Description=MeetingStatusServer
Wants=network-online.target
After=syslog.target network-online.target

[Service]
Type=simple
User=pi
PermissionsStartOnly=true
WorkingDirectory=/home/pi/MeetingStatusServer/
ExecStart=/usr/local/bin/MeetingStatusServer
Restart=always
RestartSec=3
KillMode=process

[Install]
WantedBy=multi-user.target
```


Start it using following command:
```
sudo systemctl start meeting-status-server.service
```


Stop it using following command:
```
sudo systemctl stop meeting-status-server.service
```

Assuming everything works, you can have it start automatically on reboot by using this command:
```
sudo systemctl enable meeting-status-server.service
```