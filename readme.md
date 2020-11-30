# Mysterium Calendar

This is a set of JS functions for the schedule page on the Mysterium website. It pairs with the Wordpress Simple Calendar plugin, adding dynamic highlighting of current and past events, plus client-side time zone selection

## Usage

These files are added to the site and included in any necessary pages.
* mysterium_calendar.js will auto-update every 60 seconds to gray out events that have already occurred and highlight any current event(s). calendar.css should be used on any page that utilizes this JS file.
* mysterium_timezone_select.js allows users to display the schedule in their local time zone. It'll also detect the client time zone on page load and suggest its selection.