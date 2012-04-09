# Facebook Friend Picker Widget #

## Overview ##

This is a jQuery UI widget for selecting friends from Facebook. It extends the core ui.dialog widget, so it inherits all the options, events and methods.

### Options ###

<table width="100%">
  <thead>
    <tr align="left">
      <th>Option</th>
      <th>Description</th>
      <th>Type</th>
      <th>Default</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>urlFacebookScript</td>
      <td>URL of Facebook library to load</td>
      <td>string</td>
      <td>http://connect.facebook.net/en_US/all.js</td>
    </tr>
    <tr>
      <td>appId</td>
      <td>Facebook App ID</td>
      <td>string</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td>singleSelect</td>
      <td>if true, the widget will only allow a single friend to be selected </td>
      <td>boolean</td>
      <td>false</td>
    </tr>
    <tr>
      <td>preSelected</td>
      <td>List of Facebook IDs to preselect</td>
      <td>array</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td>groups</td>
      <td>List of groups of friends to display as a dropdown. This can be used as a filter to only display certain groups of friends. The object keys are the name of the group. The value of each key is an array of Facebook user IDs</td>
      <td>object</td>
      <td>undefined</td>
    </tr>
    <tr>
      <td>loadingClass</td>
      <td>CSS class name to be applied to dialog on load</td>
      <td>string</td>
      <td>loading</td>
    </tr>
    </tbody>
  </table>
