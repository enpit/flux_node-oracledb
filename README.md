# Flux + Node-OracleDB example application

The aim of this repository is to provide a working example of a [React](https://facebook.github.io/react/)/[Flux](https://github.com/facebook/flux) based application that uses an oracle database as storage. The database will be called using the [node-oracledb](https://github.com/oracle/node-oracledb) driver.

## Features

* Shows the TodoMVC app from [Flux](https://github.com/facebook/flux)
* Calls a webservice that is implemented in [another project](https://github.com/enpit/flux_node-oracledb.webservice)
 * The webservice communicates with an oracle database using [node-oracledb](https://github.com/oracle/node-oracledb)
 * If you don't have an Oracle XE database installed, just use a [docker container](https://registry.hub.docker.com/u/alexeiled/docker-oracle-xe-11g/)
* This project was built upon the [react-webpack-starter](https://github.com/krasimir/react-webpack-starter)
 * Read more about his launcher in his [blogpost](http://krasimirtsonev.com/blog/article/a-modern-react-starter-pack-based-on-webpack)

## Usage

This is still a WIP, but you can download, npm install and then npm run to use a local version of the todomvc app (no database functionality yet)
