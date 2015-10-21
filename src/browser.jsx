'use strict';

import './util/polyfill'; // first import polyfills
import React from 'react';
import httpClient from 'axios';

/*
  Example which fetches a list of items from a REST api
  and renders it to the screen. Also logs and renders
  renders the error message if one occurs.
 */

 var TodoApp = require('./components/TodoApp.react');

 React.render(
   <TodoApp />,
   document.querySelector('#appContainer')
 );
 
